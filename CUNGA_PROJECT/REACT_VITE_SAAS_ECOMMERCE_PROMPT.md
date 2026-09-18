# 🚀 React + Vite Shop Management System - SaaS E-Commerce Platform

## 📋 Project Overview

**Project Name**: ShopMaster Pro - Multi-Tenant SaaS E-Commerce & Trading Platform  
**Tech Stack**: React 18 + Vite + TypeScript + TailwindCSS + Stripe  
**Backend**: Node.js + Express + MySQL + Redis  
**Purpose**: Subscription-based, multi-tenant shop management system with integrated e-commerce marketplace for buying and selling products.

---

## 🎯 Executive Summary

Build a **comprehensive SaaS platform** that combines:

1. **Multi-Tenant Shop Management System**: Multiple businesses use the same platform with isolated data
2. **B2B Marketplace**: Shops can buy products from other shops/suppliers
3. **B2C E-Commerce**: Each shop gets a branded online store for selling to customers
4. **Subscription Management**: Tiered pricing plans with Stripe integration
5. **Trading Platform**: Inter-shop trading, wholesale marketplace, bulk purchasing

**Three User Types**:
- **Platform Admin**: Manages the entire SaaS platform, subscriptions, and marketplace
- **Business Owner/Shop Admin**: Manages their shop(s), subscribes to plans, sells products
- **End Customers**: Browse marketplace, purchase from shops, track orders

---

## 🏢 Multi-Tenant Architecture

### Tenant Isolation Strategy

**Option 1: Single Database with Tenant ID** (Recommended for scaling)
```sql
-- Every table includes tenant_id for data isolation
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,  -- Links to organization/business
    name VARCHAR(255) NOT NULL,
    -- ... other fields
    INDEX idx_tenant_products (tenant_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

**Option 2: Database Per Tenant** (For enterprise clients)
```
tenant_1_db
tenant_2_db
tenant_3_db
```

### Tenant Structure
```sql
CREATE TABLE tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,  -- subdomain: shop-name.shopmaster.com
    owner_user_id INT NOT NULL,
    subscription_plan_id INT NOT NULL,
    subscription_status ENUM('trial', 'active', 'past_due', 'cancelled', 'suspended') DEFAULT 'trial',
    trial_ends_at TIMESTAMP NULL,
    subscription_starts_at TIMESTAMP NULL,
    subscription_ends_at TIMESTAMP NULL,
    custom_domain VARCHAR(255) NULL,  -- shop-name.com
    logo_url VARCHAR(255),
    primary_color VARCHAR(7) DEFAULT '#667eea',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    settings JSON,  -- Custom tenant settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);
```


---

## 💳 Subscription Plans & Pricing

### Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,  -- 'Starter', 'Professional', 'Enterprise'
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,  -- Usually 20% discount
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    trial_days INT DEFAULT 14,
    features JSON,  -- Feature limits as JSON
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Plan Feature Limits
```typescript
interface PlanFeatures {
  // Core Limits
  maxBranches: number | 'unlimited';
  maxUsers: number | 'unlimited';
  maxProducts: number | 'unlimited';
  maxMonthlyTransactions: number | 'unlimited';
  maxStorageGB: number | 'unlimited';
  
  // E-Commerce Features
  onlineStore: boolean;
  customDomain: boolean;
  customBranding: boolean;
  marketplaceAccess: boolean;
  bulkPurchasing: boolean;
  
  // Advanced Features
  advancedAnalytics: boolean;
  apiAccess: boolean;
  multiCurrency: boolean;
  inventoryAutomation: boolean;
  
  // Support
  supportLevel: 'email' | 'priority' | 'dedicated';
  phoneSupport: boolean;
  customTraining: boolean;
}
```

### Recommended Pricing Tiers

#### 🌱 **Starter Plan** - $29/month ($290/year)
```json
{
  "maxBranches": 1,
  "maxUsers": 3,
  "maxProducts": 100,
  "maxMonthlyTransactions": 500,
  "maxStorageGB": 5,
  "onlineStore": true,
  "customDomain": false,
  "customBranding": false,
  "marketplaceAccess": "buyer_only",
  "bulkPurchasing": false,
  "advancedAnalytics": false,
  "apiAccess": false,
  "multiCurrency": false,
  "inventoryAutomation": false,
  "supportLevel": "email",
  "phoneSupport": false,
  "customTraining": false
}
```

#### 🚀 **Professional Plan** - $79/month ($790/year)
```json
{
  "maxBranches": 5,
  "maxUsers": 15,
  "maxProducts": 1000,
  "maxMonthlyTransactions": 5000,
  "maxStorageGB": 50,
  "onlineStore": true,
  "customDomain": true,
  "customBranding": true,
  "marketplaceAccess": "full",
  "bulkPurchasing": true,
  "advancedAnalytics": true,
  "apiAccess": true,
  "multiCurrency": true,
  "inventoryAutomation": true,
  "supportLevel": "priority",
  "phoneSupport": true,
  "customTraining": false
}
```


#### 💼 **Enterprise Plan** - $199/month ($1990/year)
```json
{
  "maxBranches": "unlimited",
  "maxUsers": "unlimited",
  "maxProducts": "unlimited",
  "maxMonthlyTransactions": "unlimited",
  "maxStorageGB": 500,
  "onlineStore": true,
  "customDomain": true,
  "customBranding": true,
  "marketplaceAccess": "full",
  "bulkPurchasing": true,
  "advancedAnalytics": true,
  "apiAccess": true,
  "multiCurrency": true,
  "inventoryAutomation": true,
  "whiteLabel": true,
  "supportLevel": "dedicated",
  "phoneSupport": true,
  "customTraining": true,
  "sla": "99.9%"
}
```

### Usage Tracking Table
```sql
CREATE TABLE tenant_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    branches_count INT DEFAULT 0,
    users_count INT DEFAULT 0,
    products_count INT DEFAULT 0,
    transactions_count INT DEFAULT 0,
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    api_calls_count INT DEFAULT 0,
    exceeded_limits JSON,  -- Track which limits were exceeded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_tenant_period (tenant_id, period_start)
);
```

---

## 🛒 E-Commerce & Trading Features

### 1. **B2C Online Store (Each Tenant Gets One)**

#### Customer-Facing Storefront
```sql
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);
```

#### Customer Addresses
```sql
CREATE TABLE customer_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    address_type ENUM('billing', 'shipping') NOT NULL,
    full_name VARCHAR(200),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```


#### Customer Orders
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,  -- ORD-2024-001234
    tenant_id INT NOT NULL,  -- Shop that receives the order
    customer_id INT NOT NULL,
    order_type ENUM('retail', 'wholesale', 'marketplace') DEFAULT 'retail',
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('card', 'paypal', 'bank_transfer', 'cash_on_delivery') NOT NULL,
    payment_intent_id VARCHAR(255),  -- Stripe payment intent
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address_id INT,
    billing_address_id INT,
    notes TEXT,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (shipping_address_id) REFERENCES customer_addresses(id),
    FOREIGN KEY (billing_address_id) REFERENCES customer_addresses(id),
    INDEX idx_tenant_orders (tenant_id),
    INDEX idx_customer_orders (customer_id),
    INDEX idx_order_status (status)
);
```

