# 🚀 React + Vite Shop Management System - Complete Rebuild Prompt

## 📋 Project Overview

**Project Name**: Modern Shop Management System  
**Tech Stack**: React 18 + Vite + TypeScript + TailwindCSS  
**Backend**: Node.js + Express + MySQL (or existing PHP REST API)  
**Purpose**: Professional multi-branch retail management platform with profit tracking, inventory management, online shop, and branch reporting.

---

## 🎯 Executive Summary

Build a modern, professional, full-stack shop management system using React and Vite that replaces the existing PHP application. The system manages multiple retail branches, tracks inventory, calculates profits, handles online product requests, and provides comprehensive reporting with photo uploads.

**Key Users**:
- **Admin**: Complete system control, user management, profit analytics, approval workflows
- **Branch Managers**: Product management, sales recording, report submission, online product requests
- **Public Users**: Online shop browsing and purchasing (future phase)

---

## 🏗️ System Architecture

### Frontend Architecture
```
shop-management-frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Buttons, Cards, Modals, Tables
│   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   ├── forms/           # Input, Select, FileUpload
│   │   └── charts/          # Profit charts, Analytics
│   ├── pages/               # Route pages
│   │   ├── admin/           # Admin dashboard & features
│   │   ├── branch/          # Branch dashboard & features
│   │   ├── auth/            # Login, Register
│   │   └── online-shop/     # Public shop pages
│   ├── features/            # Feature-based modules (Redux slices)
│   │   ├── auth/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── reports/
│   │   └── analytics/
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API calls (axios)
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript types/interfaces
│   ├── store/               # Redux store configuration
│   ├── routes/              # React Router configuration
│   └── assets/              # Images, fonts, static files
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

### Backend Architecture (Node.js + Express)
```
shop-management-backend/
├── src/
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   ├── reportController.js
│   │   └── analyticsController.js
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middlewares/         # Auth, validation, error handling
│   ├── services/            # Business logic
│   ├── utils/               # Helpers
│   └── config/              # Database, env config
├── uploads/                 # File uploads (reports, products)
├── package.json
└── .env
```

---

## 📊 Database Schema

### Core Tables

#### 1. **users**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'branch') NOT NULL,
    branch_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);
```

#### 2. **branches**
```sql
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **products**
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0,
    barcode VARCHAR(50),
    image_url VARCHAR(255),
    status ENUM('active', 'pending', 'rejected', 'out_of_stock') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 4. **sales**
```sql
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'mobile_money') DEFAULT 'cash',
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 5. **reports**
```sql
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    report_type ENUM('stock_arrival', 'customer_feedback', 'issue', 'event', 'other') DEFAULT 'other',
    image_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 6. **online_product_requests**
```sql
CREATE TABLE online_product_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    image_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

#### 7. **online_products**
```sql
CREATE TABLE online_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    source_branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_branch_id) REFERENCES branches(id)
);
```

#### 8. **deposits**
```sql
CREATE TABLE deposits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deposit_type ENUM('cash', 'bank_transfer', 'mobile_money') DEFAULT 'cash',
    reference_number VARCHAR(100),
    notes TEXT,
    deposited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 9. **product_update_requests**
```sql
CREATE TABLE product_update_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    request_type ENUM('quantity_update', 'price_update', 'details_update') NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

#### 10. **branch_permissions**
```sql
CREATE TABLE branch_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    can_add_products BOOLEAN DEFAULT true,
    can_edit_products BOOLEAN DEFAULT true,
    can_delete_products BOOLEAN DEFAULT false,
    can_record_sales BOOLEAN DEFAULT true,
    can_view_reports BOOLEAN DEFAULT true,
    can_submit_reports BOOLEAN DEFAULT true,
    can_request_online_products BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    UNIQUE KEY unique_branch_permission (branch_id)
);
```

---

## 🎨 Design System & UI Requirements

### Color Palette
```javascript
// Primary Brand Colors
const colors = {
  primary: {
    50: '#f0f4ff',
    100: '#e0eaff',
    500: '#667eea',  // Main brand color
    600: '#5a67d8',
    700: '#4c51bf',
    900: '#3730a3',
  },
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    500: '#ec4899',  // Accent color
    600: '#db2777',
    700: '#be185d',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};
```

### Typography
```javascript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
};
```

### Component Standards

#### Buttons
- **Primary**: Solid gradient background (primary colors)
- **Secondary**: Outlined border with transparent background
- **Danger**: Red background for destructive actions
- **Ghost**: Transparent with hover effects
- **Sizes**: sm, md, lg, xl
- **States**: default, hover, active, disabled, loading

#### Cards
- Rounded corners (12px-16px)
- Subtle shadow (0 2px 8px rgba(0,0,0,0.1))
- Padding: 20px-32px
- Hover effect: lift slightly + increase shadow

