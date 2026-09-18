# ============================================
# Cunga Database Setup Script (PowerShell)
# ============================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Cunga Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file
$envFile = Join-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath "..") -ChildPath ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
} else {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Database credentials with defaults
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "cunga_db" }

# Get password
if ($env:DB_PASSWORD -and $env:DB_PASSWORD -ne "your_password_here" -and $env:DB_PASSWORD -ne "") {
    $dbPassword = $env:DB_PASSWORD
    Write-Host "Using password from .env file" -ForegroundColor Green
    $passwordArg = "-p`"$dbPassword`""
} elseif ($env:DB_PASSWORD -eq "") {
    Write-Host "Using no password (empty password from .env)" -ForegroundColor Green
    $dbPassword = ""
    $passwordArg = ""
} else {
    $securePassword = Read-Host "Enter MySQL password for $dbUser (press Enter for no password)" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $dbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    if ($dbPassword) {
        $passwordArg = "-p`"$dbPassword`""
    } else {
        $passwordArg = ""
    }
}

# Find MySQL executable
$mysqlPaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe"
)

$mysqlCmd = $null
foreach ($path in $mysqlPaths) {
    try {
        $result = Get-Command $path -ErrorAction SilentlyContinue
        if ($result) {
            $mysqlCmd = $path
            Write-Host "Found MySQL at: $mysqlCmd" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $mysqlCmd) {
    Write-Host "Error: MySQL executable not found" -ForegroundColor Red
    Write-Host "Please ensure MySQL is installed and added to PATH, or update the script with the correct path" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common locations:" -ForegroundColor Cyan
    Write-Host "  - C:\Program Files\MySQL\MySQL Server X.X\bin\mysql.exe"
    Write-Host "  - C:\xampp\mysql\bin\mysql.exe"
    Write-Host "  - C:\wamp64\bin\mysql\mysqlX.X.XX\bin\mysql.exe"
    exit 1
}

# Test MySQL availability
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow

if ($passwordArg) {
    $testOutput = & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $passwordArg -e "SELECT 1" 2>&1
} else {
    $testOutput = & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -e "SELECT 1" 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Connection successful!" -ForegroundColor Green
} else {
    Write-Host "Failed to connect to MySQL" -ForegroundColor Red
    Write-Host "Please check your database credentials and ensure MySQL is running" -ForegroundColor Yellow
    Write-Host "Error: $testOutput" -ForegroundColor Red
    exit 1
}

# Menu
Write-Host ""
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Create database and schema (fresh install)"
Write-Host "2. Run schema only (database exists)"
Write-Host "3. Run seed data only"
Write-Host "4. Full setup (schema + seed data)" -ForegroundColor Yellow
Write-Host "5. Drop database (WARNING: destructive)"
Write-Host ""

$choice = Read-Host "Enter your choice [1-5]"

$schemaFile       = Join-Path $PSScriptRoot "schema.sql"
$sellerSchemaFile = Join-Path $PSScriptRoot "seller_schema.sql"
$seedFile         = Join-Path $PSScriptRoot "seed.sql"

# Helper: run a SQL file against the server (no DB arg — file uses USE statement)
function Invoke-SqlFile {
    param([string]$File, [string]$Label)
    Write-Host "  Running $Label..." -ForegroundColor Cyan
    if ($passwordArg) {
        Get-Content $File | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $passwordArg
    } else {
        Get-Content $File | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Failed: $Label" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Done: $Label" -ForegroundColor Green
}

# Helper: run a SQL file against a specific database
function Invoke-SqlFileOnDb {
    param([string]$File, [string]$Label)
    Write-Host "  Running $Label..." -ForegroundColor Cyan
    if ($passwordArg) {
        Get-Content $File | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $passwordArg $dbName
    } else {
        Get-Content $File | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $dbName
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Failed: $Label" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Done: $Label" -ForegroundColor Green
}

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Creating database and schema..." -ForegroundColor Yellow
        Invoke-SqlFile -File $schemaFile -Label "Main schema (schema.sql)"
        Invoke-SqlFile -File $sellerSchemaFile -Label "Marketplace seller schema (seller_schema.sql)"
        Write-Host "Database and schema created successfully!" -ForegroundColor Green
    }

    "2" {
        Write-Host ""
        Write-Host "Running schema only..." -ForegroundColor Yellow
        Invoke-SqlFile -File $schemaFile -Label "Main schema (schema.sql)"
        Invoke-SqlFile -File $sellerSchemaFile -Label "Marketplace seller schema (seller_schema.sql)"
        Write-Host "Schema updated successfully!" -ForegroundColor Green
    }

    "3" {
        Write-Host ""
        Write-Host "Running seed data..." -ForegroundColor Yellow
        Invoke-SqlFileOnDb -File $seedFile -Label "Seed data (seed.sql)"
        Write-Host "Seed data inserted successfully!" -ForegroundColor Green
    }

    "4" {
        Write-Host ""
        Write-Host "Running full setup (schema + seller schema + seed)..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Step 1/3: Main schema" -ForegroundColor Cyan
        Invoke-SqlFile -File $schemaFile -Label "schema.sql"

        Write-Host "Step 2/3: Marketplace seller schema" -ForegroundColor Cyan
        Invoke-SqlFile -File $sellerSchemaFile -Label "seller_schema.sql"

        Write-Host "Step 3/3: Seed data" -ForegroundColor Cyan
        Invoke-SqlFileOnDb -File $seedFile -Label "seed.sql"

        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "Full setup complete!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default SaaS login credentials:" -ForegroundColor Cyan
        Write-Host "  Username: admin_demo" -ForegroundColor Yellow
        Write-Host "  Password: password123" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Seller marketplace tables also created." -ForegroundColor Cyan
        Write-Host "Register a seller at: http://localhost:5173/seller/register" -ForegroundColor Yellow
        Write-Host ""
    }

    "5" {
        Write-Host ""
        $confirm = Read-Host "Are you sure you want to DROP the database '$dbName'? Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            Write-Host "Dropping database..." -ForegroundColor Yellow
            if ($passwordArg) {
                & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $passwordArg -e "DROP DATABASE IF EXISTS $dbName"
            } else {
                & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -e "DROP DATABASE IF EXISTS $dbName"
            }
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Database '$dbName' dropped." -ForegroundColor Green
            } else {
                Write-Host "Failed to drop database." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Cancelled." -ForegroundColor Yellow
        }
    }

    default {
        Write-Host "Invalid choice." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup script completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