#### Order Items
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,  -- Snapshot at order time
    product_sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),  -- For profit calculation
    profit DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2. **B2B Marketplace (Inter-Shop Trading)**

#### Marketplace Products (Cross-Tenant Visibility)
```sql
CREATE TABLE marketplace_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,  -- Selling tenant
    product_id INT NOT NULL,  -- Their product
    listing_type ENUM('wholesale', 'retail', 'both') DEFAULT 'wholesale',
    is_active BOOLEAN DEFAULT true,
    min_order_quantity INT DEFAULT 1,
    max_order_quantity INT,
    wholesale_price DECIMAL(10,2),  -- B2B price
    retail_price DECIMAL(10,2),  -- B2C price
    bulk_pricing JSON,  -- [{qty: 100, price: 45}, {qty: 500, price: 40}]
    available_quantity INT NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    shipping_regions JSON,  -- Supported countries/regions
    lead_time_days INT DEFAULT 1,  -- Processing time
    featured BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_marketplace_active (is_active),
    INDEX idx_marketplace_type (listing_type),
    FULLTEXT idx_marketplace_search (product_name)
);
```


#### Marketplace Purchase Orders (Shop to Shop)
```sql
CREATE TABLE marketplace_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,  -- MPO-2024-001234
    buyer_tenant_id INT NOT NULL,  -- Shop buying
    seller_tenant_id INT NOT NULL,  -- Shop selling
    status ENUM('pending', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed') DEFAULT 'pending',
    payment_status ENUM('pending', 'escrow', 'released', 'refunded') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,  -- Your commission (e.g., 5%)
    total_amount DECIMAL(10,2) NOT NULL,
    payment_intent_id VARCHAR(255),
    shipping_address JSON,  -- Delivery address
    notes TEXT,
    tracking_number VARCHAR(100),
    expected_delivery DATE,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (seller_tenant_id) REFERENCES tenants(id),
    INDEX idx_buyer_orders (buyer_tenant_id),
    INDEX idx_seller_orders (seller_tenant_id)
);
```

#### Marketplace Order Items
```sql
CREATE TABLE marketplace_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    marketplace_order_id INT NOT NULL,
    marketplace_listing_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marketplace_order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (marketplace_listing_id) REFERENCES marketplace_listings(id)
);
```

### 3. **Shopping Cart System**

```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255),  -- For guest users
    customer_id INT,  -- For logged-in users
    tenant_id INT NOT NULL,  -- Shop they're buying from
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_snapshot DECIMAL(10,2) NOT NULL,  -- Price at time of adding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_session_cart (session_id),
    INDEX idx_customer_cart (customer_id)
);
```

### 4. **Product Reviews & Ratings**

```sql
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT,  -- Verified purchase link
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    review_text TEXT,
    images JSON,  -- Array of image URLs
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    moderated_by INT,
    moderation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_product_reviews (product_id),
    INDEX idx_rating (rating)
);
```


### 5. **Wishlist & Favorites**

```sql
CREATE TABLE wishlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    tenant_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_wishlist (customer_id, product_id)
);
```

### 6. **Coupons & Discounts**

```sql
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),  -- Cap for percentage discounts
    usage_limit INT,  -- Total uses allowed
    usage_per_customer INT DEFAULT 1,
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    applicable_products JSON,  -- Array of product IDs (null = all products)
    applicable_categories JSON,  -- Array of category names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_tenant_code (tenant_id, code),
    INDEX idx_active_coupons (is_active, valid_from, valid_until)
);
```

```sql
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 💰 Payment Integration (Stripe)

### Stripe Setup

```typescript
// Backend Stripe Configuration
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create payment intent for customer order
async function createPaymentIntent(orderId: number, amount: number, currency: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      order_id: orderId.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
  
  return paymentIntent;
}
```

### Subscription Payments Table

```sql
CREATE TABLE subscription_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    subscription_plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status ENUM('pending', 'succeeded', 'failed', 'refunded') NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    failure_reason TEXT,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    INDEX idx_tenant_payments (tenant_id),
    INDEX idx_payment_status (payment_status)
);
```


### Marketplace Transaction Fees

```sql
CREATE TABLE marketplace_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    marketplace_order_id INT NOT NULL,
    seller_tenant_id INT NOT NULL,
    buyer_tenant_id INT NOT NULL,
    order_amount DECIMAL(10,2) NOT NULL,
    platform_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
    platform_fee_amount DECIMAL(10,2) NOT NULL,
    seller_payout_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'escrow', 'released', 'refunded') DEFAULT 'pending',
    stripe_transfer_id VARCHAR(255),
    released_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marketplace_order_id) REFERENCES marketplace_orders(id),
    FOREIGN KEY (seller_tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (buyer_tenant_id) REFERENCES tenants(id),
    INDEX idx_seller_transactions (seller_tenant_id),
    INDEX idx_payment_status (payment_status)
);
```

---

## 🌐 Landing Page & Marketing Site

### Public-Facing Website Structure

```
/                          → Landing page with pricing
/features                  → Feature showcase
/pricing                   → Pricing comparison table
/marketplace               → Browse marketplace (public view)
/about                     → About us
/contact                   → Contact form
/blog                      → Blog posts
/docs                      → Documentation
/login                     → Sign in
/signup                    → Free trial signup
/demo                      → Request demo

/{tenant-slug}             → Tenant's online store
/{tenant-slug}/products    → Products listing
/{tenant-slug}/product/:id → Product details
/{tenant-slug}/cart        → Shopping cart
/{tenant-slug}/checkout    → Checkout process
```

### Landing Page Components

#### Hero Section
```typescript
interface HeroSection {
  headline: "Grow Your Retail Business with ShopMaster Pro";
  subheadline: "All-in-one platform to manage inventory, sell online, and trade with other businesses";
  cta: [
    { text: "Start Free Trial", link: "/signup" },
    { text: "Watch Demo", link: "/demo" }
  ];
  heroImage: "dashboard-screenshot.png";
  stats: [
    { value: "10,000+", label: "Active Businesses" },
    { value: "$50M+", label: "Transactions Processed" },
    { value: "150+", label: "Countries" }
  ];
}
```

#### Features Grid
1. **Multi-Branch Management**: Manage unlimited locations
2. **Smart Inventory**: Real-time stock tracking with auto-alerts
3. **Profit Analytics**: Detailed profit tracking per product/branch
4. **Online Store**: Beautiful storefront for each business
5. **B2B Marketplace**: Buy/sell wholesale products
6. **Mobile Ready**: Works on all devices
7. **Secure Payments**: Stripe integration
8. **24/7 Support**: Priority support for paid plans

#### Pricing Comparison Table
Interactive table showing all plans with features comparison and "Start Free Trial" CTA.

#### Customer Testimonials
```typescript
interface Testimonial {
  name: string;
  business: string;
  avatar: string;
  rating: 5;
  quote: "ShopMaster Pro transformed how we manage our 5 retail locations. Sales up 40%!";
}
```

#### Trust Indicators
- SSL Secure
- PCI Compliant
- GDPR Compliant
- Stripe Partner
- 99.9% Uptime
- Money-back guarantee


---

## 🔐 Multi-Level Authentication System

### User Roles & Permissions

```typescript
enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',  // Manages entire SaaS
  BUSINESS_OWNER = 'business_owner',  // Owns a tenant/business
  SHOP_MANAGER = 'shop_manager',      // Manages a shop within tenant
  STAFF = 'staff',                    // Staff member with limited access
  CUSTOMER = 'customer',              // End customer (buyers)
}