#### Forms
- Label above input
- Input height: 44px minimum (accessibility)
- Border radius: 8px
- Focus state: ring effect (primary color)
- Error state: red border + error message below
- Validation: Real-time feedback

#### Tables
- Striped rows (alternating background)
- Hover row highlight
- Sticky header on scroll
- Responsive: horizontal scroll on mobile
- Actions column (right-aligned)
- Pagination at bottom

#### Modals
- Overlay backdrop (rgba(0,0,0,0.5))
- Center-aligned
- Max-width: 600px-800px
- Close button (top-right)
- Smooth fade-in animation
- Click outside to close

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Login**: JWT token-based authentication
2. **Token Storage**: HttpOnly cookies + LocalStorage backup
3. **Token Refresh**: Auto-refresh before expiration
4. **Logout**: Clear tokens + redirect to login
5. **Session Timeout**: 24 hours (configurable)

### Authorization Levels
```typescript
enum UserRole {
  ADMIN = 'admin',
  BRANCH = 'branch',
}

interface Permission {
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canRecordSales: boolean;
  canViewReports: boolean;
  canSubmitReports: boolean;
  canRequestOnlineProducts: boolean;
  canApproveRequests: boolean;
  canManageUsers: boolean;
  canViewAllBranches: boolean;
}
```

### Protected Routes
```typescript
// Admin-only routes
/admin/dashboard
/admin/users
/admin/branches
/admin/permissions
/admin/online-requests
/admin/all-reports
/admin/analytics

// Branch routes (with permissions check)
/branch/dashboard
/branch/products
/branch/sales
/branch/reports
/branch/deposits
/branch/online-requests

// Public routes
/
/login
/online-shop
/online-shop/products/:id
```

---

## 📱 Core Features & Implementation

### 1. **Admin Dashboard**

#### Layout
- **Header**: Logo, notifications, user profile menu
- **Sidebar**: Collapsible navigation menu (280px-320px width)
- **Main Content**: Responsive grid layout

#### Dashboard Cards (Top Row)
```typescript
interface DashboardStats {
  totalSales: {
    amount: number;
    change: number; // percentage change from last period
    trend: 'up' | 'down';
  };
  totalProfit: {
    amount: number;
    margin: number; // profit margin percentage
    change: number;
  };
  totalProducts: {
    count: number;
    lowStock: number; // products with quantity < 10
    outOfStock: number;
  };
  activeUsers: {
    count: number;
    branches: number;
  };
  pendingApprovals: {
    products: number;
    onlineRequests: number;
    quantityRequests: number;
  };
}
```

#### Features
- **Sales by Branch Table**: Sortable, filterable, with profit breakdown
- **Top 10 Products Chart**: Bar chart with profit visualization
- **Recent Activity Feed**: Latest sales, approvals, reports
- **Profit Trend Chart**: Line chart (daily/weekly/monthly view)
- **Quick Actions**: Add user, View pending, Generate report

#### API Endpoints
```typescript
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/sales-by-branch?period=today|week|month|year
GET /api/admin/dashboard/top-products?limit=10
GET /api/admin/dashboard/profit-trend?period=week|month|year
GET /api/admin/dashboard/recent-activity?limit=20
```

---

### 2. **Branch Dashboard**

#### Dashboard Cards
```typescript
interface BranchDashboardStats {
  todaySales: {
    count: number;
    revenue: number;
    profit: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    needsRefill: number;
  };
  pendingRequests: {
    online: number;
    quantity: number;
  };
  deposits: {
    todayTotal: number;
    weekTotal: number;
  };
}
```

#### Quick Actions Grid
- **Record Sale**: Quick sale modal
- **Add Product**: Add product form
- **Submit Report**: Report submission with photo
- **Request Online Product**: Online product request
- **View Inventory**: Navigate to products page
- **View Sales**: Navigate to sales report

#### Recent Sales Table
- Last 10 sales
- Product name, quantity, price, profit
- Timestamp
- Payment method

---

### 3. **Product Management**

#### Product List (Data Table)
**Columns**:
- Image (thumbnail 64x64px)
- Product Name
- Category
- Cost Price (hidden from branch users)
- Selling Price
- Profit per Unit (calculated)
- Quantity
- Status (badge: Active, Low Stock, Out of Stock)
- Actions (Edit, Delete, View Details)

**Features**:
- Search by name/barcode
- Filter by category, status
- Sort by any column
- Bulk actions (bulk edit costs for admin)
- Export to CSV/PDF
- Pagination (20 items per page)

#### Add/Edit Product Form
```typescript
interface ProductForm {
  name: string;                    // Required
  description: string;             // Optional
  category: string;                // Dropdown
  costPrice: number;               // Required (admin/visible to admin only)
  sellingPrice: number;            // Required
  quantity: number;                // Required
  barcode: string;                 // Optional, auto-generate option
  image: File | null;              // Optional, with preview
  status: 'active' | 'pending';    // Auto-set based on role
}
```

