-- Inventory management, stock on purchase, payment history

-- Payment status on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial_refund', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Item-level status for returns / replacements / cancellations
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_status TEXT NOT NULL DEFAULT 'active';

DO $$ BEGIN
  ALTER TABLE order_items ADD CONSTRAINT order_items_item_status_check
    CHECK (item_status IN ('active', 'returned', 'replaced', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payment history log
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory movement audit trail
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  change_qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage payment_history" ON payment_history;
CREATE POLICY "Admin can manage payment_history"
  ON payment_history FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Users view own payment history" ON payment_history;
CREATE POLICY "Users view own payment history"
  ON payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = payment_history.order_id
      AND (o.user_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Admin can view inventory movements" ON inventory_movements;
CREATE POLICY "Admin can view inventory movements"
  ON inventory_movements FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can insert inventory movements" ON inventory_movements;
CREATE POLICY "Admin can insert inventory movements"
  ON inventory_movements FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update order items" ON order_items;
CREATE POLICY "Admin can update order items"
  ON order_items FOR UPDATE USING (is_admin());

-- Place order and reduce stock atomically
CREATE OR REPLACE FUNCTION place_order_with_stock(
  p_user_id UUID,
  p_total DECIMAL,
  p_address JSONB,
  p_payment_method TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_qty INTEGER;
  v_stock INTEGER;
  v_price DECIMAL;
  v_order_item_id UUID;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    SELECT stock INTO v_stock FROM products WHERE id = v_product_id FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found';
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %',
        COALESCE(v_item->>'product_name', 'item'), v_stock, v_qty;
    END IF;
  END LOOP;

  INSERT INTO orders (user_id, status, total, address, payment_method, payment_status)
  VALUES (p_user_id, 'pending', p_total, p_address, COALESCE(p_payment_method, 'cod'), 'pending')
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price')::DECIMAL;

    INSERT INTO order_items (
      order_id, product_id, product_name, size, color, quantity, price, image_url, item_status
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_item->>'product_name',
      NULLIF(v_item->>'size', ''),
      NULLIF(v_item->>'color', ''),
      v_qty,
      v_price,
      NULLIF(v_item->>'image_url', ''),
      'active'
    )
    RETURNING id INTO v_order_item_id;

    UPDATE products SET stock = stock - v_qty WHERE id = v_product_id;

    INSERT INTO inventory_movements (product_id, order_id, order_item_id, change_qty, reason)
    VALUES (v_product_id, v_order_id, v_order_item_id, -v_qty, 'sale');
  END LOOP;

  INSERT INTO payment_history (order_id, amount, payment_method, payment_status, notes)
  VALUES (v_order_id, p_total, COALESCE(p_payment_method, 'cod'), 'pending', 'Order placed');

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION place_order_with_stock(UUID, DECIMAL, JSONB, TEXT, JSONB) TO anon, authenticated;

-- Update single order item status with stock adjustment
CREATE OR REPLACE FUNCTION update_order_item_status(
  p_item_id UUID,
  p_new_status TEXT
) RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
  v_product_id UUID;
  v_qty INTEGER;
  v_order_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF p_new_status NOT IN ('active', 'returned', 'replaced', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid item status';
  END IF;

  SELECT item_status, product_id, quantity, order_id
  INTO v_old_status, v_product_id, v_qty, v_order_id
  FROM order_items WHERE id = p_item_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order item not found';
  END IF;

  IF v_old_status = p_new_status THEN
    RETURN;
  END IF;

  IF p_new_status IN ('returned', 'cancelled') AND v_old_status IN ('active', 'replaced') THEN
    IF v_product_id IS NOT NULL THEN
      UPDATE products SET stock = stock + v_qty WHERE id = v_product_id;
      INSERT INTO inventory_movements (product_id, order_id, order_item_id, change_qty, reason)
      VALUES (v_product_id, v_order_id, p_item_id, v_qty, p_new_status);
    END IF;
  END IF;

  IF p_new_status = 'active' AND v_old_status IN ('returned', 'cancelled') THEN
    IF v_product_id IS NOT NULL THEN
      UPDATE products SET stock = GREATEST(stock - v_qty, 0) WHERE id = v_product_id;
      INSERT INTO inventory_movements (product_id, order_id, order_item_id, change_qty, reason)
      VALUES (v_product_id, v_order_id, p_item_id, -v_qty, 'reactivate');
    END IF;
  END IF;

  UPDATE order_items SET item_status = p_new_status WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION update_order_item_status(UUID, TEXT) TO authenticated;

-- Cancel entire order and restore stock for active items
CREATE OR REPLACE FUNCTION cancel_order_with_stock(p_order_id UUID) RETURNS VOID AS $$
DECLARE
  v_item RECORD;
  v_total DECIMAL;
  v_payment_method TEXT;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  FOR v_item IN
    SELECT id, item_status FROM order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.item_status = 'active' THEN
      PERFORM update_order_item_status(v_item.id, 'cancelled');
    END IF;
  END LOOP;

  SELECT total, payment_method INTO v_total, v_payment_method FROM orders WHERE id = p_order_id;

  UPDATE orders SET status = 'cancelled', payment_status = 'refunded' WHERE id = p_order_id;

  INSERT INTO payment_history (order_id, amount, payment_method, payment_status, notes)
  VALUES (p_order_id, v_total, COALESCE(v_payment_method, 'cod'), 'refunded', 'Order cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION cancel_order_with_stock(UUID) TO authenticated;

-- Record payment (e.g. COD collected on delivery)
CREATE OR REPLACE FUNCTION record_order_payment(
  p_order_id UUID,
  p_payment_status TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_total DECIMAL;
  v_payment_method TEXT;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF p_payment_status NOT IN ('pending', 'paid', 'refunded', 'partial_refund', 'failed') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;

  SELECT total, payment_method INTO v_total, v_payment_method FROM orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  UPDATE orders SET payment_status = p_payment_status WHERE id = p_order_id;

  INSERT INTO payment_history (order_id, amount, payment_method, payment_status, notes)
  VALUES (
    p_order_id,
    v_total,
    COALESCE(v_payment_method, 'cod'),
    p_payment_status,
    COALESCE(p_notes, 'Payment status updated')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION record_order_payment(UUID, TEXT, TEXT) TO authenticated;