interface UserPermissions {
  // Platform Admin (Super User)
  canManageAllTenants: boolean;
  canManageSubscriptions: boolean;
  canViewPlatformAnalytics: boolean;
  canManageMarketplace: boolean;
  canConfigurePricing: boolean;
  
  // Business Owner
  canManageSubscription: boolean;
  canManageBilling: boolean;
  canManageUsers: boolean;
  canManageBranches: boolean;
  canViewAllReports: boolean;
  canConfigureStore: boolean;
  canAccessMarketplace: boolean;
  
  // Shop Manager
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canRecordSales: boolean;
  canProcessOrders: boolean;
  canViewReports: boolean;
  canManageInventory: boolean;
  
  // Staff
  canRecordSales: boolean;
  canViewProducts: boolean;
  canProcessOrders: boolean;
}
```

### Updated Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT,  -- NULL for platform admins and customers
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role ENUM('platform_admin', 'business_owner', 'shop_manager', 'staff', 'customer') NOT NULL,
    permissions JSON,  -- Granular permissions
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_users (tenant_id),
    INDEX idx_role (role)
);
```

### Authentication Flow

#### For Business Owners/Staff
1. User visits `app.shopmaster.com` or `{tenant-slug}.shopmaster.com`
2. Login with email/password
3. JWT token issued with tenant context
4. All API requests include tenant_id validation

#### For Customers
1. Customer visits `{shop-name}.shopmaster.com/shop`
2. Browse products (no login required)
3. Add to cart (stored in session)
4. Checkout requires login or guest checkout
5. Customer account created automatically

---

## 🚀 Key Features Implementation

### 1. **Onboarding Flow (New Business Signup)**

#### Step 1: Create Account
```typescript
interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  firstName: string;
  lastName: string;
}
```

#### Step 2: Choose Plan
- Display pricing table
- Select billing cycle (monthly/yearly)
- Show trial information (14 days free)
- No credit card required for trial

#### Step 3: Business Setup
```typescript
interface BusinessSetup {
  businessType: 'retail' | 'wholesale' | 'both';
  industry: string;
  numberOfBranches: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'RWF' | string;
  timezone: string;
  country: string;
}
```

#### Step 4: Store Customization
```typescript
interface StoreCustomization {
  storeName: string;
  slug: string;  // shop-name.shopmaster.com
  logo: File | null;
  primaryColor: string;
  description: string;
}
```

#### Step 5: Add First Products (Optional)
- Skip or bulk import CSV
- Add 1-5 products manually
- Template products available


#### Step 6: Welcome Dashboard
- Quick tour of features
- Action checklist:
  - [ ] Complete profile
  - [ ] Add products
  - [ ] Customize store
  - [ ] Invite team members
  - [ ] Make first sale

### 2. **Business Dashboard (Multi-Tenant Admin)**

#### Dashboard Stats
```typescript
interface BusinessDashboardStats {
  // Revenue
  totalRevenue: {
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
  };
  
  // Orders
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
    todayCount: number;
  };
  
  // Products
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  
  // Marketplace
  marketplace: {
    listingsActive: number;
    purchaseOrders: number;
    salesOrders: number;
  };
  
  // Subscription
  subscription: {
    plan: string;
    status: string;
    daysRemaining: number;
    usageLimits: {
      branches: { used: number, limit: number },
      products: { used: number, limit: number },
      users: { used: number, limit: number }
    };
  };
}
```

#### Quick Actions
- Create new product
- Process pending orders
- View marketplace
- Add team member
- Generate report
- Upgrade plan

### 3. **Marketplace Dashboard**

#### Browse Marketplace
**Filters**:
- Category
- Price range
- Minimum order quantity
- Shipping regions
- Supplier rating
- Product rating

**Listing Card**:
```typescript
interface MarketplaceCard {
  image: string;
  productName: string;
  supplier: {
    name: string;
    rating: number;
    totalSales: number;
    location: string;
  };
  pricing: {
    wholesalePrice: number;
    minQuantity: number;
    bulkDiscounts: Array<{ qty: number, price: number }>;
  };
  availability: number;
  shippingCost: number;
  leadTime: string;
  addToCartButton: boolean;
}
```

#### My Listings (Seller View)
**Features**:
- Add product to marketplace
- Set wholesale/retail pricing
- Manage inventory
- View sales analytics
- Respond to inquiries
- Manage orders

**Add Listing Form**:
```typescript
interface MarketplaceListingForm {
  productId: number;  // Select from own products
  listingType: 'wholesale' | 'retail' | 'both';
  wholesalePrice: number;
  retailPrice: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  bulkPricing: Array<{ quantity: number, price: number }>;
  shippingCost: number;
  shippingRegions: string[];
  leadTimeDays: number;
  additionalInfo: string;
}
```

#### Purchase Orders (Buyer View)
**Table Columns**:
- Order #
- Seller
- Products
- Total Amount
- Status
- Payment Status
- Expected Delivery
- Actions (View, Track, Contact Seller)

**Order Detail**:
- Full order information
- Shipping tracking
- Communication thread with seller
- Invoice download
- Dispute resolution (if issues)

### 4. **Customer Storefront (Tenant's Online Store)**

#### Homepage Layout
```typescript
interface StorefrontHomepage {
  header: {
    logo: string;
    navigation: ['Home', 'Shop', 'About', 'Contact'];
    cartIcon: { count: number };
    searchBar: boolean;
  };
  hero: {
    slides: Array<{
      image: string;
      title: string;
      subtitle: string;
      cta: { text: string, link: string };
    }>;
  };
  featuredProducts: Product[];
  categories: Category[];
  testimonials: CustomerReview[];
  footer: {
    socialMedia: string[];
    contactInfo: object;
    policies: ['Privacy', 'Terms', 'Shipping', 'Returns'];
  };
}
```