**Validation**:
- Selling price must be >= cost price
- Quantity must be >= 0
- Image must be < 5MB, types: jpg, png, webp
- Name must be unique within branch

**API Endpoints**:
```typescript
GET    /api/products?branch_id=1&page=1&limit=20&search=&category=&status=
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/products/bulk-edit-costs
GET    /api/products/categories
POST   /api/products/generate-barcode
```

---

### 4. **Sales Recording**

#### Record Sale Form
**Step 1: Product Selection**
- Search product by name or scan barcode
- Display: Image, Name, Selling Price, Available Quantity
- Add to cart

**Step 2: Cart**
- List of selected products
- Quantity selector (with stock validation)
- Remove item button
- Calculate subtotal, tax (optional), total
- Show total profit (for admin/internal view)

**Step 3: Payment**
- Payment method: Cash, Card, Mobile Money
- Customer name (optional)
- Customer phone (optional)
- Payment reference (for non-cash)

**Step 4: Confirmation**
- Receipt preview
- Print option
- Submit sale

```typescript
interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface SaleTransaction {
  items: SaleItem[];
  paymentMethod: 'cash' | 'card' | 'mobile_money';
  customerName?: string;
  customerPhone?: string;
  paymentReference?: string;
  notes?: string;
}
```

**Features**:
- Auto-calculate profit per item
- Real-time stock validation
- Barcode scanner integration (future)
- Print receipt
- Email receipt (future)

**API Endpoints**:
```typescript
POST /api/sales
GET  /api/sales?branch_id=1&start_date=&end_date=&page=1
GET  /api/sales/:id
POST /api/sales/:id/receipt
```

---

### 5. **Sales Reports & Analytics**

#### Sales Report Page

**Filters**:
- Date range picker (Today, This Week, This Month, Custom)
- Branch selector (admin only)
- Product category
- Payment method
- Min/Max amount

**Summary Cards**:
- Total Sales Revenue
- Total Profit
- Total Transactions
- Average Transaction Value
- Profit Margin (%)
- Top Selling Product

**Sales Table**:
- Date/Time
- Product Name
- Quantity
- Unit Price
- Total Price
- Profit
- Payment Method
- Sold By (User)

**Charts**:
1. **Sales Trend**: Line chart (revenue over time)
2. **Profit Trend**: Line chart (profit over time)
3. **Category Breakdown**: Donut chart
4. **Payment Methods**: Bar chart
5. **Hourly Sales Pattern**: Heatmap (hour vs day)

**Export Options**:
- Export to CSV
- Export to PDF (with charts)
- Email report

**API Endpoints**:
```typescript
GET /api/reports/sales?branch_id=&start_date=&end_date=&category=&payment_method=
GET /api/reports/sales/summary?branch_id=&start_date=&end_date=
GET /api/reports/sales/trends?branch_id=&period=week|month|year
GET /api/reports/sales/export?format=csv|pdf&filters=...
```

---

### 6. **Branch Reports with Photos**

#### Submit Report Form
```typescript
interface ReportForm {
  title: string;                   // Required, max 255 chars
  description: string;             // Required, min 20 chars
  reportType: 'stock_arrival' | 'customer_feedback' | 'issue' | 'event' | 'other';
  image: File | null;              // Optional, max 10MB
}
```

**Features**:
- Rich text editor for description
- Image upload with preview and crop
- Report type categorization
- Draft save functionality

#### View Reports (Branch)
- List of own branch reports
- Filter by type, date
- Status badges (Pending, Reviewed, Resolved)
- Click to view details

#### View Reports (Admin)
- All reports from all branches
- Filter by branch, type, status, date
- Bulk actions (mark as reviewed/resolved)
- Add admin notes/comments
- Image lightbox for viewing photos

**API Endpoints**:
```typescript
POST   /api/reports
GET    /api/reports?branch_id=&type=&status=&page=1
GET    /api/reports/:id
PUT    /api/reports/:id
DELETE /api/reports/:id
POST   /api/reports/:id/comment
PUT    /api/reports/:id/status
```

---

### 7. **Online Product Requests**

#### Request Online Product (Branch)

**Form**:
```typescript
interface OnlineProductRequestForm {
  productName: string;             // Required
  description: string;             // Required, rich text
  category: string;                // Dropdown
  price: number;                   // Required
  discountPercentage: number;      // Optional, 0-100
  image: File;                     // Required, product photo
}
```

**Features**:
- Image upload with quality validation
- Auto-calculate final price with discount
- Preview before submission
- Save as draft

#### View Requests (Branch)
- List of own requests
- Status indicators:
  - **Pending** (Yellow): Awaiting admin review
  - **Approved** (Green): Posted to online shop
  - **Rejected** (Red): Not approved, with reason
