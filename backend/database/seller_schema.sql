-- ============================================
-- Cunga Marketplace: Seller Schema Extension
-- Run this AFTER the main schema.sql
-- ============================================

USE cunga_platform;

-- ============================================
-- Table: sellers
-- Marketplace sellers (independent from SaaS tenants)
-- ============================================
CREATE TABLE IF NOT EXISTS sellers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- Auth
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    -- Personal info
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    national_id VARCHAR(50),
    -- Shop info
    shop_name VARCHAR(200) NOT NULL,
    shop_slug VARCHAR(100) NOT NULL UNIQUE,
    shop_description TEXT,
    shop_logo VARCHAR(255),
    shop_banner VARCHAR(255),
    -- Location
    province VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    -- Plan
    plan ENUM('free', 'starter', 'pro', 'enterprise') DEFAULT 'free',
    plan_expires_at TIMESTAMP NULL,
    commission_rate DECIMAL(5,2) DEFAULT 8.00,
    -- Status
    status ENUM('pending', 'active', 'suspended', 'rejected') DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    -- Balance
    wallet_balance DECIMAL(12,2) DEFAULT 0.00,
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    -- Timestamps
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_shop_slug (shop_slug),
    INDEX idx_status (status),
    INDEX idx_plan (plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: seller_products
-- Products posted by marketplace sellers
-- ============================================
CREATE TABLE IF NOT EXISTS seller_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    stock INT DEFAULT 0,
    sku VARCHAR(100),
    -- Images (JSON array of URLs)
    images JSON,
    -- Status
    status ENUM('active', 'draft', 'out_of_stock', 'pending_review', 'rejected') DEFAULT 'draft',
    rejection_reason TEXT,
    -- Metrics
    views INT DEFAULT 0,
    sold INT DEFAULT 0,
    -- Flags
    is_featured BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_is_featured (is_featured),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: seller_orders
-- Orders placed on marketplace seller products
-- ============================================
CREATE TABLE IF NOT EXISTS seller_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_ref VARCHAR(30) NOT NULL UNIQUE,
    seller_id INT NOT NULL,
    product_id INT NOT NULL,
    -- Buyer info
    buyer_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    buyer_email VARCHAR(100),
    -- Delivery
    delivery_address TEXT NOT NULL,
    delivery_district VARCHAR(100),
    delivery_province VARCHAR(100),
    delivery_method ENUM('standard', 'express', 'pickup') DEFAULT 'standard',
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    -- Financials
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    seller_earnings DECIMAL(12,2) NOT NULL,
    -- Payment
    payment_method ENUM('mtn', 'airtel', 'card', 'bank') DEFAULT 'mtn',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    -- Status
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES seller_products(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_order_ref (order_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: seller_payouts
-- Commission payouts to sellers
-- ============================================
CREATE TABLE IF NOT EXISTS seller_payouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method ENUM('mtn', 'airtel', 'bank') DEFAULT 'mtn',
    account_number VARCHAR(50) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    reference VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: seller_reviews
-- Buyer reviews on seller profiles
-- ============================================
CREATE TABLE IF NOT EXISTS seller_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    order_id INT NOT NULL,
    buyer_name VARCHAR(150),
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES seller_orders(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: seller_refresh_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS seller_refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed: commission rates per plan
-- ============================================
-- free: 8%, starter: 5%, pro: 3%, enterprise: 1.5%
-- These are enforced in the backend, not stored as a separate table
-- but can be referenced via sellers.plan