#### Product Listing Page
**Features**:
- Grid view (2/3/4 columns responsive)
- List view option
- Filters sidebar (category, price, rating, availability)
- Sort options (price, newest, popular, rating)
- Pagination or infinite scroll
- Quick view modal
- Add to cart from listing

#### Product Detail Page
```typescript
interface ProductDetailPage {
  images: {
    main: string;
    thumbnails: string[];
    zoom: boolean;
  };
  info: {
    name: string;
    sku: string;
    price: number;
    compareAtPrice: number;
    discount: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
    description: string;
    specifications: Record<string, string>;
  };
  actions: {
    quantitySelector: { min: 1, max: number, step: 1 };
    addToCartButton: boolean;
    addToWishlistButton: boolean;
    shareButtons: ['Facebook', 'Twitter', 'WhatsApp', 'Copy Link'];
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<1|2|3|4|5, number>;
    reviewsList: ProductReview[];
    writeReviewButton: boolean;
  };
  relatedProducts: Product[];
}
```

#### Shopping Cart
**Cart Sidebar/Page**:
```typescript
interface ShoppingCart {
  items: Array<{
    product: Product;
    quantity: number;
    subtotal: number;
    availability: boolean;
  }>;
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  couponCode: {
    input: string;
    applyButton: boolean;
    appliedCoupon: Coupon | null;
  };
  actions: {
    continueShoppingButton: boolean;
    checkoutButton: boolean;
  };
}
```

#### Checkout Process

**Step 1: Shipping Information**
```typescript
interface ShippingForm {
  useExistingAddress: number | null;  // Address ID or null
  newAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: {
    standard: { cost: number, days: string };
    express: { cost: number, days: string };
    overnight: { cost: number, days: string };
  };
}
```

**Step 2: Payment**
```typescript
interface PaymentForm {
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  cardDetails: {
    // Stripe Elements component
    cardNumber: string;
    expiry: string;
    cvc: string;
    name: string;
  };
  billingAddress: {
    sameAsShipping: boolean;
    // Or separate billing address fields
  };
}
```

**Step 3: Review & Confirm**
- Order summary
- Shipping address
- Billing address
- Payment method
- Terms acceptance checkbox
- Place Order button

**Step 4: Confirmation**
- Order number
- Expected delivery date
- Email confirmation sent
- Track order link
- Continue shopping button

### 5. **Order Management System**

#### Business Owner - Order Dashboard
**Views**:
- All orders
- By status (pending, processing, shipped, delivered)
- By payment status
- By date range

**Order List Table**:
- Order #
- Customer name
- Date
- Items count
- Total
- Payment status
- Order status
- Quick actions (View, Process, Ship, Cancel)

#### Order Detail Page
```typescript
interface OrderDetailView {
  orderInfo: {
    orderNumber: string;
    orderDate: Date;
    status: string;
    paymentStatus: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shipping: {
    address: Address;
    method: string;
    cost: number;
    trackingNumber: string;
    carrier: string;
  };
  payment: {
    method: string;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    transactionId: string;
  };
  timeline: Array<{
    status: string;
    timestamp: Date;
    note: string;
  }>;
  actions: {
    updateStatus: boolean;
    addTracking: boolean;
    refund: boolean;
    printInvoice: boolean;
    contactCustomer: boolean;
  };
}
```


#### Customer - My Orders
**Features**:
- Order history
- Track orders in real-time
- View order details
- Download invoices
- Request returns/refunds
- Write product reviews
- Reorder items

### 6. **Subscription & Billing Management**

#### Subscription Dashboard (Business Owner)
```typescript
interface SubscriptionDashboard {
  currentPlan: {
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    status: 'trial' | 'active' | 'past_due' | 'cancelled';
    currentPeriodEnd: Date;
    daysRemaining: number;
  };
  usage: {
    branches: { current: number, limit: number, percentage: number };
    users: { current: number, limit: number, percentage: number };
    products: { current: number, limit: number, percentage: number };
    transactions: { current: number, limit: number, percentage: number };
    storage: { currentGB: number, limitGB: number, percentage: number };
  };
  features: {
    available: string[];
    unavailable: string[];
  };
  actions: {
    upgradePlan: boolean;
    downgradePlan: boolean;
    cancelSubscription: boolean;
    updatePaymentMethod: boolean;
  };
}
```

#### Upgrade/Downgrade Modal
**Features**:
- Compare current plan vs new plan
- Show price difference
- Prorated billing explanation
- Immediate vs next billing cycle option
- Confirm changes

#### Billing History
**Table Columns**:
- Invoice #
- Date
- Description (Plan name + billing period)
- Amount
- Status (Paid, Failed, Refunded)
- Download PDF

#### Payment Method Management
**Features**:
- Add credit/debit card (Stripe)
- Set default payment method
- Remove old cards
- Update billing address
- Auto-renewal toggle

### 7. **Analytics & Reports**

#### Business Intelligence Dashboard
```typescript
interface AnalyticsDashboard {
  overview: {
    totalRevenue: { value: number, trend: number };
    totalOrders: { value: number, trend: number };
    averageOrderValue: { value: number, trend: number };
    customerCount: { value: number, trend: number };
    conversionRate: { value: number, trend: number };
  };
  
  charts: {
    revenueTrend: LineChart;  // Daily/Weekly/Monthly revenue
    salesByCategory: PieChart;
    topProducts: BarChart;
    ordersByStatus: DonutChart;
    customerAcquisition: LineChart;
    profitMargins: AreaChart;
  };
  
  tables: {
    topProducts: Array<{
      product: string;
      unitsSold: number;
      revenue: number;
      profit: number;
    }>;
    topCustomers: Array<{
      customer: string;
      orders: number;
      totalSpent: number;
      averageOrderValue: number;
    }>;
  };
}
```

#### Sales Reports
**Report Types**:
1. **Sales Summary Report**
   - Period: Today, Week, Month, Quarter, Year, Custom
   - Metrics: Revenue, orders, AOV, profit, tax
   - Export: CSV, PDF, Excel

2. **Product Performance Report**
   - Best sellers
   - Slow movers
   - Out of stock items
   - Profit by product

3. **Customer Report**
   - New customers
   - Repeat customers
   - Customer lifetime value
   - Churn rate

4. **Marketplace Report** (For sellers)
   - Listings performance
   - Sales by listing
   - Average order value
   - Commission paid

5. **Inventory Report**
   - Stock levels
   - Reorder alerts
   - Stock turnover rate
   - Dead stock


---

## 🛠️ Platform Admin Features

### Platform Admin Dashboard

