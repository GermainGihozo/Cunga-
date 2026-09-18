-- ============================================
-- Cunga SaaS Platform - Seed Data
-- Development and Testing Data
-- ============================================

USE cunga_platform;

-- ============================================
-- Seed: subscription_plans
-- ============================================
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_branches, max_users, max_products, has_marketplace_access, has_api_access, display_order) VALUES
('Starter', 'starter', 'Perfect for small retailers getting started', 29.00, 290.00, 1, 3, 100, FALSE, FALSE, 1),
('Professional', 'professional', 'For growing businesses with multiple locations', 79.00, 790.00, 5, 15, 1000, TRUE, FALSE, 2),
('Enterprise', 'enterprise', 'Unlimited everything for large organizations', 199.00, 1990.00, 999, 999, 99999, TRUE, TRUE, 3);

-- ============================================
-- Seed: tenants (Sample businesses)
-- ============================================
INSERT INTO tenants (business_name, slug, subscription_plan_id, subscription_status, trial_ends_at, primary_color, currency) VALUES
('Demo Retail Store', 'demo-retail', 1, 'trial', DATE_ADD(NOW(), INTERVAL 14 DAY), '#6366F1', 'USD'),
('Fashion Boutique', 'fashion-boutique', 2, 'active', NULL, '#EC4899', 'USD'),
('Tech Electronics', 'tech-electronics', 3, 'active', NULL, '#8B5CF6', 'USD');

-- ============================================
-- Seed: branches
-- ============================================
INSERT INTO branches (tenant_id, name, location, phone, email) VALUES
-- Demo Retail Store branches
(1, 'Main Branch', 'Downtown, City Center', '+1234567890', 'main@demoretail.com'),

-- Fashion Boutique branches
(2, 'Uptown Store', 'Shopping Mall, Level 2', '+1234567891', 'uptown@fashion.com'),
(2, 'Downtown Store', 'Main Street 123', '+1234567892', 'downtown@fashion.com'),

-- Tech Electronics branches
(3, 'Central Branch', 'Tech District, Building A', '+1234567893', 'central@techelec.com'),
(3, 'North Branch', 'North Plaza, Suite 5', '+1234567894', 'north@techelec.com'),
(3, 'South Branch', 'South Market, Floor 1', '+1234567895', 'south@techelec.com');

-- ============================================
-- Seed: users
-- Password for all users: 'password123' (hashed with bcrypt)
-- Hash: $2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m
-- ============================================
INSERT INTO users (tenant_id, username, password, email, role, branch_id) VALUES
-- Demo Retail Store users
(1, 'admin_demo', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'admin@demoretail.com', 'admin', NULL),
(1, 'branch_demo', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'branch@demoretail.com', 'branch', 1),

-- Fashion Boutique users
(2, 'admin_fashion', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'admin@fashion.com', 'admin', NULL),
(2, 'branch_uptown', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'uptown@fashion.com', 'branch', 2),
(2, 'branch_downtown', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'downtown@fashion.com', 'branch', 3),

-- Tech Electronics users
(3, 'admin_tech', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'admin@techelec.com', 'admin', NULL),
(3, 'branch_central', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'central@techelec.com', 'branch', 4),
(3, 'branch_north', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'north@techelec.com', 'branch', 5),
(3, 'branch_south', '$2a$10$rZ5B8zW3H8qX9oV7YGxO3OqU7RLVl0HhY9Z8KlMnO5PqW8XhY6K1m', 'south@techelec.com', 'branch', 6);

-- Update tenant owner references
UPDATE tenants SET owner_user_id = 1 WHERE id = 1;
UPDATE tenants SET owner_user_id = 3 WHERE id = 2;
UPDATE tenants SET owner_user_id = 6 WHERE id = 3;

-- ============================================
-- Seed: categories
-- ============================================
INSERT INTO categories (tenant_id, name, slug, icon, display_order) VALUES
-- Demo Retail Store categories
(1, 'Groceries', 'groceries', '🛒', 1),
(1, 'Beverages', 'beverages', '🥤', 2),
(1, 'Snacks', 'snacks', '🍿', 3),

-- Fashion Boutique categories
(2, 'Men''s Clothing', 'mens-clothing', '👔', 1),
(2, 'Women''s Clothing', 'womens-clothing', '👗', 2),
(2, 'Accessories', 'accessories', '👜', 3),
(2, 'Shoes', 'shoes', '👟', 4),

-- Tech Electronics categories
(3, 'Smartphones', 'smartphones', '📱', 1),
(3, 'Laptops', 'laptops', '💻', 2),
(3, 'Accessories', 'accessories', '🎧', 3),
(3, 'Smart Watches', 'smart-watches', '⌚', 4);

-- ============================================
-- Seed: products
-- ============================================
INSERT INTO products (tenant_id, branch_id, name, description, category, cost_price, selling_price, quantity, barcode, created_by, status) VALUES
-- Demo Retail Store products
(1, 1, 'Whole Milk 1L', 'Fresh whole milk', 'Groceries', 2.50, 3.99, 50, '1001', 2, 'active'),
(1, 1, 'White Bread', 'Freshly baked white bread', 'Groceries', 1.20, 2.49, 30, '1002', 2, 'active'),
(1, 1, 'Coca Cola 500ml', 'Classic Coca Cola', 'Beverages', 0.80, 1.99, 100, '1003', 2, 'active'),
(1, 1, 'Potato Chips', 'Crispy potato chips', 'Snacks', 1.50, 2.99, 75, '1004', 2, 'active'),

