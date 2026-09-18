# ============================================
# Cunga Database Setup Script (Auto Mode)
# ============================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Cunga Database Auto Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file
$envPath = Join-Path -Path (Split-Path -Parent $PSScriptRoot) -ChildPath ".env"
Write-Host "Loading .env from: $envPath" -ForegroundColor Cyan

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
    Write-Host ".env file loaded" -ForegroundColor Green
} else {
    Write-Host "Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# Database credentials
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "cunga_db" }
$dbPassword = $env:DB_PASSWORD

Write-Host "Database Config:" -ForegroundColor Cyan
Write-Host "  Host: $dbHost" -ForegroundColor Yellow
Write-Host "  Port: $dbPort" -ForegroundColor Yellow
Write-Host "  User: $dbUser" -ForegroundColor Yellow
Write-Host "  DB Name: $dbName" -ForegroundColor Yellow
Write-Host "  Password: $(if ($dbPassword) { '***' } else { '(empty)' })" -ForegroundColor Yellow
Write-Host ""

# Find MySQL executable
$mysqlPaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.27\bin\mysql.exe"
)

$mysqlCmd = $null
foreach ($path in $mysqlPaths) {
    try {
        $null = Get-Command $path -ErrorAction SilentlyContinue
        if ($?) {
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
    Write-Host ""
    Write-Host "Common MySQL locations:" -ForegroundColor Cyan
    Write-Host "  - C:\Program Files\MySQL\MySQL Server X.X\bin\mysql.exe"
    Write-Host "  - C:\xampp\mysql\bin\mysql.exe"
    Write-Host "  - C:\wamp64\bin\mysql\mysqlX.X.XX\bin\mysql.exe"
    Write-Host ""
    Write-Host "Please add MySQL to your PATH or update this script" -ForegroundColor Yellow
    exit 1
}

# Test MySQL connection
Write-Host ""
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow

if ($dbPassword) {
    $testResult = & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -p"$dbPassword" -e "SELECT 1" 2>&1
} else {
    $testResult = & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -e "SELECT 1" 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL connection successful!" -ForegroundColor Green
} else {
    Write-Host "Failed to connect to MySQL" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
    exit 1
}

# File paths
$schemaFile = Join-Path $PSScriptRoot "schema.sql"
$seedFile = Join-Path $PSScriptRoot "seed.sql"

if (!(Test-Path $schemaFile)) {
    Write-Host "Error: schema.sql not found" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $seedFile)) {
    Write-Host "Error: seed.sql not found" -ForegroundColor Red
    exit 1
}

# Run full setup
Write-Host ""
Write-Host "=========================================="-ForegroundColor Green
Write-Host "Starting Full Database Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Create schema
Write-Host "Step 1/2: Creating database and schema..." -ForegroundColor Cyan

if ($dbPassword) {
    Get-Content $schemaFile | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -p"$dbPassword"
} else {
    Get-Content $schemaFile | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Database and schema created!" -ForegroundColor Green
} else {
    Write-Host "  Failed to create schema" -ForegroundColor Red
    exit 1
}

# Step 2: Insert seed data
Write-Host "Step 2/2: Inserting seed data..." -ForegroundColor Cyan

if ($dbPassword) {
    Get-Content $seedFile | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser -p"$dbPassword" $dbName
} else {
    Get-Content $seedFile | & $mysqlCmd -h $dbHost -P $dbPort -u $dbUser $dbName
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Seed data inserted!" -ForegroundColor Green
} else {
    Write-Host "  Failed to insert seed data" -ForegroundColor Red
    exit 1
}

# Success!
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Database Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Login Credentials:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Account:" -ForegroundColor Yellow
Write-Host "  Username: admin_demo"
Write-Host "  Password: password123"
Write-Host ""
Write-Host "Branch Account:" -ForegroundColor Yellow
Write-Host "  Username: branch_demo"
Write-Host "  Password: password123"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend Server:" -ForegroundColor Yellow
Write-Host "   cd ..\..\"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "2. Start Frontend (in new terminal):" -ForegroundColor Yellow
Write-Host "   cd ..\..\..\ frontend"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "3. Open Browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173"
Write-Host ""