```typescript
interface PlatformAdminDashboard {
  metrics: {
    totalTenants: { value: number, trend: number };
    activeTenants: { value: number, percentage: number };
    totalRevenue: { value: number, trend: number };  // Platform revenue
    churnRate: { value: number, trend: number };
    mrr: number;  // Monthly Recurring Revenue
    arr: number;  // Annual Recurring Revenue
  };
  
  recentSignups: Tenant[];
  trialExpiring: Tenant[];  // Expiring in next 7 days
  failedPayments: Tenant[];
  topPerformingTenants: Array<{
    tenant: Tenant;
    revenue: number;
    transactionCount: number;
  }>;
  
  charts: {
    revenueGrowth: LineChart;
    tenantGrowth: LineChart;
    churnRate: LineChart;
    planDistribution: PieChart;
    geographicDistribution: MapChart;
  };
}
```

### Tenant Management (Platform Admin)

**Tenant List**:
- Search by business name, email, slug
- Filter by plan, status, signup date
- Sort by revenue, transaction count, date

**Tenant Detail View**:
```typescript
interface TenantManagementView {
  tenantInfo: {
    businessName: string;
    slug: string;
    owner: User;
    createdAt: Date;
    status: string;
  };
  subscription: {
    plan: string;
    status: string;
    mrr: number;
    ltv: number;  // Lifetime value
    totalPaid: number;
  };
  usage: {
    branches: number;
    users: number;
    products: number;
    monthlyTransactions: number;
    storageUsedGB: number;
  };
  activity: {
    lastLogin: Date;
    totalOrders: number;
    totalRevenue: number;
    marketplaceActivity: { sales: number, purchases: number };
  };
  actions: {
    suspendAccount: boolean;
    upgradeForFree: boolean;
    extendTrial: boolean;
    refundPayment: boolean;
    loginAsTenant: boolean;  // Impersonate for support
    sendEmail: boolean;
  };
}
```

### Subscription Management (Platform Admin)

**Features**:
- View all subscriptions
- Manually apply discounts
- Extend trials
- Force plan upgrades/downgrades
- Handle failed payments
- Process refunds
- View payment history

### Marketplace Management (Platform Admin)

**Features**:
- Review and approve marketplace listings
- Monitor transactions
- Handle disputes
- Set platform commission rates
- Ban fraudulent sellers
- Feature top listings
- Manage categories

### Platform Settings

```typescript
interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    defaultTimezone: string;
  };
  
  features: {
    enableMarketplace: boolean;
    enableMultiCurrency: boolean;
    enableCustomDomains: boolean;
    maintenanceMode: boolean;
  };
  
  payments: {
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    platformCommissionPercentage: number;
  };
  
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
  };
  
  limits: {
    maxFileUploadMB: number;
    maxProductImagesPerProduct: number;
    sessionTimeoutMinutes: number;
    apiRateLimitPerMinute: number;
  };
}
```

---

## 📧 Email Notifications

### Transactional Emails

#### For Customers
1. **Welcome Email**: After account creation
2. **Order Confirmation**: After placing order
3. **Order Shipped**: With tracking number
4. **Order Delivered**: Delivery confirmation
5. **Password Reset**: Reset link
6. **Review Request**: 7 days after delivery

#### For Business Owners
1. **Welcome Email**: After signup
2. **Trial Reminder**: 3 days before trial ends
3. **Subscription Activated**: After payment
4. **Payment Failed**: Retry information
5. **New Order**: Order notification
6. **Low Stock Alert**: When products low
7. **Marketplace Sale**: When someone buys from marketplace
8. **Monthly Report**: Usage and revenue summary

#### For Platform Admin
1. **New Signup**: New tenant registered
2. **Payment Failed**: Tenant payment issue
3. **Churn Alert**: Subscription cancelled
4. **High Value Signup**: Enterprise plan signup
5. **Dispute Filed**: Marketplace dispute

### Email Templates
Use services like:
- **SendGrid**: Transactional emails
- **Mailchimp**: Marketing campaigns
- **Postmark**: Fast transactional delivery


---

## 🚀 Advanced Features

### 1. **Multi-Currency Support**

```sql
CREATE TABLE currencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(3) NOT NULL UNIQUE,  -- USD, EUR, GBP, RWF
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,  -- Relative to base currency (USD)
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Features**:
- Automatic currency conversion
- Display prices in customer's currency
- Settlement in merchant's preferred currency
- Real-time exchange rates (integrate with API)
- Historical conversion tracking

### 2. **Multi-Language Support (i18n)**

```typescript
// Supported languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'es', name: 'Español' },
];

// Translation structure
interface Translations {
  'common.welcome': string;
  'product.addToCart': string;
  'checkout.completeOrder': string;
  // ... more keys
}
```

### 3. **Inventory Automation**

**Features**:
- **Auto-Reorder**: Automatically create purchase orders when stock drops below threshold
- **Stock Alerts**: Email/SMS when low stock
- **Stock Transfers**: Move inventory between branches
- **Stock Audit**: Regular inventory counting
- **Expiry Tracking**: For perishable goods
- **Batch/Serial Tracking**: For warranty/recalls

```sql
CREATE TABLE inventory_adjustments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    product_id INT NOT NULL,
    branch_id INT,
    adjustment_type ENUM('sale', 'purchase', 'return', 'damage', 'theft', 'transfer', 'audit') NOT NULL,
    quantity_before INT NOT NULL,
    quantity_changed INT NOT NULL,
    quantity_after INT NOT NULL,
    reason TEXT,
    reference_number VARCHAR(100),
    adjusted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (adjusted_by) REFERENCES users(id)
);
```

### 4. **Loyalty Program**

```sql
CREATE TABLE loyalty_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    redemption_rate DECIMAL(5,2) DEFAULT 0.01,  -- $0.01 per point
    min_points_to_redeem INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE customer_loyalty_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    tenant_id INT NOT NULL,
    points_balance INT DEFAULT 0,
    lifetime_points_earned INT DEFAULT 0,
    lifetime_points_redeemed INT DEFAULT 0,
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_customer_tenant (customer_id, tenant_id)
);

CREATE TABLE loyalty_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    tenant_id INT NOT NULL,
    order_id INT,
    transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
    points INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```


### 5. **API Access (For Enterprise Plans)**

```typescript
// RESTful API endpoints for third-party integrations

// Authentication
POST   /api/v1/auth/token  // Get API key

// Products
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

// Orders
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status

// Customers
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id

// Inventory
GET    /api/v1/inventory
POST   /api/v1/inventory/adjust

// Webhooks (For real-time updates)
POST   /api/v1/webhooks/subscribe
GET    /api/v1/webhooks
DELETE /api/v1/webhooks/:id
```

**Webhook Events**:
- `order.created`
- `order.updated`
- `order.cancelled`
- `product.created`
- `product.updated`
- `product.out_of_stock`
- `payment.succeeded`
- `payment.failed`

### 6. **Advanced Search (Elasticsearch)**

**Features**:
- Full-text search across products
- Fuzzy matching (handle typos)
- Filter by multiple attributes
- Sort by relevance
- Search suggestions/autocomplete
- Search analytics

```typescript
// Elasticsearch integration
import { Client } from '@elastic/elasticsearch';