- Filter by status
- Click to view details
- Resubmit option for rejected

#### Approve/Reject Requests (Admin)

**Request Review Interface**:
- Grid/List view of pending requests
- Each card shows:
  - Product image
  - Name, category, price
  - Submitted by (branch + user)
  - Submission date
  - Preview button

**Review Modal**:
- Full product details
- Image preview (full size)
- Approve button → Automatically creates online_product
- Reject button → Show reason textarea
- Edit before approve option

**Notification System**:
- Real-time badge count in sidebar
- Toast notification on new request
- Email notification (optional)

**API Endpoints**:
```typescript
POST /api/online-requests
GET  /api/online-requests?branch_id=&status=&page=1
GET  /api/online-requests/:id
PUT  /api/online-requests/:id/approve
PUT  /api/online-requests/:id/reject
DELETE /api/online-requests/:id
```

---

### 8. **Deposits Management**

#### Insert Deposit (Branch)
```typescript
interface DepositForm {
  amount: number;                  // Required, min 1
  depositType: 'cash' | 'bank_transfer' | 'mobile_money';
  referenceNumber: string;         // Optional for cash, required for others
  notes: string;                   // Optional
  depositedAt: Date;               // Default: now, can be backdated
}
```

**Features**:
- Quick amount buttons ($100, $500, $1000, Custom)
- Receipt generation
- Photo upload of deposit slip (optional)

#### View Deposits
**Filters**:
- Date range
- Deposit type
- Min/Max amount

**Summary Cards**:
- Total Deposits (period)
- By Type Breakdown
- Average Deposit

**Table Columns**:
- Date/Time
- Amount (formatted with currency)
- Type (badge)
- Reference Number
- Deposited By
- Notes
- Actions (View Receipt, Edit, Delete)

**API Endpoints**:
```typescript
POST /api/deposits
GET  /api/deposits?branch_id=&start_date=&end_date=&type=&page=1
GET  /api/deposits/:id
PUT  /api/deposits/:id
DELETE /api/deposits/:id
GET  /api/deposits/summary?branch_id=&start_date=&end_date=
```

---

### 9. **User Management (Admin Only)**

#### Users List
**Table Columns**:
- Avatar (generated from initials)
- Username
- Email
- Role (badge)
- Branch (link)
- Status (Active/Inactive toggle)
- Last Login
- Actions (Edit, Delete, View Activity)

**Features**:
- Search by username/email
- Filter by role, branch, status
- Sort by any column
- Bulk activate/deactivate

#### Add/Edit User Form
```typescript
interface UserForm {
  username: string;                // Required, unique
  email: string;                   // Required, valid email
  password: string;                // Required on create, optional on edit
  role: 'admin' | 'branch';       // Required
  branchId: number | null;        // Required if role=branch
  isActive: boolean;              // Default: true
}
```

**Validation**:
- Username: 3-50 chars, alphanumeric + underscore
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Email: Valid format, unique
- Branch required for branch role

#### User Activity Log
- Login history
- Actions performed (created product, recorded sale, etc.)
- Timestamps
- IP address (security)

**API Endpoints**:
```typescript
GET    /api/users?role=&branch_id=&status=&search=&page=1
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/toggle-status
GET    /api/users/:id/activity-log
POST   /api/users/:id/reset-password
```

---

### 10. **Branch Permissions Management (Admin)**

#### Permissions Interface
- Table with branches as rows
- Permission columns as checkboxes
- Toggle all permissions for a branch
- Copy permissions from one branch to another
- History of permission changes

**Permissions**:
```typescript
interface BranchPermissions {
  branchId: number;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canRecordSales: boolean;
  canViewReports: boolean;
  canSubmitReports: boolean;
  canRequestOnlineProducts: boolean;
}
```

**Features**:
- Real-time permission updates
- Permission templates (Full Access, Read Only, Custom)
- Audit log of changes
- Confirmation modal for restrictive changes

**API Endpoints**:
```typescript
GET /api/branch-permissions?branch_id=
PUT /api/branch-permissions/:branch_id
GET /api/branch-permissions/:branch_id/history
```

---

### 11. **Online Shop (Public-Facing)**

#### Shop Homepage
- Hero section with featured products
- Category filter sidebar
- Product grid (responsive: 2/3/4 columns)
- Search bar
- Cart icon with item count
- Sort options (Price, Popularity, New Arrivals)

#### Product Card
- Image (hover effect: show second image or zoom)
- Product name
- Price (with strikethrough if discounted)
- Discount badge (if applicable)
- Rating stars (future)
- Add to Cart button
- Quick View button

#### Product Detail Page
- Image gallery (main + thumbnails)
- Product name, description
- Price, discount
- Stock status
- Quantity selector
- Add to Cart / Buy Now buttons
- Related products section
- Reviews section (future)

