# Cunga Platform - Quick Start Guide

## ⚡ TL;DR

```powershell
# 1. Start Backend
cd backend
npm run dev

# 2. Start Frontend (new terminal)
cd frontend
npm run dev

# 3. Open Browser
# http://localhost:5173

# 4. Login
# Admin: admin_demo / password123
# Branch: branch_demo / password123
```

---

## 🎯 What's New

### ✨ Just Added (100% Complete!)
- 🎨 **Complete Cunga Branding** - Custom colors, gradients, typography
- 👥 **Customer Management** - Loyalty tiers, purchase tracking
- 📊 **Advanced Analytics** - 7 chart types, time filters
- 📈 **Reports Center** - 8 report templates, export options
- 🔔 **Inventory Alerts** - Smart stock monitoring
- 🔐 **Enhanced Login** - Split-screen branded design
- 📚 **Style Guide** - Interactive component library
- ⚙️ **19 New APIs** - Customer, analytics, reports endpoints

---

## 🚀 Quick Commands

### Development
```powershell
# Backend
cd backend && npm run dev          # Start API server (port 5000)

# Frontend
cd frontend && npm run dev         # Start dev server (port 5173)
```

### Database
```powershell
cd backend\database
.\setup-auto.ps1                   # Auto setup with demo data
```

### Dependencies
```powershell
# Install all dependencies
cd frontend && npm install
cd ../backend && npm install
```

---

## 🔗 Important URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:5000/api | REST API |
| **Health Check** | http://localhost:5000/api/health | Server status |
| **Style Guide** | /admin/style-guide | After login as admin |

---

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366F1` | Buttons, links, headers |
| Accent | `#EC4899` | Highlights, badges |
| Success | `#10B981` | Success messages |
| Warning | `#F59E0B` | Warnings, alerts |
| Error | `#EF4444` | Errors, danger actions |

---

## 📱 Key Pages

### Admin Routes (login as admin_demo)
- `/admin/dashboard` - Overview with charts
- `/admin/customers` - Customer management
- `/admin/analytics` - Advanced analytics
- `/admin/reports` - Report generation
- `/admin/style-guide` - Design system docs

### Branch Routes (login as branch_demo)
- `/branch/dashboard` - Branch overview
- `/branch/products` - Product management
- `/branch/sales` - Sales tracking
- `/branch/inventory` - Stock monitoring with alerts

---

## 🔑 Demo Accounts

### Admin Access
```
Username: admin_demo
Password: password123
Access: Full system (analytics, reports, customers)
```

### Branch Manager Access
```
Username: branch_demo
Password: password123
Access: Branch operations (products, sales, inventory)
```

---

## 🎯 Quick Tests

1. **Login Page** → Check split-screen design ✓
2. **Dashboard** → View stat cards with gradients ✓
3. **Products** → Check table with hover effects ✓
4. **Sales** → View payment badges ✓
5. **Customers** → Check loyalty tier badges ✓
6. **Analytics** → View charts with data ✓
7. **Reports** → Select report template ✓
8. **Style Guide** → Copy color codes ✓

---

## 🐛 Quick Fixes

### Server won't start
```powershell
# Kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Import errors (@constants/brand)
```powershell
# Restart Vite server
cd frontend
# Press Ctrl+C to stop
npm run dev
```

### Database errors
```powershell
cd backend\database
.\setup-auto.ps1
```

### Module not found
```powershell
cd frontend
npm install
cd ../backend
npm install
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `TESTING_GUIDE.md` | Complete testing checklist |
| `BRAND_STYLE_GUIDE.md` | Brand & design system |
| `CHANGES_SUMMARY.md` | What changed & why |
| `QUICK_START.md` | This file |

---

## ✅ Success Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Database `cunga_platform` exists with data
- [ ] Can login with demo credentials
- [ ] Dashboard loads with gradient cards
- [ ] No console errors
- [ ] All pages accessible via navigation

---

## 🎉 You're Ready!

Everything is set up and ready to use. Open http://localhost:5173 and start exploring!

**Need help?** Check `TESTING_GUIDE.md` for detailed instructions.

**Want to customize?** Check `BRAND_STYLE_GUIDE.md` for design system docs.

**Curious about changes?** Check `CHANGES_SUMMARY.md` for complete details.

---

**Happy Coding! 🚀**