const searchProducts = async (query: string, filters: object) => {
  const result = await esClient.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['name^3', 'description', 'category', 'tags'],
                fuzziness: 'AUTO'
              }
            }
          ],
          filter: filters
        }
      },
      highlight: {
        fields: {
          name: {},
          description: {}
        }
      }
    }
  });
  
  return result;
};
```

### 7. **Mobile Apps (Future Phase)**

**React Native Apps**:
- Business Owner App (manage on the go)
- Customer Shopping App
- Staff App (POS, inventory)

**Features**:
- Offline mode with sync
- Push notifications
- Barcode scanner
- Mobile payments
- Location-based features

---

## 📊 Performance & Scalability

### Database Optimization

**Indexes**:
```sql
-- Critical indexes for performance
CREATE INDEX idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX idx_orders_tenant_date ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_sales_branch_date ON sales(branch_id, sold_at DESC);
CREATE INDEX idx_marketplace_active ON marketplace_listings(is_active, created_at DESC);
CREATE FULLTEXT INDEX idx_products_search ON products(name, description);
```

**Database Sharding** (For massive scale):
- Shard by tenant_id
- Each shard handles subset of tenants
- Use consistent hashing

### Caching Strategy

**Redis Caching**:
```typescript
// Cache frequently accessed data
const cacheKeys = {
  tenantConfig: (tenantId) => `tenant:${tenantId}:config`,
  productDetails: (productId) => `product:${productId}`,
  userSession: (userId) => `session:${userId}`,
  dashboardStats: (tenantId) => `stats:${tenantId}:dashboard`,
};

// Cache with TTL
await redis.setex(
  cacheKeys.dashboardStats(tenantId),
  300, // 5 minutes
  JSON.stringify(stats)
);
```

### CDN for Static Assets
- Images: CloudFlare, CloudFront
- CSS/JS bundles
- Product photos
- User avatars

### Load Balancing
- Nginx or AWS ALB
- Distribute traffic across servers
- Health checks
- Auto-scaling


---

## 🔒 Security Best Practices

### 1. **Multi-Tenant Security**

**Data Isolation**:
```typescript
// Middleware to enforce tenant isolation
const tenantMiddleware = async (req, res, next) => {
  const tenantId = req.user.tenant_id;
  
  // Inject tenant_id into all queries
  req.tenantId = tenantId;
  
  // Override database query to always filter by tenant
  req.db.query = (sql, params) => {
    // Automatically add tenant_id to WHERE clause
    return originalQuery(sql, [...params, tenantId]);
  };
  
  next();
};

// Example: Get products for current tenant only
const products = await db.query(
  'SELECT * FROM products WHERE tenant_id = ? AND status = ?',
  [req.tenantId, 'active']
);
```

**Prevent Cross-Tenant Data Access**:
- Always validate tenant_id in queries
- Use row-level security (PostgreSQL)
- Never trust tenant_id from client
- Log all cross-tenant attempts

### 2. **Payment Security (PCI Compliance)**

**Never Store**:
- Credit card numbers
- CVV codes
- Full card details

**Use Stripe Elements**:
```typescript
// Frontend: Stripe Elements (PCI compliant)
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create payment intent on backend
    const { clientSecret } = await fetch('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount: orderTotal })
    }).then(r => r.json());
    
    // Confirm payment (card never touches your server)
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: customerName }
      }
    });
    
    if (result.error) {
      // Show error
    } else {
      // Payment succeeded
      await fetch('/api/orders/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
      });
    }
  };
};
```

### 3. **Rate Limiting**

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.'
});

// Stricter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.post('/api/auth/login', loginLimiter, loginController);
```

### 4. **Input Validation & Sanitization**

```typescript
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Example: Product creation validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Name must be between 3 and 255 characters')
    .escape(),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .customSanitizer(value => DOMPurify.sanitize(value))
    .isLength({ max: 5000 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

app.post('/api/products', validateProduct, createProduct);
```

### 5. **SQL Injection Prevention**

```typescript
// ✅ GOOD: Use parameterized queries
const products = await db.query(
  'SELECT * FROM products WHERE tenant_id = ? AND name LIKE ?',
  [tenantId, `%${searchTerm}%`]
);

// ❌ BAD: Never concatenate user input
const products = await db.query(
  `SELECT * FROM products WHERE name = '${searchTerm}'` // VULNERABLE!
);
```

### 6. **XSS Prevention**

```typescript
// Frontend: Escape user content
import DOMPurify from 'dompurify';

const ProductDescription = ({ description }) => {
  const clean = DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

### 7. **CSRF Protection**

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

// Apply to state-changing routes
app.post('/api/products', csrfProtection, createProduct);

// Frontend: Include CSRF token
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'CSRF-Token': document.querySelector('[name=csrf-token]').content
  },
  body: JSON.stringify(productData)
});
```

### 8. **File Upload Security**

```typescript
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    
    cb(null, true);
  }
});

// Process uploaded image
const processImage = async (file) => {
  const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
  
  await sharp(file.buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(uploadDir, filename));
  
  return filename;
};
```

---

## 📱 Progressive Web App (PWA)

### Service Worker for Offline Support

```typescript
// service-worker.js
const CACHE_NAME = 'shopmaster-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

### Web App Manifest

```json
{
  "name": "ShopMaster Pro",
  "short_name": "ShopMaster",
  "description": "Complete shop management solution",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Testing Strategy

### 1. **Unit Tests**

```typescript
// Example: Profit calculation test
import { calculateProfit } from './utils/calculations';

describe('Profit Calculation', () => {
  it('should calculate profit correctly', () => {
    const costPrice = 50;
    const sellingPrice = 100;
    const quantity = 10;
    
    const profit = calculateProfit(costPrice, sellingPrice, quantity);
    
    expect(profit).toBe(500);
  });
  
  it('should return 0 for same cost and selling price', () => {
    const profit = calculateProfit(100, 100, 5);
    expect(profit).toBe(0);
  });
  
  it('should handle negative profit', () => {
    const profit = calculateProfit(150, 100, 5);
    expect(profit).toBe(-250);
  });
});
```

### 2. **Integration Tests**

```typescript
// Example: Order creation flow
import request from 'supertest';
import app from '../app';

describe('Order API', () => {
  let authToken;
  let productId;
  
  beforeAll(async () => {
    // Login and get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginRes.body.token;
    
    // Create a test product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        price: 99.99,
        quantity: 100
      });
    
    productId = productRes.body.id;
  });
  
  it('should create an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [{ productId, quantity: 2 }],
        paymentMethod: 'card'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.order.total).toBe(199.98);
  });
  
  it('should reduce product quantity after order', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.body.quantity).toBe(98);
  });
});
```

### 3. **E2E Tests (Playwright)**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Purchase Flow', () => {
  test('complete purchase from product page to confirmation', async ({ page }) => {
    // Navigate to store
    await page.goto('https://demo-store.shopmaster.com');
    
    // Search for product
    await page.fill('[data-testid="search-input"]', 'Laptop');
    await page.click('[data-testid="search-button"]');
    
    // Click first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Fill shipping info
    await page.fill('[name="fullName"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '+1234567890');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="postalCode"]', '10001');
    
    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]');
    
    // Fill test card (Stripe test mode)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/25');
    await page.fill('[name="cardCvc"]', '123');
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify confirmation page
    await expect(page.locator('h1')).toContainText('Order Confirmed');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
});
```

---

## 📈 Analytics & Tracking

### 1. **Google Analytics 4**

```typescript
// Initialize GA4
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
ReactGA.send({ hitType: 'pageview', page: window.location.pathname });

