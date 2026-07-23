-- Fix RLS permissions, missing profile columns, guest checkout, and admin access
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query → Run)

-- 1. Add missing profile columns (fixes 400 errors on profile update)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles (username) WHERE username IS NOT NULL;

-- 2. Fix is_admin() to reliably bypass RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Profiles policies (fix 403 on profile read/update)
DROP POLICY IF EXISTS "Public profiles viewable by owner and admin" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

-- 4. Products policies (fix 403 on add product)
DROP POLICY IF EXISTS "Active products viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (is_admin());

-- 5. Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (is_admin());

-- 6. Product images policies
DROP POLICY IF EXISTS "Product images viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Admin can manage product images" ON product_images;
DROP POLICY IF EXISTS "product_images_select_all" ON product_images;
DROP POLICY IF EXISTS "product_images_insert_admin" ON product_images;
DROP POLICY IF EXISTS "product_images_update_admin" ON product_images;
DROP POLICY IF EXISTS "product_images_delete_admin" ON product_images;

CREATE POLICY "product_images_select_all" ON product_images FOR SELECT USING (true);

CREATE POLICY "product_images_insert_admin" ON product_images
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "product_images_update_admin" ON product_images
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "product_images_delete_admin" ON product_images
  FOR DELETE USING (is_admin());

-- 7. Guest checkout — allow order items for guest orders (user_id IS NULL)
DROP POLICY IF EXISTS "Users can insert order items for own orders" ON order_items;

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id IS NULL
        OR o.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

-- 8. Storage policies (product image uploads)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- 9. Re-grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 10. MAKE YOURSELF ADMIN — replace YOUR_USER_ID with your UUID from Authentication → Users
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