-- Fashion Boutique products
(2, 2, 'Men''s Business Shirt', 'Professional cotton shirt', 'Men''s Clothing', 25.00, 49.99, 20, '2001', 4, 'active'),
(2, 2, 'Women''s Summer Dress', 'Light floral summer dress', 'Women''s Clothing', 35.00, 79.99, 15, '2002', 4, 'active'),
(2, 2, 'Leather Handbag', 'Premium leather handbag', 'Accessories', 50.00, 129.99, 10, '2003', 4, 'active'),
(2, 3, 'Running Shoes', 'Comfortable running shoes', 'Shoes', 40.00, 89.99, 25, '2004', 5, 'active'),

-- Tech Electronics products
(3, 4, 'iPhone 14 Pro', 'Latest iPhone model', 'Smartphones', 800.00, 1099.99, 15, '3001', 7, 'active'),
(3, 4, 'Samsung Galaxy S23', 'Premium Android phone', 'Smartphones', 700.00, 999.99, 20, '3002', 7, 'active'),
(3, 5, 'MacBook Pro 16"', 'High-performance laptop', 'Laptops', 2000.00, 2499.99, 8, '3003', 8, 'active'),
(3, 5, 'Dell XPS 15', 'Premium Windows laptop', 'Laptops', 1500.00, 1899.99, 12, '3004', 8, 'active'),
(3, 6, 'AirPods Pro', 'Wireless earbuds', 'Accessories', 150.00, 249.99, 30, '3005', 9, 'active');

-- ============================================
-- Seed: sales (Sample sales data)
-- ============================================
INSERT INTO sales (tenant_id, product_id, branch_id, user_id, quantity, unit_price, total_price, cost_price, profit, payment_method, customer_name, sold_at) VALUES
-- Recent sales for Demo Retail Store
(1, 1, 1, 2, 2, 3.99, 7.98, 2.50, 2.98, 'cash', 'John Doe', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 3, 1, 2, 5, 1.99, 9.95, 0.80, 5.95, 'card', 'Jane Smith', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 4, 1, 2, 3, 2.99, 8.97, 1.50, 4.47, 'cash', NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Sales for Fashion Boutique
(2, 5, 2, 4, 1, 49.99, 49.99, 25.00, 24.99, 'card', 'Mike Johnson', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 6, 2, 4, 1, 79.99, 79.99, 35.00, 44.99, 'card', 'Sarah Williams', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Sales for Tech Electronics
(3, 9, 4, 7, 1, 1099.99, 1099.99, 800.00, 299.99, 'card', 'David Brown', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 13, 6, 9, 2, 249.99, 499.98, 150.00, 199.98, 'mobile_money', 'Emma Davis', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ============================================
-- Seed: branch_permissions
-- ============================================
INSERT INTO branch_permissions (tenant_id, branch_id, can_add_products, can_edit_products, can_delete_products, can_record_sales, can_view_profit) VALUES
(1, 1, TRUE, TRUE, FALSE, TRUE, FALSE),
(2, 2, TRUE, TRUE, FALSE, TRUE, TRUE),
(2, 3, TRUE, TRUE, FALSE, TRUE, TRUE),
(3, 4, TRUE, TRUE, TRUE, TRUE, TRUE),
(3, 5, TRUE, TRUE, TRUE, TRUE, TRUE),
(3, 6, TRUE, TRUE, TRUE, TRUE, TRUE);

-- ============================================
-- Seed: reports (Sample reports)
-- ============================================
INSERT INTO reports (tenant_id, branch_id, user_id, title, description, report_type, status) VALUES
(1, 1, 2, 'New Stock Arrival', 'Received 100 units of milk from supplier', 'stock_arrival', 'reviewed'),
(2, 2, 4, 'Customer Feedback', 'Customer loved the new summer collection', 'customer_feedback', 'pending'),
(3, 4, 7, 'Equipment Issue', 'POS system running slow, needs maintenance', 'issue', 'pending');

-- ============================================
-- Seed: online_products
-- ============================================
INSERT INTO online_products (tenant_id, name, description, category, price, discount_percentage, final_price, stock_quantity, is_featured, source_branch_id) VALUES
(1, 'Premium Coffee Beans', 'Freshly roasted arabica beans', 'Groceries', 15.99, 10.00, 14.39, 50, TRUE, 1),
(2, 'Designer Sunglasses', 'UV protection designer sunglasses', 'Accessories', 149.99, 20.00, 119.99, 15, TRUE, 2),
(3, 'Wireless Mouse', 'Ergonomic wireless mouse', 'Accessories', 29.99, 0.00, 29.99, 100, FALSE, 4);

-- ============================================
-- Seed: deposits
-- ============================================
INSERT INTO deposits (tenant_id, branch_id, user_id, amount, deposit_type, reference_number, notes, deposited_at) VALUES
(1, 1, 2, 500.00, 'cash', NULL, 'Daily cash deposit', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 2, 4, 1250.00, 'bank_transfer', 'TXN123456', 'Weekly sales deposit', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 4, 7, 3500.00, 'bank_transfer', 'TXN789012', 'Monthly deposit', DATE_SUB(NOW(), INTERVAL 1 WEEK));

-- ============================================
-- Success Message
-- ============================================
SELECT 'Database seeded successfully!' AS Status;
SELECT 'Default login credentials:' AS Info;
SELECT '  Username: admin_demo' AS Admin;
SELECT '  Password: password123' AS Password;
SELECT '  Or use branch_demo / password123 for branch access' AS Branch;