#### Cart & Checkout
- Cart sidebar or page
- Product list with quantity controls
- Subtotal, tax, total
- Promo code input (future)
- Checkout button → Redirect to payment

**API Endpoints**:
```typescript
GET /api/shop/products?category=&search=&sort=&page=1
GET /api/shop/products/:id
GET /api/shop/categories
GET /api/shop/featured-products
```

---

## 🔔 Notifications System

### Real-Time Notifications
**Notification Types**:
1. **Admin**:
   - New product pending approval
   - New online product request
   - New quantity update request
   - New branch report submitted
   - Low stock alerts
   
2. **Branch**:
   - Online request approved/rejected
   - Quantity request approved/rejected
   - Admin comments on reports
   - Low stock alerts for own products

### Implementation
```typescript
interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}
```

**Features**:
- Badge count in sidebar/navbar
- Notification dropdown panel
- Mark as read / Mark all as read
- Click to navigate to relevant page
- Auto-refresh every 30 seconds
- WebSocket/SSE for real-time updates (optional)

**API Endpoints**:
```typescript
GET    /api/notifications?is_read=false&limit=20
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

---

## 📊 Charts & Data Visualization

### Required Charts

1. **Profit Trend Chart** (Line Chart)
   - X-axis: Time (days/weeks/months)
   - Y-axis: Profit amount
   - Multiple lines: Revenue, Cost, Profit
   - Tooltip: Show exact values on hover
   - Library: Recharts or Chart.js

2. **Sales by Branch** (Bar Chart)
   - X-axis: Branch names
   - Y-axis: Sales amount
   - Grouped bars: Revenue vs Profit
   - Click bar to view branch details

3. **Category Performance** (Donut/Pie Chart)
   - Segments: Product categories
   - Values: Sales percentage
   - Center text: Total sales
   - Click segment to filter products

4. **Top Products** (Horizontal Bar Chart)
   - Y-axis: Product names
   - X-axis: Profit amount
   - Color gradient based on profit
   - Show top 10 only

5. **Sales Heatmap** (Calendar Heatmap)
   - Days of week vs hours
   - Color intensity: Sales volume
   - Identify peak sales times

### Chart Libraries
**Recommended**: Recharts (React-friendly, responsive, customizable)
```bash
npm install recharts
```

**Alternative**: Chart.js with react-chartjs-2
```bash
npm install chart.js react-chartjs-2
```

---

## 🛠️ Tech Stack & Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-query": "^3.39.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### Backend Dependencies (Node.js)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0",
    "date-fns": "^2.30.0",
    "express-rate-limit": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "@types/express": "^4.17.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "@types/multer": "^1.4.0"
  }
}
```

---

## 🚀 Development Workflow

### Phase 1: Project Setup (Week 1)
**Frontend**:
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS
3. Set up Redux Toolkit store
4. Configure React Router
5. Create base layout components (Navbar, Sidebar, Footer)
6. Set up authentication context
7. Create reusable UI components (Button, Card, Input, etc.)

**Backend**:
1. Initialize Express server
2. Set up MySQL connection
3. Create database schema
4. Implement authentication middleware (JWT)
5. Set up file upload middleware (Multer)
6. Create base API structure

**Deliverables**:
- Working dev environment
- Login/logout functionality
- Basic routing structure
- Component library foundation

---

### Phase 2: Core Features (Week 2-3)

#### Sprint 1: Dashboard & Analytics
- Admin dashboard with stats cards
- Branch dashboard with quick actions
- Profit trend chart
- Sales by branch table
- Real-time data fetching

#### Sprint 2: Product Management
- Product list with filtering/sorting
- Add/Edit product forms with validation
- Image upload and preview
- Barcode generation
- Bulk edit functionality (admin)

#### Sprint 3: Sales Recording
- Multi-step sale form
- Product search and selection
- Cart functionality
- Payment processing
- Receipt generation

---

### Phase 3: Advanced Features (Week 4-5)

#### Sprint 4: Reports & Permissions
- Branch report submission with photo upload
- Admin report viewing interface
- Permission management system
- User activity logs

#### Sprint 5: Online Product Workflow
- Branch online product request form
- Admin approval interface
- Notification system
- Status tracking

#### Sprint 6: Analytics & Exports
- Sales reports with multiple filters
- Advanced charts (heatmap, trends)
- CSV/PDF export functionality
- Email reports

---

### Phase 4: Polish & Testing (Week 6)

#### Sprint 7: UI/UX Refinement
- Responsive design testing (all screen sizes)
- Animation and transitions
- Loading states and skeletons
- Error handling and user feedback
- Accessibility improvements (WCAG 2.1 AA)

#### Sprint 8: Performance & Security
- Code splitting and lazy loading
- Image optimization
- API response caching
- Security audit (XSS, CSRF, SQL injection)
- Rate limiting

