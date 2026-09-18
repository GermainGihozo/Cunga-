# Cunga Database Schema

## Overview

This directory contains the database schema and seed data for the Cunga SaaS Platform.

## Database Structure

### Core Tables

#### Multi-Tenancy
- **tenants** - Multi-tenant business organizations
- **subscription_plans** - Available subscription tiers
- **branches** - Physical store branches per tenant

#### User Management
- **users** - System users (admin & branch)
- **branch_permissions** - Granular permissions per branch

#### Inventory & Sales
- **products** - Product inventory management
- **sales** - Sales transactions and profit tracking
- **categories** - Product categorization

#### Reports & Requests
- **reports** - Branch reports with photos
- **online_product_requests** - Products requested for online shop
- **product_update_requests** - Product modification requests

#### E-Commerce
- **online_products** - Products listed in online shop
- **orders** - Customer orders
- **order_items** - Order line items

#### Financial
- **deposits** - Cash deposits tracking

#### System
- **notifications** - User notifications
- **activity_logs** - Audit trail
- **refresh_tokens** - JWT refresh token storage

### Database Views

- **product_inventory_summary** - Aggregated product data with profit calculations
- **sales_summary** - Enhanced sales view with related data

## Setup Instructions

### 1. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run schema
source schema.sql

# Run seed data (optional, for development)
source seed.sql
```

### 2. Using PowerShell (Windows)

```powershell
# Create database and schema
Get-Content schema.sql | mysql -u root -p

# Seed data
Get-Content seed.sql | mysql -u root -p
```

### 3. Environment Configuration

Update your `.env` file with database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cunga_db
DB_USER=root
DB_PASSWORD=your_password
```

## Seed Data

The seed data includes:

### Subscription Plans
1. **Starter** - $29/month - 1 branch, 3 users, 100 products
2. **Professional** - $79/month - 5 branches, 15 users, 1000 products
3. **Enterprise** - $199/month - Unlimited everything

### Demo Tenants
1. **Demo Retail Store** - Trial status
2. **Fashion Boutique** - Active status
3. **Tech Electronics** - Active status

### Default Users

All users have the password: `password123`

#### Demo Retail Store
- Admin: `admin_demo` / `password123`
- Branch: `branch_demo` / `password123`

#### Fashion Boutique
- Admin: `admin_fashion` / `password123`
- Branch: `branch_uptown` / `password123`
- Branch: `branch_downtown` / `password123`

#### Tech Electronics
- Admin: `admin_tech` / `password123`
- Branch: `branch_central` / `password123`
- Branch: `branch_north` / `password123`
- Branch: `branch_south` / `password123`

### Sample Data
- 13 products across different categories
- 7 sales transactions
- 3 branch reports
- 3 online products
- 3 deposit records

## Schema Design Decisions

### Multi-Tenancy
- **Strategy**: Single database with tenant_id isolation
- **Benefits**: Cost-effective, easier maintenance, simpler backups
- **Trade-offs**: Requires careful query filtering, potential for data leakage if not properly implemented

### Indexing
- Primary indexes on all foreign keys
- Composite indexes on frequently queried columns
- Status and date columns indexed for filtering

### Data Integrity
- Foreign key constraints with appropriate CASCADE/RESTRICT actions
- ENUM types for predefined values
- NOT NULL constraints on critical fields
- UNIQUE constraints on business logic requirements

### Cascading Rules
- **CASCADE**: Used for tenant/branch deletion to remove all child records
- **RESTRICT**: Used for critical references (products in sales)
- **SET NULL**: Used for optional references (reviewed_by)

## Performance Considerations

### Indexes
All foreign keys are indexed. Additional indexes on:
- Tenant IDs (for multi-tenant filtering)
- Status fields (for filtering)
- Date fields (for time-based queries)
- Search fields (name, email, barcode)

### Views
Pre-defined views for common complex queries to improve query performance and code reusability.

### Connection Pooling
The application uses connection pooling (max 10 connections) for optimal performance.

## Backup Strategy

### Recommended Backup Schedule
- **Full backup**: Daily at 2 AM
- **Incremental backup**: Every 6 hours
- **Transaction logs**: Continuous

### Backup Commands

```bash
# Full backup
mysqldump -u root -p cunga_db > backup_$(date +%Y%m%d).sql

# Backup schema only
mysqldump -u root -p --no-data cunga_db > schema_backup.sql

# Backup with compression
mysqldump -u root -p cunga_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Commands

```bash
# Restore from backup
mysql -u root -p cunga_db < backup_20260820.sql

# Restore from compressed backup
gunzip < backup_20260820.sql.gz | mysql -u root -p cunga_db
```

## Migrations

### Future Migrations

As the application evolves, create migration files in this directory:

```
database/
├── schema.sql          # Base schema
├── seed.sql            # Seed data
├── migrations/
│   ├── 001_add_column_xyz.sql
│   ├── 002_create_index_abc.sql
│   └── ...
```

### Migration Best Practices

1. Always include UP and DOWN migrations
2. Test migrations on development data first
3. Backup production database before applying migrations
4. Use transactions where possible
5. Document the purpose of each migration

## Monitoring

### Key Metrics to Monitor
- Table sizes and growth rate
- Query performance (slow query log)
- Connection pool usage
- Deadlocks and lock waits
- Replication lag (if using replication)

### Useful Queries

```sql
-- Check table sizes
SELECT 
    table_name AS `Table`,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS `Size (MB)`
FROM information_schema.TABLES
WHERE table_schema = 'cunga_db'
ORDER BY (data_length + index_length) DESC;

-- Check active connections
SHOW PROCESSLIST;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query%';
```

## Security

### Best Practices Implemented
- Passwords hashed with bcrypt (10 rounds)
- Separate database user with limited privileges (not root in production)
- No sensitive data in plain text
- SQL injection prevention (parameterized queries)

### Production Database User

```sql
-- Create dedicated user for production
CREATE USER 'cunga_app'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON cunga_db.* TO 'cunga_app'@'localhost';
FLUSH PRIVILEGES;
```

## Troubleshooting

### Common Issues

#### Connection Failed
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Check firewall settings

#### Permission Denied
- Verify user has correct privileges
- Check user host restrictions

#### Table doesn't exist
- Ensure schema.sql has been run
- Check database name in connection

## Support

For database-related issues:
1. Check error logs: `/var/log/mysql/error.log`
2. Review slow query log
3. Check application logs
4. Contact database administrator

## Version History

- **v2.0.0** (2026-08-20) - Initial multi-tenant schema
- Complete redesign for SaaS architecture
- Added subscription management
- Implemented multi-tenancy