// Track events
ReactGA.event({
  category: 'E-commerce',
  action: 'Add to Cart',
  label: productName,
  value: productPrice
});
```

### 2. **Custom Event Tracking**

```sql
CREATE TABLE analytics_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    user_id INT,
    session_id VARCHAR(255),
    properties JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_events (tenant_id, created_at),
    INDEX idx_event_type (event_type, created_at)
);
```

**Track Important Events**:
- `user.signup`
- `user.login`
- `product.view`
- `product.add_to_cart`
- `checkout.started`
- `checkout.completed`
- `order.cancelled`
- `subscription.upgraded`
- `subscription.cancelled`

### 3. **Conversion Funnel Tracking**

```typescript
interface ConversionFunnel {
  steps: [
    { name: 'Product View', count: 10000 },
    { name: 'Add to Cart', count: 3000 },
    { name: 'Checkout Started', count: 1500 },
    { name: 'Payment Info', count: 1200 },
    { name: 'Order Complete', count: 1000 }
  ];
  conversionRate: 10%; // (1000/10000)
  dropOffPoints: [
    { from: 'Add to Cart', to: 'Checkout', dropOff: 50% }
  ];
}
```

---

## 🚀 Deployment & DevOps

### Infrastructure Setup

#### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Environment variables
VITE_API_URL=https://api.shopmaster.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_GA_MEASUREMENT_ID=G-xxx
```

#### Backend (AWS/DigitalOcean)
```bash
# Docker setup
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

#### Database (AWS RDS/DigitalOcean Managed)
- MySQL 8.0
- Multi-AZ deployment
- Automated backups (daily)
- Read replicas for scaling

#### Redis (ElastiCache/Redis Cloud)
- Session storage
- Cache layer
- Job queues

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: shopmaster/api:latest
      - run: kubectl apply -f k8s/deployment.yml
```

### Monitoring & Logging

**Tools**:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Infrastructure monitoring
- **Prometheus + Grafana**: Metrics
- **ELK Stack**: Log aggregation

```typescript
// Initialize Sentry
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```


---

## 🎯 Go-to-Market Strategy

### Phase 1: MVP Launch (Months 1-3)

**Core Features**:
- ✅ User authentication
- ✅ Tenant management
- ✅ Product management
- ✅ Sales recording
- ✅ Basic inventory tracking
- ✅ Simple online store
- ✅ Stripe subscription
- ✅ 3 pricing tiers

**Target Users**: 50 beta customers

### Phase 2: Feature Expansion (Months 4-6)

**Additional Features**:
- ✅ B2B Marketplace
- ✅ Advanced analytics
- ✅ Multi-currency
- ✅ Email notifications
- ✅ Mobile responsive
- ✅ API access
- ✅ Bulk operations

**Target Users**: 500 paying customers

### Phase 3: Scale (Months 7-12)

**Growth Features**:
- ✅ Mobile apps (iOS/Android)
- ✅ Advanced integrations
- ✅ White-label options
- ✅ Enterprise features
- ✅ Advanced reporting
- ✅ AI recommendations

**Target Users**: 5,000 paying customers

### Pricing Strategy

**Free Trial**: 14 days, no credit card required

**Monthly Pricing**:
- Starter: $29/month
- Professional: $79/month
- Enterprise: $199/month

**Annual Pricing** (Save 20%):
- Starter: $290/year ($24/month)
- Professional: $790/year ($66/month)
- Enterprise: $1,990/year ($166/month)

**Revenue Projections** (Year 1):
```
Month 1-3:   50 customers  × $29  = $1,450/month
Month 4-6:   200 customers × $50  = $10,000/month
Month 7-9:   500 customers × $60  = $30,000/month
Month 10-12: 1000 customers × $70 = $70,000/month

Year 1 MRR: ~$70,000
Year 1 ARR: ~$840,000
```

### Marketing Channels

1. **Content Marketing**
   - SEO-optimized blog posts
   - How-to guides
   - Video tutorials
   - Case studies

2. **Social Media**
   - LinkedIn (B2B focus)
   - Twitter/X (tech community)
   - Instagram (retail showcases)
   - YouTube (tutorial videos)

3. **Paid Advertising**
   - Google Ads (search intent)
   - Facebook/Instagram Ads (retail stores)
   - LinkedIn Ads (B2B)
   - Retargeting campaigns

4. **Partnerships**
   - Payment processors
   - Accounting software
   - E-commerce platforms
   - Business consultants

5. **Referral Program**
   - Give $50, Get $50 credit
   - Lifetime 20% commission for agencies
   - Free month for every 5 referrals

---

## 📚 Documentation Structure

### For End Users

1. **Getting Started Guide**
   - Sign up tutorial
   - Dashboard overview
   - Adding first product
   - Making first sale
   - Setting up online store

2. **Feature Guides**
   - Product management
   - Inventory tracking
   - Order processing
   - Reports and analytics
   - Marketplace selling/buying
   - Team management

3. **Video Tutorials**
   - Quick start (5 min)
   - Full walkthrough (30 min)
   - Advanced features (45 min)

4. **FAQs**
   - Billing questions
   - Technical issues
   - Feature requests
   - Account management

### For Developers

1. **API Documentation**
   - Authentication
   - Endpoints reference
   - Code examples
   - SDKs (JavaScript, Python, PHP)
   - Webhooks

2. **Integration Guides**
   - Stripe setup
   - Email providers
   - Third-party apps
   - Custom domains

3. **Architecture Docs**
   - System design
   - Database schema
   - Security practices
   - Performance optimization

---

## 🎨 Design System (Full Specification)

### Color System

