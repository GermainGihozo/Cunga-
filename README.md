# Cunga - Multi-Tenant SaaS Shop Management & E-Commerce Platform

A comprehensive, modern SaaS platform for retail business management with multi-tenant architecture, built with React, TypeScript, Node.js, and MySQL.

![Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Progress](https://img.shields.io/badge/Progress-42%25%20(10%2F24%20tasks)-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Overview

Cunga is a full-stack SaaS platform that helps retail businesses manage their operations efficiently. It features multi-branch management, real-time analytics, inventory tracking, POS system, and e-commerce capabilities.

## ✨ Key Features (Currently Implemented)

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Admin/Branch)
- Secure password hashing
- Protected routes and API endpoints

### 📊 Dashboards
- **Admin Dashboard**: System-wide analytics, branch performance, revenue tracking
- **Branch Dashboard**: Sales overview, quick actions, inventory status
- Real-time charts and statistics powered by Recharts
- Customizable date ranges and filters

### 📦 Product Management
- Complete CRUD operations
- Image upload and preview
- Category management
- Stock level tracking
- Low stock alerts
- Advanced search and filtering
- Sortable and paginated lists

### 💰 Sales System (POS)
- Shopping cart functionality
- Real-time stock validation
- Multiple payment methods (Cash, Card, Mobile Money)
- Customer information capture
- Automatic profit calculation
- Receipt generation and printing
- Transaction history

### 📈 Analytics
- Sales trends (7 days / 30 days / 12 months)
- Revenue and profit tracking
- Top selling products
- Branch performance comparison
- Payment method breakdown
- Growth indicators

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.3.3
- **Build Tool**: Vite 5.0.11
- **Styling**: TailwindCSS 3.4.1
- **State Management**: Redux Toolkit 2.0.1
- **Routing**: React Router 6.21.1
- **HTTP Client**: Axios 1.6.5
- **Charts**: Recharts 2.10.3
- **Icons**: Lucide React 0.307.0
- **Form Validation**: Zod 3.22.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

### Development Tools
- ESLint for code quality
- Prettier for formatting (optional)
- TypeScript for type safety
- Git for version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm 9.x or higher

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Cunga-
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Configure environment**
```bash
# Frontend
cd frontend
copy .env.example .env
# Edit .env with your settings

# Backend
cd ../backend
copy .env.example .env
# Edit .env with your MySQL credentials
```

4. **Setup database**
```bash
cd backend/database
# Windows
.\setup.ps1
# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

5. **Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Demo Credentials

**Admin Account:**
- Username: `admin_demo`
- Password: `password123`

**Branch Account:**
- Username: `branch_demo`
- Password: `password123`

## 📁 Project Structure

```
Cunga-/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/     # Generic components
│   │   │   └── layout/     # Layout components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── branch/     # Branch pages
│   │   │   └── auth/       # Auth pages
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Express middlewares
│   │   ├── validators/     # Input validation
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   ├── database/           # Database setup
│   │   ├── schema.sql      # Database schema
│   │   ├── seed.sql        # Seed data
│   │   └── setup scripts   # Setup automation
│   └── uploads/            # File uploads
└── CUNGA_PROJECT/          # Project documentation
```

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - Get started in 5 minutes
- [Verification Checklist](VERIFICATION_CHECKLIST.md) - Complete feature list
- [Frontend Setup](frontend/SETUP.md) - Frontend details
- [Backend Setup](backend/README.md) - Backend API docs
- [Database Schema](backend/database/README.md) - Database structure

## 🎯 Development Status

### ✅ Completed (10/24 tasks - 42%)
1. Frontend structure with Vite + React + TypeScript + TailwindCSS
2. Backend structure with Node.js + Express + MySQL
3. Database schema with 20+ tables and seed data
4. Authentication system with JWT
5. UI component library (14 components)
6. Layout components (Navbar, Sidebar, Footer)
7. Admin Dashboard with analytics
8. Branch Dashboard with quick actions
9. Product Management system
10. Sales Recording system (POS)

### 🚧 In Progress / Planned (14/24 tasks - 58%)
11. Sales Reports & Analytics
12. Branch Reports system
13. Online Product Request workflow
14. User Management system
15. Public Online Shop
16. Subscription Management (Stripe)
17. B2B Marketplace
18. Notifications system
19. Responsive design optimizations
20. Performance optimizations
21. Security enhancements
22. Testing suite
23. Documentation
24. Deployment & CI/CD

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection via Helmet
- Role-based access control
- Secure file upload validation

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Dark mode ready (color scheme)
- Accessibility features (ARIA labels, keyboard navigation)
- Loading states and spinners
- Empty states
- Error handling with user-friendly messages
- Toast notifications
- Modal dialogs
- Pagination
- Search and filtering
- Sortable tables

## 🧪 Testing

```bash
# Frontend tests (when implemented)
cd frontend
npm test

# Backend tests (when implemented)
cd backend
npm test
```

## 🏗️ Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: dist/

# Backend (no build needed, but ensure)
cd backend
# Set NODE_ENV=production in .env
```

## 🚢 Deployment

### Frontend
- Can be deployed to: Vercel, Netlify, AWS S3, Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist/`

### Backend
- Can be deployed to: Heroku, AWS EC2, DigitalOcean, Railway, Render
- Ensure environment variables are set
- Set up production MySQL database

### Database
- MySQL 8.0+ required
- Run production schema and seed scripts
- Set up regular backups
- Configure proper user permissions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development**: Built with ❤️ by Kiro AI
- **Platform**: Multi-tenant SaaS architecture
- **Purpose**: Retail business management

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS
- Recharts for beautiful charts
- Lucide for clean icons
- All open-source contributors

## 📞 Support

- **Documentation**: Check the docs folder
- **Issues**: Open an issue on GitHub
- **Email**: support@cunga.com (example)

## 🗺️ Roadmap

### Phase 1 (Current - 42% Complete)
- ✅ Core platform setup
- ✅ Authentication & authorization
- ✅ Product management
- ✅ Sales system
- ✅ Basic analytics

### Phase 2 (Next)
- 📋 Advanced reporting
- 🛍️ Online shop
- 👥 User management
- 📧 Email notifications

### Phase 3 (Future)
- 💳 Payment integration (Stripe)
- 🏪 B2B Marketplace
- 📱 Mobile app
- 🤖 AI-powered insights

---

**Made with ❤️ using React, TypeScript, Node.js, and MySQL**

**Status**: Active Development | **Version**: 1.0.0-alpha | **Last Updated**: 2026-08-20
