-- Seed one sample product per subcategory (run after 007; safe to re-run)

CREATE OR REPLACE FUNCTION seed_sample_product(
  p_slug TEXT,
  p_name TEXT,
  p_desc TEXT,
  p_price NUMERIC,
  p_sale NUMERIC,
  p_cat_slug TEXT,
  p_sub_slug TEXT,
  p_brand TEXT,
  p_material TEXT,
  p_sizes TEXT[],
  p_colors TEXT[],
  p_img TEXT
) RETURNS VOID AS $$
DECLARE
  pid UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM products WHERE slug = p_slug) THEN
    RETURN;
  END IF;

  INSERT INTO products (name, slug, description, price, sale_price, category_id, subcategory_id, brand, material, sizes, colors, stock, is_active)
  VALUES (
    p_name, p_slug, p_desc, p_price, p_sale,
    (SELECT id FROM categories WHERE slug = p_cat_slug LIMIT 1),
    (SELECT id FROM categories WHERE slug = p_sub_slug LIMIT 1),
    p_brand, p_material, p_sizes, p_colors, 25, true
  ) RETURNING id INTO pid;

  INSERT INTO product_images (product_id, image_url, sort_order) VALUES (pid, p_img, 0);
END;
$$ LANGUAGE plpgsql;

-- Men
SELECT seed_sample_product('men-formal-shirt-sample', 'Formal Cotton Shirt', 'Crisp formal shirt for office and events.', 999, 799, 'men', 'men-shirts', 'SR Boutique', 'Cotton', ARRAY['S','M','L','XL'], ARRAY['White','Blue'], 'https://images.unsplash.com/photo-1596755094514-f87e34085b56?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-round-tee-sample', 'Round Neck T-Shirt', 'Soft everyday tee with breathable fabric.', 499, NULL, 'men', 'men-tshirts', 'Urban Fit', 'Cotton', ARRAY['S','M','L','XL'], ARRAY['Black','Grey'], 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-chino-pants-sample', 'Chino Trousers', 'Smart casual chinos with comfortable fit.', 1299, 999, 'men', 'men-pants', 'Classic Wear', 'Cotton', ARRAY['30','32','34','36'], ARRAY['Beige','Navy'], 'https://images.unsplash.com/photo-1473966968600-fa801b279a01?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-slim-jeans-sample', 'Slim Fit Jeans', 'Stretch denim with modern slim cut.', 1499, 1199, 'men', 'men-jeans', 'Classic Wear', 'Denim', ARRAY['30','32','34'], ARRAY['Blue','Black'], 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-cotton-kurta-sample', 'Cotton Kurta', 'Lightweight kurta for festive and casual wear.', 1199, 899, 'men', 'men-kurtas', 'SR Boutique', 'Cotton', ARRAY['S','M','L','XL'], ARRAY['White','Cream','Blue'], 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-trunk-pack-sample', 'Cotton Trunk Pack (3)', 'Pack of 3 comfortable cotton trunks.', 599, 449, 'men', 'men-innerwear', 'Comfort Line', 'Cotton', ARRAY['M','L','XL'], ARRAY['Black','Grey'], 'https://images.unsplash.com/photo-1622445275463-ada2a6a4a09a?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('men-cargo-shorts-sample', 'Cargo Shorts', 'Relaxed shorts with utility pockets.', 699, NULL, 'men', 'men-shorts', 'Urban Fit', 'Cotton', ARRAY['S','M','L','XL'], ARRAY['Khaki','Black'], 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop&auto=format');

-- Women
SELECT seed_sample_product('women-silk-saree-sample', 'Silk Blend Saree', 'Elegant saree with subtle border work.', 2499, 1999, 'women', 'women-sarees', 'SR Boutique', 'Silk', ARRAY['Free Size'], ARRAY['Maroon','Green'], 'https://images.unsplash.com/photo-1610030469660-20a1ba1501c5?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-print-kurti-sample', 'Printed Kurti', 'Floral kurti for daily and casual outings.', 799, 599, 'women', 'women-kurtis', 'SR Boutique', 'Rayon', ARRAY['S','M','L','XL'], ARRAY['Pink','Blue'], 'https://images.unsplash.com/photo-1583496661160-fb2886a0aaaa?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-casual-top-sample', 'Casual Crop Top', 'Trendy top for jeans and skirts.', 449, NULL, 'women', 'women-tops', 'Urban Fit', 'Cotton', ARRAY['S','M','L'], ARRAY['White','Yellow'], 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-maxi-dress-sample', 'Evening Maxi Dress', 'Flowy dress for parties and occasions.', 1899, 1499, 'women', 'women-dresses', 'Style Hub', 'Polyester', ARRAY['S','M','L'], ARRAY['Red','Black'], 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-highrise-jeans-sample', 'High Rise Jeans', 'Flattering high-rise fit with stretch.', 1399, 1099, 'women', 'women-jeans', 'Classic Wear', 'Denim', ARRAY['26','28','30','32'], ARRAY['Blue','Black'], 'https://images.unsplash.com/photo-1541099649105-f69accddf772?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-stretch-leggings-sample', 'Stretch Leggings', 'Soft leggings for daily wear and workouts.', 399, 299, 'women', 'women-leggings', 'Comfort Line', 'Blend', ARRAY['S','M','L'], ARRAY['Black','Navy'], 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('women-cotton-bra-sample', 'Cotton Bralette', 'Light support bralette for everyday comfort.', 349, NULL, 'women', 'women-innerwear', 'Comfort Line', 'Cotton', ARRAY['S','M','L'], ARRAY['Nude','Black'], 'https://images.unsplash.com/photo-1586105251261-72a756659a11?w=600&h=800&fit=crop&auto=format');

-- Kids
SELECT seed_sample_product('kids-boys-tee-sample', 'Boys Graphic Tee', 'Fun graphic tee for active boys.', 349, 299, 'kids', 'kids-boys', 'Comfort Line', 'Cotton', ARRAY['4-5Y','6-7Y','8-9Y'], ARRAY['Blue','Red'], 'https://images.unsplash.com/photo-1503454537844-156a7ef3b0e2?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('kids-girls-frock-sample', 'Girls Party Frock', 'Pretty frock for birthdays and events.', 699, 549, 'kids', 'kids-girls', 'SR Boutique', 'Blend', ARRAY['4-5Y','6-7Y'], ARRAY['Pink','Purple'], 'https://images.unsplash.com/photo-1519238263530-9822c6feec74?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('kids-infant-onesie-sample', 'Infant Cotton Onesie', 'Soft onesie for infants, easy snap buttons.', 299, NULL, 'kids', 'kids-infants', 'Comfort Line', 'Cotton', ARRAY['0-3M','3-6M','6-12M'], ARRAY['White','Blue','Pink'], 'https://images.unsplash.com/photo-1515488042361-ee00e945ddd1?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('kids-school-uniform-sample', 'School Uniform Set', 'Durable shirt and pant set for school.', 899, 749, 'kids', 'kids-school', 'SR Boutique', 'Blend', ARRAY['6-7Y','8-9Y','10-11Y'], ARRAY['White','Navy'], 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop&auto=format');

-- Accessories
SELECT seed_sample_product('acc-leather-bag-sample', 'Leather Crossbody Bag', 'Compact bag with adjustable strap.', 1299, 999, 'accessories', 'acc-bags', 'Style Hub', 'Blend', ARRAY['Free Size'], ARRAY['Brown','Black'], 'https://images.unsplash.com/photo-1548039186-95b3854e0c04?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('acc-leather-belt-sample', 'Genuine Leather Belt', 'Classic belt with metal buckle.', 499, NULL, 'accessories', 'acc-belts', 'Classic Wear', 'Blend', ARRAY['32','34','36'], ARRAY['Brown','Black'], 'https://images.unsplash.com/photo-1624222247344-550fb60583f9?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('acc-gold-jewellery-sample', 'Gold-Plated Earrings', 'Elegant earrings for festive looks.', 799, 649, 'accessories', 'acc-jewellery', 'SR Boutique', 'Blend', ARRAY['Free Size'], ARRAY['Gold'], 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('acc-analog-watch-sample', 'Minimal Analog Watch', 'Sleek watch with stainless finish.', 1999, NULL, 'accessories', 'acc-watches', 'Classic Wear', 'Blend', ARRAY['Free Size'], ARRAY['Silver','Black'], 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format');
SELECT seed_sample_product('acc-aviator-sunglasses-sample', 'Aviator Sunglasses', 'UV protection with classic aviator frame.', 599, 449, 'accessories', 'acc-sunglasses', 'Style Hub', 'Blend', ARRAY['Free Size'], ARRAY['Black','Brown'], 'https://images.unsplash.com/photo-1572635196233-14f4f41b4cd7?w=600&h=800&fit=crop&auto=format');

DROP FUNCTION seed_sample_product;