#### Sprint 9: Testing & Documentation
- Unit tests (Jest + React Testing Library)
- Integration tests
- E2E tests (Playwright/Cypress)
- API documentation (Swagger)
- User guide and training materials

---

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests
```typescript
// Example: Product form validation
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  it('should show error if selling price < cost price', () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByLabelText('Cost Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Selling Price'), { target: { value: '80' } });
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Selling price must be greater than cost price')).toBeInTheDocument();
  });
});
```

#### Integration Tests
- Test complete user flows
- API integration testing
- Redux state management testing

#### E2E Tests
```typescript
// Example: Complete sale workflow
test('Record a sale from start to finish', async ({ page }) => {
  await page.goto('/branch/sales/new');
  await page.fill('[data-testid="product-search"]', 'Perfume');
  await page.click('[data-testid="product-item-1"]');
  await page.fill('[data-testid="quantity"]', '2');
  await page.click('[data-testid="add-to-cart"]');
  await page.selectOption('[data-testid="payment-method"]', 'cash');
  await page.click('[data-testid="submit-sale"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Backend Testing
- Unit tests for controllers and services
- Integration tests for API endpoints
- Database transaction testing
- Security vulnerability testing

---

## 🔒 Security Requirements

### Authentication
- [x] Password hashing (bcrypt, 10 rounds minimum)
- [x] JWT token with expiration (24 hours)
- [x] Refresh token rotation
- [x] Secure httpOnly cookies
- [x] Rate limiting on login attempts (5 per minute)
- [x] Account lockout after failed attempts

### Authorization
- [x] Role-based access control (RBAC)
- [x] Permission-based actions
- [x] Branch data isolation (users can only see own branch)
- [x] Admin-only endpoints protection

### Data Protection
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (sanitize inputs, escape outputs)
- [x] CSRF protection (tokens on state-changing operations)
- [x] File upload validation (type, size, sanitization)
- [x] HTTPS only in production
- [x] Environment variables for secrets

### API Security
- [x] CORS configuration (whitelist domains)
- [x] Helmet.js for security headers
- [x] Request size limits
- [x] Rate limiting per endpoint
- [x] Input validation (express-validator)
- [x] Error handling (don't expose stack traces)

---

## 📱 Responsive Design Requirements

### Breakpoints
```css
/* Mobile First Approach */
sm: '640px',   /* Small devices (landscape phones) */
md: '768px',   /* Medium devices (tablets) */
lg: '1024px',  /* Large devices (desktops) */
xl: '1280px',  /* Extra large devices (large desktops) */
2xl: '1536px', /* 2X large devices (ultra-wide) */
```

### Mobile Optimizations
1. **Navigation**:
   - Hamburger menu (< 768px)
   - Bottom navigation bar option
   - Swipe gestures for sidebar

2. **Tables**:
   - Horizontal scroll with sticky first column
   - Card view alternative on mobile
   - Hide less important columns

3. **Forms**:
   - Full-width inputs on mobile
   - Larger touch targets (44px minimum)
   - Bottom sheet modals instead of center modals

4. **Charts**:
   - Responsive sizing
   - Simplified mobile versions
   - Touch-friendly tooltips

5. **Images**:
   - Lazy loading
   - Responsive image sets (srcset)
   - WebP with fallbacks

---

## 🎨 Animation & Transitions

### Principles
- **Subtle**: Animations should enhance UX, not distract
- **Fast**: Duration 200-400ms for most interactions
- **Purposeful**: Every animation has a reason

### Framer Motion Examples

```typescript
// Page transitions
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// Usage in page component
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {/* Page content */}
</motion.div>
```

```typescript
// Card hover effect
<motion.div
  whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
  transition={{ duration: 0.2 }}
>
  {/* Card content */}
</motion.div>
```

```typescript
// Staggered list animation
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

