-- ============================================
-- Cunga Marketplace: Sample Seed Data
-- Run AFTER seller_schema.sql
-- ============================================

USE cunga_platform;

-- ── Demo sellers ─────────────────────────────────────────
INSERT INTO sellers (full_name, email, phone, password, shop_name, shop_slug,
  shop_description, province, district, address, plan, commission_rate, status, is_verified)
VALUES
  ('Jean Pierre Nkurunziza', 'jean@techhub.rw', '+250788001001',
   '$2a$10$dummyhashfortechhub1234567890123456789012',
   'TechHub Kigali', 'techhub-kigali',
   'Premium electronics and gadgets at unbeatable prices. Authorized reseller in Rwanda.',
   'Kigali', 'Gasabo', 'KG 123 St, Remera',
   'pro', 3.00, 'active', TRUE),

  ('Alice Uwase', 'alice@sportzone.rw', '+250788002002',
   '$2a$10$dummyhashforsportzone12345678901234567890',
   'SportZone Rwanda', 'sportzone-rw',
   'Everything for the active lifestyle — shoes, jerseys, fitness equipment.',
   'Kigali', 'Kicukiro', 'KK 456 Ave, Gikondo',
   'starter', 5.00, 'active', TRUE),

  ('Robert Habimana', 'robert@homedecor.rw', '+250788003003',
   '$2a$10$dummyhashforhomedecor1234567890123456789',
   'HomeDecor Plus', 'homedecor-plus',
   'Beautiful furniture, lighting and home accessories for every budget.',
   'Southern Province', 'Huye', 'Ngoma Sector, Butare',
   'free', 8.00, 'active', FALSE)
ON DUPLICATE KEY UPDATE shop_slug = VALUES(shop_slug);

-- ── Demo products ─────────────────────────────────────────
-- Get seller IDs dynamically
SET @tech   = (SELECT id FROM sellers WHERE shop_slug = 'techhub-kigali'  LIMIT 1);
SET @sport  = (SELECT id FROM sellers WHERE shop_slug = 'sportzone-rw'    LIMIT 1);
SET @home   = (SELECT id FROM sellers WHERE shop_slug = 'homedecor-plus'  LIMIT 1);

INSERT INTO seller_products
  (seller_id, name, description, category, price, old_price, stock, sold, images, status, is_featured, is_on_sale, views)
VALUES
  -- TechHub products
  (@tech, 'iPhone 14 Pro Max 256GB',
   'Apple flagship with Dynamic Island, 48MP camera, A16 Bionic chip. Brand new sealed.',
   'Electronics', 850000, 950000, 8, 23,
   '["https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=600&h=600&fit=crop"]',
   'active', TRUE, TRUE, 3450),

  (@tech, 'MacBook Pro M3 16-inch',
   'Apple M3 chip, 16GB RAM, 512GB SSD. Perfect for professionals and creatives.',
   'Electronics', 1250000, 1450000, 3, 12,
   '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"]',
   'active', TRUE, TRUE, 2100),

  (@tech, 'Sony WH-1000XM5 Headphones',
   'Industry-leading noise cancellation, 30hr battery, multipoint connection.',
   'Electronics', 95000, 120000, 15, 18,
   '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop"]',
   'active', FALSE, TRUE, 890),

  (@tech, 'Samsung 55" 4K Smart TV',
   'Crystal UHD, HDR10+, Tizen OS with built-in streaming apps.',
   'Electronics', 325000, 400000, 4, 8,
   '["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop"]',
   'active', FALSE, TRUE, 670),

  (@tech, 'Canon EOS R6 Mark II',
   '24.2MP full-frame, 4K video, dual pixel autofocus. Includes body only.',
   'Electronics', 780000, 920000, 2, 5,
   '["https://images.unsplash.com/photo-1606980702228-6eeb8cb13861?w=600&h=600&fit=crop"]',
   'active', FALSE, TRUE, 445),

  (@tech, 'Dell XPS 15 Laptop',
   'Intel Core i7-13700H, 16GB RAM, OLED display. Premium ultrabook.',
   'Electronics', 920000, NULL, 5, 3,
   '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop"]',
   'active', FALSE, FALSE, 320),

  -- SportZone products
  (@sport, 'Nike Air Max 270',
   'Lightweight running shoe with large Air unit in the heel. White/Black.',
   'Fashion & Clothing', 45000, 60000, 18, 57,
   '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]',
   'active', TRUE, TRUE, 1820),

  (@sport, 'Adidas Ultra Boost 23',
   'BOOST midsole for ultimate energy return. Great for running and casual wear.',
   'Fashion & Clothing', 55000, NULL, 12, 34,
   '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop"]',
   'active', FALSE, FALSE, 760),

  (@sport, 'Gaming Chair Pro',
   'Ergonomic racing-style chair with lumbar support, 180° recline, armrests.',
   'Home & Living', 125000, 180000, 7, 14,
   '["https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&h=600&fit=crop"]',
   'active', TRUE, TRUE, 540),

  -- HomeDecor products
  (@home, 'Dyson V15 Detect Vacuum',
   'Laser dust detection, 60min runtime, HEPA filtration. Powerful cordless vacuum.',
   'Home & Living', 280000, NULL, 6, 4,
   '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"]',
   'active', FALSE, FALSE, 215),

  (@home, 'Office Ergonomic Desk Set',
   'Sit-stand desk with memory controller, cable management, laminate surface.',
   'Home & Living', 125000, 180000, 5, 11,
   '["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop"]',
   'active', FALSE, TRUE, 390),

  (@home, 'LG OLED C3 65" TV',
   'Perfect blacks, Dolby Vision IQ, webOS 23. The gold standard in home cinema.',
   'Electronics', 580000, NULL, 3, 2,
   '["https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&h=600&fit=crop"]',
   'active', FALSE, FALSE, 180);

-- ── Sample reviews ────────────────────────────────────────
-- Temporarily disable FK checks for seeding
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO seller_reviews (seller_id, order_id, buyer_name, rating, comment)
SELECT s.id, 1, 'Jean Baptiste M.', 5, 'Excellent seller, fast delivery and authentic products!'
FROM sellers s WHERE s.shop_slug = 'techhub-kigali' LIMIT 1;

INSERT INTO seller_reviews (seller_id, order_id, buyer_name, rating, comment)
SELECT s.id, 2, 'Alice N.', 4, 'Good quality shoes, exactly as described. Will buy again.'
FROM sellers s WHERE s.shop_slug = 'sportzone-rw' LIMIT 1;

INSERT INTO seller_reviews (seller_id, order_id, buyer_name, rating, comment)
SELECT s.id, 3, 'Uwimana P.', 5, 'Great furniture, delivered on time and well packaged.'
FROM sellers s WHERE s.shop_slug = 'homedecor-plus' LIMIT 1;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Marketplace seed data inserted successfully!' AS status;
