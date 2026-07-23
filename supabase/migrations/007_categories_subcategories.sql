-- Categories hierarchy, product fields, addresses, wishlist, order fixes, sample data

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Saved addresses
CREATE TABLE IF NOT EXISTS saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_addresses" ON saved_addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_manage_own_wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Guest order confirmation (order success page)
CREATE OR REPLACE FUNCTION get_public_order(order_id UUID)
RETURNS JSON AS $$
  SELECT row_to_json(o) FROM (
    SELECT o.*,
      (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id = o.id) AS order_items
    FROM orders o
    WHERE o.id = order_id
    AND o.created_at > NOW() - INTERVAL '30 days'
  ) o;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_public_order(UUID) TO anon, authenticated;

-- Fix guest order SELECT for logged-in users viewing their orders
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (o.user_id = auth.uid() OR is_admin() OR o.user_id IS NULL)
  )
);

-- Main categories: Men, Women, Kids, Accessories
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
  ('Men', 'men', NULL, 1),
  ('Women', 'women', NULL, 2),
  ('Kids', 'kids', NULL, 3),
  ('Accessories', 'accessories', NULL, 4)
ON CONFLICT (slug) DO UPDATE SET parent_id = NULL, sort_order = EXCLUDED.sort_order;

-- Subcategories for Men
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT v.name, v.slug, p.id, v.ord FROM (VALUES
  ('Shirts', 'men-shirts', 1),
  ('T-Shirts', 'men-tshirts', 2),
  ('Pants', 'men-pants', 3),
  ('Jeans', 'men-jeans', 4),
  ('Kurtas', 'men-kurtas', 5),
  ('Innerwear', 'men-innerwear', 6),
  ('Shorts', 'men-shorts', 7)
) AS v(name, slug, ord)
CROSS JOIN categories p WHERE p.slug = 'men'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- Subcategories for Women
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT v.name, v.slug, p.id, v.ord FROM (VALUES
  ('Sarees', 'women-sarees', 1),
  ('Kurtis', 'women-kurtis', 2),
  ('Tops', 'women-tops', 3),
  ('Dresses', 'women-dresses', 4),
  ('Jeans', 'women-jeans', 5),
  ('Leggings', 'women-leggings', 6),
  ('Innerwear', 'women-innerwear', 7)
) AS v(name, slug, ord)
CROSS JOIN categories p WHERE p.slug = 'women'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- Subcategories for Kids
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT v.name, v.slug, p.id, v.ord FROM (VALUES
  ('Boys Clothing', 'kids-boys', 1),
  ('Girls Clothing', 'kids-girls', 2),
  ('Infants', 'kids-infants', 3),
  ('School Wear', 'kids-school', 4)
) AS v(name, slug, ord)
CROSS JOIN categories p WHERE p.slug = 'kids'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- Subcategories for Accessories
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT v.name, v.slug, p.id, v.ord FROM (VALUES
  ('Bags', 'acc-bags', 1),
  ('Belts', 'acc-belts', 2),
  ('Jewellery', 'acc-jewellery', 3),
  ('Watches', 'acc-watches', 4),
  ('Sunglasses', 'acc-sunglasses', 5)
) AS v(name, slug, ord)
CROSS JOIN categories p WHERE p.slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
