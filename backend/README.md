# Cunga Backend API

RESTful API server for the Cunga SaaS Platform built with Node.js, Express, and MySQL.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with Promise support
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation
- **Express Rate Limit** - API rate limiting
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   └── ...
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   │   └── index.js     # Main router
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   ├── errorHandler.js
│   │   ├── upload.js    # File upload
│   │   └── validate.js  # Validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   │   └── helpers.js   # Common utilities
│   └── server.js        # Application entry point
├── uploads/             # File uploads storage
│   ├── products/
│   ├── reports/
│   └── receipts/
├── package.json
├── .env.example
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation Steps

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Configure your `.env` file with your database credentials and other settings

5. Create the database:

```bash
mysql -u root -p
CREATE DATABASE cunga_db;
exit
```

6. Run database migrations (will be created):

```bash
# Migration scripts will be added
```

7. Start development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📜 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. Client sends POST request to `/api/auth/login` with username and password
2. Server validates credentials and returns JWT token
3. Client stores token and includes it in subsequent requests
4. Server validates token on protected routes

### Token Format

Include token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **admin** - Full system access
- **branch** - Branch-specific access

## 🛣️ API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Branches (Admin only)
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create new branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Record new sale
- `GET /api/sales/reports` - Get sales reports

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Submit new report
- `PUT /api/reports/:id/status` - Update report status

### Analytics (Admin only)
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/profit` - Get profit analytics

## 🔒 Security Features

- **Helmet.js** - Sets security HTTP headers
- **CORS** - Configured for specific origins
- **Rate Limiting** - Prevents abuse (100 requests per 15 minutes)
- **JWT** - Secure token-based authentication
- **Bcrypt** - Password hashing with salt rounds
- **Input Validation** - Express-validator for all inputs
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Validation** - Type and size restrictions

## 📊 Database Schema

The database schema includes the following main tables:

- **users** - User accounts (admin, branch)
- **branches** - Store branches
- **products** - Product inventory
- **sales** - Sales transactions
- **reports** - Branch reports
- **online_product_requests** - Product requests for online shop
- **deposits** - Cash deposits
- **tenants** - Multi-tenant support

See the complete schema in the database migration files.

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origin
- `UPLOAD_DIR` - File upload directory

### Database Connection

Connection pool is configured in `src/config/database.js` with:
- Connection limit: 10
- Automatic reconnection
- Promise-based queries

## 🧪 Testing

Testing suite to be implemented with:
- **Jest** - Testing framework
- **Supertest** - HTTP assertions

```bash
npm test
```

## 📦 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

### Deploy with PM2

```bash
npm install -g pm2
pm2 start src/server.js --name cunga-api
pm2 save
pm2 startup
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code follows style guide
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
- Email: support@cunga.com
- Documentation: https://docs.cunga.com
- GitHub Issues: https://github.com/cunga/api/issues