```typescript
const colors = {
  // Primary (Purple)
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#667eea',  // Main brand
    600: '#5a67d8',
    700: '#4c51bf',
    800: '#434190',
    900: '#3c366b',
  },
  
  // Secondary (Pink)
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  
  // Success (Green)
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  
  // Warning (Yellow)
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  
  // Error (Red)
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  // Neutral (Gray)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### Spacing System

```typescript
const spacing = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};
```

### Component Examples

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Usage
<Button variant="primary" size="md" leftIcon={<PlusIcon />}>
  Add Product
</Button>
```

#### Card
```typescript
interface CardProps {
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg';
}

// Usage
<Card padding="lg" hover shadow="md">
  <CardHeader>
    <h3>Total Revenue</h3>
  </CardHeader>
  <CardBody>
    <p className="text-3xl font-bold">$45,231</p>
  </CardBody>
</Card>
```

#### Modal
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title: string;
  footer?: React.ReactNode;
}

// Usage
<Modal isOpen={isOpen} onClose={onClose} title="Add Product" size="lg">
  <ProductForm onSubmit={handleSubmit} />
</Modal>
```

---

## 🔄 Database Migrations

### Migration System

```typescript
// migrations/001_create_initial_tables.sql
CREATE TABLE tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    -- ... rest of fields
);

// migrations/002_add_marketplace_tables.sql
CREATE TABLE marketplace_listings (
    -- ... fields
);

// migrations/003_add_loyalty_program.sql
CREATE TABLE loyalty_programs (
    -- ... fields
);
```

### Run Migrations

```typescript
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const runMigrations = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });
  
  // Create migrations table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Get executed migrations
  const [executed] = await connection.query(
    'SELECT name FROM migrations'
  );
  const executedNames = executed.map(m => m.name);
  
  // Get migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    if (executedNames.includes(file)) {
      console.log(`Skipping ${file} (already executed)`);
      continue;
    }
    
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      await connection.query(sql);
      await connection.query(
        'INSERT INTO migrations (name) VALUES (?)',
        [file]
      );
      console.log(`✓ ${file} executed successfully`);
    } catch (error) {
      console.error(`✗ Error executing ${file}:`, error);
      throw error;
    }
  }
  
  await connection.end();
  console.log('All migrations completed!');
};

runMigrations();
```

---

## 📊 Sample Data / Seed Data

```typescript
// seeds/001_tenants.ts
export const tenantSeeds = [
  {
    business_name: 'Demo Electronics Store',
    slug: 'demo-electronics',
    subscription_plan_id: 2,
    subscription_status: 'active',
  },
  {
    business_name: 'Fashion Boutique',
    slug: 'fashion-boutique',
    subscription_plan_id: 1,
    subscription_status: 'trial',
  },
];

// seeds/002_users.ts
export const userSeeds = [
  {
    tenant_id: 1,
    email: 'admin@demo-electronics.com',
    password: await bcrypt.hash('password123', 10),
    role: 'business_owner',
    first_name: 'John',
    last_name: 'Doe',
  },
];

// seeds/003_products.ts
export const productSeeds = [
  {
    tenant_id: 1,
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip',
    category: 'Smartphones',
    cost_price: 800,
    selling_price: 1199,
    quantity: 50,
    status: 'active',
  },
  {
    tenant_id: 1,
    name: 'MacBook Pro 16"',
    description: 'Powerful laptop for professionals',
    category: 'Laptops',
    cost_price: 2000,
    selling_price: 2999,
    quantity: 20,
    status: 'active',
  },
];
```

---

## 🎯 Success Metrics & KPIs

### Platform Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- LTV:CAC Ratio (target: > 3:1)
- Monthly Churn Rate (target: < 5%)
- Net Revenue Retention (target: > 100%)

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Average Session Duration
- Feature Adoption Rate
- Customer Satisfaction Score (CSAT)
- Net Promoter Score (NPS)

### Business Performance
- Number of Active Tenants
- Average Revenue Per User (ARPU)
- Trial to Paid Conversion Rate
- Marketplace Transaction Volume
- Average Order Value
- Gross Merchandise Volume (GMV)

---

## 🎊 Final Checklist

### Development Phase
- [ ] Set up development environment
- [ ] Configure multi-tenant database
- [ ] Implement authentication system
- [ ] Build tenant management
- [ ] Create product management
- [ ] Implement order system
- [ ] Build marketplace features
- [ ] Integrate Stripe payments
- [ ] Implement subscription logic
- [ ] Build customer storefront
- [ ] Create analytics dashboards
- [ ] Implement email notifications
- [ ] Build admin panel
- [ ] Write tests (80%+ coverage)
- [ ] Optimize performance
- [ ] Security audit

### Pre-Launch
- [ ] Beta testing with 10-20 users
- [ ] Fix critical bugs
- [ ] Prepare documentation
- [ ] Set up monitoring tools
- [ ] Configure production servers
- [ ] Set up backups
- [ ] Prepare marketing materials
- [ ] Create demo videos
- [ ] Set up support system
- [ ] Legal compliance check

### Launch
- [ ] Deploy to production
- [ ] Enable Stripe live mode
- [ ] Launch marketing campaign
- [ ] Monitor error logs
- [ ] Track user feedback
- [ ] Respond to support tickets
- [ ] Iterate based on feedback

### Post-Launch (First 30 Days)
- [ ] Daily monitoring
- [ ] Weekly feature updates
- [ ] Monthly performance review
- [ ] User interviews
- [ ] Feature prioritization
- [ ] Scale infrastructure as needed

---

## 🚀 Conclusion

This comprehensive prompt provides everything needed to build a **world-class SaaS e-commerce and trading platform**. The system will enable:

### For You (Platform Owner)
✅ Recurring revenue through subscriptions  
✅ Marketplace commission on trades  
✅ Scalable multi-tenant architecture  
✅ Automated billing and payments  
✅ Complete platform control  

### For Your Customers (Business Owners)
✅ Professional shop management system  
✅ Beautiful online storefront  
✅ B2B marketplace for wholesale  
✅ Profit tracking and analytics  
✅ Multi-branch management  
✅ Team collaboration tools  

### For End Customers
✅ Easy shopping experience  
✅ Secure payments  
✅ Order tracking  
✅ Product reviews  
✅ Wishlist and favorites  

### Technical Excellence
✅ Modern tech stack (React + Vite + TypeScript)  
✅ Secure architecture with multi-tenant isolation  
✅ Stripe payment integration  
✅ Scalable infrastructure  
✅ Comprehensive testing  
✅ Production-ready security  

**Estimated Development Time**: 3-6 months (with 2-3 developers)  
**Estimated Budget**: $50,000 - $150,000 USD  
**Potential Revenue**: $100K+ ARR in Year 1  

This is a **complete blueprint** for building a highly profitable SaaS business! 🎉

---

**Document Version**: 2.0 (SaaS + E-Commerce Edition)  
**Created**: January 2027  
**Status**: Complete & Ready for Development  
**Total Pages**: 80+  

**Good luck building the next big SaaS platform!** 🚀💰

