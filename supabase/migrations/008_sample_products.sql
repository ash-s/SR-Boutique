-- Sample products across Men, Women, Kids, Accessories (run after 007)

DO $$
DECLARE
  pid UUID;
  img TEXT;
BEGIN
  -- Men Shirts
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'classic-cotton-shirt%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Classic Cotton Shirt', 'classic-cotton-shirt-sample',
      'Breathable cotton shirt for daily wear. Regular fit, easy to style.',
      899, 699,
      (SELECT id FROM categories WHERE slug = 'men'),
      (SELECT id FROM categories WHERE slug = 'men-shirts'),
      'SR Boutique', 'Cotton', ARRAY['S','M','L','XL'], ARRAY['White','Blue','Black'], 30, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1596755094514-f87e34085b56?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Men T-Shirts
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'premium-round-neck-tee%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Premium Round Neck Tee', 'premium-round-neck-tee-sample',
      'Soft jersey tee with a modern slim fit.',
      499, NULL,
      (SELECT id FROM categories WHERE slug = 'men'),
      (SELECT id FROM categories WHERE slug = 'men-tshirts'),
      'Urban Fit', 'Cotton', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Grey','Navy'], 50, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Men Jeans
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'slim-fit-denim-jeans%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Slim Fit Denim Jeans', 'slim-fit-denim-jeans-sample',
      'Stretch denim jeans with a clean slim silhouette.',
      1499, 1199,
      (SELECT id FROM categories WHERE slug = 'men'),
      (SELECT id FROM categories WHERE slug = 'men-jeans'),
      'Classic Wear', 'Denim', ARRAY['30','32','34','36'], ARRAY['Blue','Black'], 20, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Women Kurtis
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'floral-print-kurti%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Floral Print Kurti', 'floral-print-kurti-sample',
      'Lightweight kurti with elegant floral print. Perfect for casual outings.',
      799, 599,
      (SELECT id FROM categories WHERE slug = 'women'),
      (SELECT id FROM categories WHERE slug = 'women-kurtis'),
      'SR Boutique', 'Rayon', ARRAY['S','M','L','XL'], ARRAY['Pink','Blue','Green'], 35, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1583496661160-fb2886a0aaaa?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Women Dress
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'evening-maxi-dress%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Evening Maxi Dress', 'evening-maxi-dress-sample',
      'Flowy maxi dress for parties and special occasions.',
      1899, 1499,
      (SELECT id FROM categories WHERE slug = 'women'),
      (SELECT id FROM categories WHERE slug = 'women-dresses'),
      'Style Hub', 'Polyester', ARRAY['S','M','L'], ARRAY['Red','Black','Beige'], 15, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Women Tops
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'casual-crop-top%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Casual Crop Top', 'casual-crop-top-sample',
      'Trendy crop top to pair with high-waist jeans or skirts.',
      449, NULL,
      (SELECT id FROM categories WHERE slug = 'women'),
      (SELECT id FROM categories WHERE slug = 'women-tops'),
      'Urban Fit', 'Cotton', ARRAY['S','M','L'], ARRAY['White','Yellow','Pink'], 40, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Kids Boys
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'boys-graphic-tee%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Boys Graphic Tee', 'boys-graphic-tee-sample',
      'Fun graphic t-shirt for active kids. Soft and durable.',
      349, 299,
      (SELECT id FROM categories WHERE slug = 'kids'),
      (SELECT id FROM categories WHERE slug = 'kids-boys'),
      'Comfort Line', 'Cotton', ARRAY['4-5Y','6-7Y','8-9Y','10-11Y'], ARRAY['Blue','Red','Green'], 45, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1503454537844-156a7ef3b0e2?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Kids Girls
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'girls-party-frock%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Girls Party Frock', 'girls-party-frock-sample',
      'Pretty frock for birthdays and celebrations.',
      699, 549,
      (SELECT id FROM categories WHERE slug = 'kids'),
      (SELECT id FROM categories WHERE slug = 'kids-girls'),
      'SR Boutique', 'Blend', ARRAY['4-5Y','6-7Y','8-9Y'], ARRAY['Pink','Purple','White'], 25, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1519238263530-9822c6feec74?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Accessories Bag
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'leather-crossbody-bag%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Leather Crossbody Bag', 'leather-crossbody-bag-sample',
      'Compact crossbody bag with adjustable strap.',
      1299, 999,
      (SELECT id FROM categories WHERE slug = 'accessories'),
      (SELECT id FROM categories WHERE slug = 'acc-bags'),
      'Style Hub', 'Blend', ARRAY['Free Size'], ARRAY['Brown','Black','Beige'], 18, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1548039186-95b3854e0c04?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Accessories Watch
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'minimal-analog-watch%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Minimal Analog Watch', 'minimal-analog-watch-sample',
      'Sleek analog watch with stainless steel finish.',
      1999, NULL,
      (SELECT id FROM categories WHERE slug = 'accessories'),
      (SELECT id FROM categories WHERE slug = 'acc-watches'),
      'Classic Wear', 'Blend', ARRAY['Free Size'], ARRAY['Silver','Gold','Black'], 12, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Men Innerwear
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'cotton-trunk-pack%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Cotton Trunk Pack (3)', 'cotton-trunk-pack-sample',
      'Pack of 3 breathable cotton trunks.',
      599, 449,
      (SELECT id FROM categories WHERE slug = 'men'),
      (SELECT id FROM categories WHERE slug = 'men-innerwear'),
      'Comfort Line', 'Cotton', ARRAY['M','L','XL'], ARRAY['Black','Grey','Navy'], 60, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;

  -- Women Saree
  IF NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE 'silk-blend-saree%') THEN
    INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
    VALUES (
      'Silk Blend Saree', 'silk-blend-saree-sample',
      'Elegant saree with subtle zari border.',
      2499, 1999,
      (SELECT id FROM categories WHERE slug = 'women'),
      (SELECT id FROM categories WHERE slug = 'women-sarees'),
      'SR Boutique', 'Silk', ARRAY['Free Size'], ARRAY['Maroon','Green','Blue'], 10, true
    ) RETURNING id INTO pid;
    img := 'https://images.unsplash.com/photo-1610030469660-20a1ba1501c5?w=600&h=800&fit=crop&auto=format';
    INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, img, 0);
  END IF;
END $$;
