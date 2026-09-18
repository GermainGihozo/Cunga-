# Cunga Platform Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- MySQL running (default port 3306)
- Database `cunga_platform` created with demo data

### Starting the Application

1. **Start Backend Server**
   ```powershell
   cd backend
   npm run dev
   ```
   - Server runs on: `http://localhost:5000`
   - API base: `http://localhost:5000/api`

2. **Start Frontend Dev Server**
   ```powershell
   cd frontend
   npm run dev
   ```
   - App runs on: `http://localhost:5173`

---

## 🔐 Demo Credentials

### Admin Account
- **Username:** `admin_demo`
- **Password:** `password123`
- **Access:** Full system access including analytics, reports, customer management

### Branch Manager Account
- **Username:** `branch_demo`
- **Password:** `password123`
- **Access:** Branch-level operations (products, sales, inventory)

---

## ✅ Features to Test

### 1. Authentication & Branding
- [ ] Visit login page - Check split-screen design with Cunga branding
- [ ] Test login with demo credentials
- [ ] Check logo display in navbar
- [ ] Verify gradient backgrounds and color scheme

### 2. Admin Dashboard (`/admin/dashboard`)
- [ ] View 4 stat cards with gradient backgrounds
- [ ] Check animated hover effects on cards
- [ ] View sales chart with brand colors
- [ ] Check top products with medal rankings (🥇🥈🥉)

### 3. Products Management (`/branch/products`)
- [ ] View 4 product stat cards (Total, In Stock, Low Stock, Out of Stock)
- [ ] Check product table with gradient header
- [ ] Test search and filter functionality
- [ ] Hover over product images (should scale)
- [ ] View profit margin progress bars
- [ ] Test action buttons (Edit, Delete, View)

### 4. Sales Management (`/branch/sales`)
- [ ] View sales stat cards with gradient backgrounds
- [ ] Check animated cart badge with pulse effect
- [ ] View sales table with receipt icons
- [ ] Check payment method badges (Cash, Card, Mobile Money)
- [ ] View profit indicators with trending icons

### 5. Inventory Alerts (`/branch/inventory`)
- [ ] View inventory overview stats
- [ ] Check alert severity levels (high/medium/low)
- [ ] Test filter buttons for severity
- [ ] Dismiss alert cards
- [ ] View stock level progress bars

### 6. Customer Management (`/admin/customers`)
- [ ] View customer stat cards
- [ ] Check customer table with avatars
- [ ] View loyalty tier badges (Bronze, Silver, Gold, Platinum)
- [ ] Test search functionality
- [ ] Open customer details modal
- [ ] Test Add/Edit/Delete customer modals

### 7. Analytics Dashboard (`/admin/analytics`)
- [ ] View 4 key metric cards with growth indicators
- [ ] Test time range selector (7/30/90 days, year)
- [ ] View revenue & profit area chart with gradients
- [ ] Check top products horizontal bar chart
- [ ] View category distribution pie chart
- [ ] Check branch performance comparison
- [ ] View business trends multi-line chart
- [ ] Test refresh button
- [ ] Test export report button

### 8. Reports Center (`/admin/reports`)
- [ ] View report statistics cards
- [ ] Browse 8 report templates
- [ ] Select a report type
- [ ] Choose date range
- [ ] Select export format (PDF/Excel/CSV)
- [ ] Test Generate Report button
- [ ] Test Print and Email buttons

### 9. Style Guide (`/admin/style-guide`)
- [ ] View brand identity section with logo
- [ ] Click color swatches to copy hex codes
- [ ] Check typography examples
- [ ] View gradient demonstrations
- [ ] Check component examples (buttons, badges, alerts, inputs)
- [ ] Test code snippet copy functionality

### 10. Authentication Pages
- [ ] Visit `/login` - Check split-screen with features
- [ ] Visit `/register` - Check coming soon page
- [ ] Test "Back to home" link
- [ ] Check responsive design on mobile

---

## 🎨 Visual Elements to Verify

### Colors
- **Primary (Indigo):** `#6366F1` - Main buttons, links, headers
- **Accent (Pink):** `#EC4899` - Secondary elements, highlights
- **Success (Green):** `#10B981` - Success messages, positive metrics
- **Warning (Orange):** `#F59E0B` - Warnings, alerts
- **Error (Red):** `#EF4444` - Errors, destructive actions

### Gradients
- **Primary Gradient:** Indigo → Dark Indigo
- **Cunga Gradient:** Indigo → Pink (brand signature)
- **Success Gradient:** Green → Dark Green
- **Warning Gradient:** Orange → Dark Orange

