#!/bin/bash

# ============================================
# Cunga Database Setup Script
# ============================================

echo "=========================================="
echo "Cunga Database Setup"
echo "=========================================="

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Database credentials
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_NAME="${DB_NAME:-cunga_db}"

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter MySQL password for $DB_USER: " DB_PASSWORD
    echo
fi

# Test connection
echo "Testing database connection..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to MySQL"
    echo "Please check your database credentials"
    exit 1
fi

echo "✓ Connection successful"

# Menu
echo ""
echo "What would you like to do?"
echo "1) Create database and schema (fresh install)"
echo "2) Run schema only (database exists)"
echo "3) Run seed data only"
echo "4) Full setup (schema + seed data)"
echo "5) Drop database (WARNING: destructive)"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        echo "Creating database and schema..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < schema.sql
        echo "✓ Database and schema created"
        ;;
    2)
        echo "Running schema..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < schema.sql
        echo "✓ Schema updated"
        ;;
    3)
        echo "Running seed data..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < seed.sql
        echo "✓ Seed data inserted"
        ;;
    4)
        echo "Running full setup..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < schema.sql
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < seed.sql
        echo "✓ Full setup complete"
        echo ""
        echo "Default login credentials:"
        echo "  Username: admin_demo"
        echo "  Password: password123"
        ;;
    5)
        read -p "Are you sure you want to DROP the database? [yes/NO]: " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Dropping database..."
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME"
            echo "✓ Database dropped"
        else
            echo "Cancelled"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