<motion.ul variants={containerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

---

## 📈 Performance Optimization

### Frontend Optimization
1. **Code Splitting**:
   ```typescript
   // Lazy load route components
   const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
   const BranchDashboard = lazy(() => import('./pages/branch/Dashboard'));
   ```

2. **Image Optimization**:
   - Use WebP format with fallbacks
   - Implement lazy loading
   - Responsive images (srcset)
   - Image compression (Sharp on backend)

3. **Bundle Optimization**:
   - Tree shaking (Vite handles this)
   - Remove unused dependencies
   - Analyze bundle size (vite-bundle-visualizer)

4. **Caching Strategy**:
   ```typescript
   // React Query cache configuration
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
         refetchOnWindowFocus: false,
       },
     },
   });
   ```

5. **Virtual Scrolling**:
   - Use react-window for large lists
   - Implement pagination
   - Infinite scroll with intersection observer

### Backend Optimization
1. **Database**:
   - Proper indexing (product names, barcodes, dates)
   - Query optimization (avoid N+1 queries)
   - Connection pooling
   - Prepared statements

2. **Caching**:
   - Redis for frequently accessed data
   - Cache dashboard stats (15-minute TTL)
   - Cache product categories

3. **API Optimization**:
   - Gzip compression
   - Response pagination
   - Field selection (only return needed fields)
   - Batch requests

---

## 🌍 Internationalization (i18n) - Future

### Setup
```typescript
// Using react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'dashboard.title': 'Dashboard',
          'dashboard.totalSales': 'Total Sales',
          // ... more translations
        }
      },
      fr: {
        translation: {
          'dashboard.title': 'Tableau de bord',
          'dashboard.totalSales': 'Ventes Totales',
          // ... more translations
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
```

### Supported Languages (Future)
- English (default)
- French (for Rwanda market)
- Kinyarwanda (optional)

---

## 📝 Documentation Requirements

### Code Documentation
- JSDoc comments for all functions
- Component prop documentation
- API endpoint documentation
- README files for each major module

### User Documentation
- User guide (PDF + online)
- Video tutorials
- FAQ section
- Troubleshooting guide

### API Documentation
- Swagger/OpenAPI specification
- Request/response examples
- Error code reference
- Authentication guide

---

## 🚀 Deployment Strategy

### Frontend Deployment
**Recommended**: Vercel or Netlify
```bash
# Build command
npm run build

# Output directory
dist/

# Environment variables
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Backend Deployment
**Recommended**: DigitalOcean, AWS, or Heroku

**Requirements**:
- Node.js 18+
- MySQL 8.0+
- PM2 for process management
- Nginx as reverse proxy
- SSL certificate (Let's Encrypt)

**Environment Variables**:
```bash
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shop_db
DB_USER=shop_user
DB_PASSWORD=secure_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://yourdomain.com
```

### Database Setup
```sql
-- Create production database
CREATE DATABASE shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with limited privileges
CREATE USER 'shop_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop_db.* TO 'shop_user'@'localhost';
FLUSH PRIVILEGES;

-- Run migrations
SOURCE ./migrations/001_create_tables.sql;
SOURCE ./migrations/002_add_indexes.sql;
SOURCE ./migrations/003_seed_data.sql;
```

### Continuous Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🔧 Development Environment Setup

### Prerequisites
```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # 9.0.0 or higher

# MySQL 8.0+
mysql --version # 8.0.0 or higher

# Git
git --version
```

### Frontend Setup
```bash
# Create Vite project
npm create vite@latest shop-management-frontend -- --template react-ts

# Navigate to project
cd shop-management-frontend

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom @reduxjs/toolkit react-redux
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query
npm install recharts date-fns react-toastify framer-motion
npm install lucide-react clsx tailwind-merge

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npm install -D prettier eslint-config-prettier

# Initialize Tailwind
npx tailwindcss init -p

# Start development server
npm run dev
```

### Backend Setup
```bash
# Create backend directory
mkdir shop-management-backend
cd shop-management-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mysql2 bcryptjs jsonwebtoken
npm install dotenv cors helmet express-validator
npm install multer sharp date-fns express-rate-limit

# Install dev dependencies
npm install -D nodemon typescript @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/cors @types/multer

# Create folder structure
mkdir -p src/{controllers,models,routes,middlewares,services,utils,config}
mkdir uploads

# Start development server
npm run dev
```

### Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the setup script
SOURCE ./database/schema.sql;
SOURCE ./database/seed.sql;

# Verify tables created
SHOW TABLES;
```

---

## 📊 Success Metrics & KPIs

### Technical Metrics
- **Performance**:
  - Page load time < 2 seconds
  - Time to Interactive < 3 seconds
  - Lighthouse score > 90
  - API response time < 500ms (p95)

- **Quality**:
  - Test coverage > 80%
  - Zero critical security vulnerabilities
  - Zero console errors
  - Accessibility score (WCAG 2.1 AA compliant)

### Business Metrics
- **Adoption**:
  - Daily active users (DAU)
  - Weekly active users (WAU)
  - Feature utilization rate
  - User satisfaction score

- **Efficiency**:
  - Time saved per transaction
  - Reduction in manual errors
  - Faster approval workflows
  - Improved profit visibility

---

## 🎓 Training & Onboarding

### User Training Materials
1. **Video Tutorials** (10-15 minutes each):
   - Admin: System overview and dashboard
   - Admin: Managing users and permissions
   - Admin: Viewing reports and analytics
   - Branch: Recording sales
   - Branch: Managing inventory
   - Branch: Submitting reports

2. **Interactive Guides**:
   - In-app tooltips (first-time user experience)
   - Contextual help buttons
   - FAQ section
   - Search functionality for help articles

3. **Quick Reference Cards**:
   - Printable cheat sheets
   - Keyboard shortcuts
   - Common workflows

### Developer Documentation
1. **Setup Guide**: Environment setup instructions
2. **Architecture Overview**: System design and data flow
3. **API Reference**: Endpoint documentation with examples
4. **Component Library**: Storybook for UI components
5. **Contributing Guide**: Code style, git workflow, review process

---

## 🔮 Future Enhancements (Roadmap)

### Phase 5: Advanced Analytics (Q1 2027)
- AI-powered sales predictions
- Inventory optimization recommendations
- Customer behavior analysis
- Automated reorder points
- Profit margin optimization alerts

### Phase 6: Mobile App (Q2 2027)
- Native iOS/Android apps (React Native)
- Offline mode with sync
- Push notifications
- Barcode scanner (camera integration)
- Mobile-optimized workflows

### Phase 7: Third-Party Integrations (Q3 2027)
- Accounting software (QuickBooks, Xero)
- Payment gateways (Stripe, PayPal, M-Pesa)
- Email marketing (Mailchimp)
- SMS notifications (Twilio)
- WhatsApp Business API

### Phase 8: Advanced Features (Q4 2027)
- Multi-currency support
- Multi-language support (i18n)
- Customer loyalty program
- Gift cards and vouchers
- Subscription products
- Supplier management
- Purchase orders
- Advanced reporting with custom report builder

---

## 🎯 Final Checklist

### Before Starting Development
- [ ] Review and understand all requirements
- [ ] Set up development environment
- [ ] Create database schema
- [ ] Design UI mockups (Figma recommended)
- [ ] Set up version control (Git + GitHub)
- [ ] Create project management board (Jira, Trello, GitHub Projects)
- [ ] Define coding standards and style guide
- [ ] Set up CI/CD pipeline

### During Development
- [ ] Follow mobile-first responsive design
- [ ] Write unit tests as you code
- [ ] Commit frequently with clear messages
- [ ] Review code before merging
- [ ] Keep dependencies updated
- [ ] Document complex logic
- [ ] Test on multiple browsers
- [ ] Optimize performance continuously

### Before Deployment
- [ ] Complete all features
- [ ] Achieve 80%+ test coverage
- [ ] Fix all critical bugs
- [ ] Run security audit
- [ ] Optimize bundle size
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Create user documentation
- [ ] Train initial users
- [ ] Set up backup strategy
- [ ] Configure production environment

### Post-Deployment
- [ ] Monitor error logs daily
- [ ] Track user feedback
- [ ] Measure performance metrics
- [ ] Plan for scaling
- [ ] Schedule regular maintenance
- [ ] Continue feature development
- [ ] Regular security updates

---

## 📞 Support & Resources

### Community Resources
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Redux Toolkit**: https://redux-toolkit.js.org
- **React Router**: https://reactrouter.com
- **Recharts**: https://recharts.org

### Learning Resources
- **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app
- **Web Security**: https://owasp.org/www-project-top-ten
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref
- **Performance**: https://web.dev/performance

### Development Tools
- **VS Code**: https://code.visualstudio.com
- **React DevTools**: Browser extension
- **Redux DevTools**: Browser extension
- **Postman**: API testing
- **Figma**: UI design
- **GitHub Copilot**: AI pair programming

---

## 📄 License & Legal

### Recommended Licenses
- **MIT License**: Simple and permissive
- **Apache 2.0**: Patent protection included
- **Proprietary**: For commercial closed-source

### Terms of Use
- Define user agreements
- Privacy policy (GDPR compliant if applicable)
- Data retention policy
- Cookie policy

---

## 🎊 Conclusion

This prompt document provides a **complete, production-ready specification** for rebuilding the Shop Management System using modern technologies. The new system will be:

✅ **Professional**: Clean, modern UI with smooth animations  
✅ **Fast**: Optimized performance with lazy loading and caching  
✅ **Secure**: Industry-standard security practices  
✅ **Scalable**: Modular architecture ready for growth  
✅ **Maintainable**: Well-documented, tested, and organized code  
✅ **User-Friendly**: Intuitive interface with great UX  
✅ **Mobile-Responsive**: Works flawlessly on all devices  

### Next Steps
1. **Review this document** thoroughly
2. **Set up development environment** (Frontend + Backend)
3. **Create UI mockups** in Figma (optional but recommended)
4. **Start with Phase 1** (Project Setup)
5. **Follow the development workflow** sprint by sprint
6. **Test continuously** as you build
7. **Deploy and iterate** based on user feedback

**Estimated Timeline**: 6-8 weeks for full implementation (with 1-2 developers)

**Good luck building an amazing Shop Management System!** 🚀

---

**Document Version**: 1.0  
**Created**: January 2027  
**Author**: AI Assistant  
**Status**: Complete & Ready for Development

