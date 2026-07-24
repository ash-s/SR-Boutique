-- Fix admin orders visibility (guest + customer orders)
-- Run in Supabase SQL Editor

-- Explicit admin SELECT on orders (includes guest orders where user_id IS NULL)
DROP POLICY IF EXISTS "Users view own orders" ON orders;
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;

CREATE POLICY "orders_select_own_or_admin" ON orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_admin()
  );

-- Admin can view all order items
DROP POLICY IF EXISTS "Order items viewable with order access" ON order_items;
DROP POLICY IF EXISTS "order_items_select" ON order_items;

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR is_admin())
    )
  );

-- Reliable admin orders fetch (works even if RLS misconfigured)
CREATE OR REPLACE FUNCTION admin_get_all_orders()
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json)
  FROM (
    SELECT
      o.*,
      (
        SELECT json_agg(oi ORDER BY oi.product_name)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS order_items
    FROM orders o
    WHERE is_admin()
    ORDER BY o.created_at DESC
  ) t;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION admin_get_all_orders() TO authenticated;
