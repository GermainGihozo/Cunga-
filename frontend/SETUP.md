# Cunga Frontend Setup Guide

## Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
copy .env.example .env
```

Edit `.env` and update the values:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Generic components (Button, Card, etc.)
│   └── layout/       # Layout components (Navbar, Sidebar, etc.)
├── pages/            # Page components
│   ├── admin/        # Admin dashboard pages
│   ├── auth/         # Authentication pages
│   └── branch/       # Branch dashboard pages
├── services/         # API services
├── store/            # Redux store and slices
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── routes/           # Route configuration
```

## Key Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ TailwindCSS for styling
- ✅ Redux Toolkit for state management
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Path aliases configured (@components, @services, etc.)
- ✅ Responsive design
- ✅ Role-based access control

## Default Credentials

**Admin User:**
- Username: `admin_demo`
- Password: `password123`

**Branch User:**
- Username: `branch_demo`
- Password: `password123`

## Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or change the port in vite.config.ts
```

### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.tmp
npm run build
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Ensure backend is running at `http://localhost:5000`
2. Run the database setup scripts (see backend/database/README.md)
3. Log in with demo credentials
4. Explore the admin or branch dashboards

## Production Build

To create a production build:
```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## Support

For issues or questions, refer to the main project README.md