### Typography
- **Headings:** Poppins (font-display)
- **Body Text:** Inter (font-sans)
- **Sizes:** xs (12px) to 5xl (48px)

### Animations
- Card hover: Lift effect with enhanced shadow
- Button hover: Scale and shadow enhancement
- Loading: Smooth spinner animations
- Page transitions: Fade in and slide effects

---

## 🔧 API Endpoints to Test

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Customers
- `GET /api/customers` - List customers (with pagination)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/loyalty` - Update loyalty points
- `GET /api/customers/stats` - Get customer statistics

### Analytics
- `GET /api/analytics/metrics` - Key metrics summary
- `GET /api/analytics/revenue-trends` - Revenue trends
- `GET /api/analytics/top-products` - Top selling products
- `GET /api/analytics/category-distribution` - Category breakdown
- `GET /api/analytics/branch-comparison` - Branch performance
- `GET /api/analytics/business-trends` - Business trends
- `GET /api/analytics/inventory-alerts` - Inventory alerts

### Reports
- `GET /api/reports/sales-summary` - Sales summary report
- `GET /api/reports/inventory-status` - Inventory status
- `GET /api/reports/financial-statement` - Financial statement
- `GET /api/reports/customer-analysis` - Customer analysis
- `GET /api/reports/product-performance` - Product performance

---

## 🐛 Common Issues & Solutions

### Issue: Port already in use
**Solution:** 
```powershell
# Find and kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find and kill process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Database connection error
**Solution:**
- Check MySQL is running
- Verify database `cunga_platform` exists
- Check `.env` file in backend has correct credentials
- Run database setup: `cd backend\database && .\setup-auto.ps1`

### Issue: Module not found errors
**Solution:**
```powershell
# Reinstall dependencies
cd frontend
rm -r node_modules
npm install

cd ../backend
rm -r node_modules
npm install
```

### Issue: Import path errors (@constants/brand)
**Solution:**
- Restart Vite dev server after config changes
- Clear Vite cache: `rm -r frontend/node_modules/.vite`
- Verify path aliases in `vite.config.ts` and `tsconfig.app.json`

### Issue: CORS errors
**Solution:**
- Check backend server is running on port 5000
- Verify frontend is calling `http://localhost:5000/api`
- Check CORS configuration in `backend/src/server.js`

---

## 📊 Test Data Available

### Products
- 10+ sample products across categories
- Various stock levels (in stock, low stock, out of stock)
- Different price ranges

### Sales
- Transaction history with various payment methods
- Customer purchases linked to customer records
- Profit margins calculated

### Customers
- Multiple customer accounts
- Different loyalty tiers
- Purchase history

### Branches
- Main Store
- Downtown Branch
- Mall Branch
- Airport Branch

---

## ✨ Key Features Implemented

### Design & Branding ✅
- Complete Cunga color system (Primary #6366F1, Accent #EC4899)
- Custom gradients and shadows
- Poppins/Inter typography
- Animated hover effects
- Responsive design

### Customer Management ✅
- Full CRUD operations
- Loyalty tier system (Bronze/Silver/Gold/Platinum)
- Purchase tracking
- Customer statistics

### Analytics & Reporting ✅
- Multiple chart types (Area, Bar, Pie, Line)
- Time range filtering
- Branch comparison
- Export functionality
- 8 report templates

### Inventory Management ✅
- Stock level monitoring
- Alert system (Out of Stock, Critical Low, Low Stock)
- Severity filtering
- Reorder notifications

### Backend API ✅
- 19 new API endpoints
- Authentication middleware
- Pagination support
- Search and filtering

---

## 📝 Notes

- All pages use Cunga branding with gradient effects
- Mock data used where backend not yet connected
- Some features (like actual PDF export) are UI-only
- Database queries optimized for performance
- Responsive design works on mobile, tablet, desktop

---

## 🎯 Success Criteria

The platform is working correctly if:
1. ✅ Login page displays with split-screen branded design
2. ✅ Demo credentials work for both admin and branch users
3. ✅ All dashboard cards display with gradient backgrounds
4. ✅ Charts render with brand colors
5. ✅ Tables show data with proper formatting
6. ✅ Modals open and close properly
7. ✅ Navigation works between all pages
8. ✅ API endpoints return data (check Network tab)
9. ✅ Hover effects and animations work smoothly
10. ✅ No console errors (except expected mock data notices)

---

## 🔗 Quick Links

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health
- **Style Guide:** http://localhost:5173/admin/style-guide (after login as admin)

---

## 📞 Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Verify all services are running
3. Check database connection
4. Review the Common Issues section above
5. Restart both frontend and backend servers

---

**Happy Testing! 🎉**
