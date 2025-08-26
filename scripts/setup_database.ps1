# Master script to set up the CPO OCPI 2.2 database
# This script creates tables and populates them with sample data

Write-Host "🚀 Starting CPO OCPI 2.2 database setup..." -ForegroundColor Green

# Database connection parameters
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "cpo_ocpi"
$DB_USER = "cpo_user"
$DB_PASSWORD = "cpo_ocpi"

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
do {
    try {
        $result = docker exec cursorconcepto-postgres-1 pg_isready -U $DB_USER -d $DB_NAME
        if ($LASTEXITCODE -eq 0) {
            break
        }
    } catch {
        # Continue waiting
    }
    Write-Host "PostgreSQL is not ready yet, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
} while ($true)

Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green

# Execute scripts in order
Write-Host "📊 Creating database tables..." -ForegroundColor Cyan
Get-Content scripts/init_database.sql | docker exec -i cursorconcepto-postgres-1 psql -U $DB_USER -d $DB_NAME

Write-Host "📍 Populating locations..." -ForegroundColor Cyan
Get-Content scripts/populate_database.sql | docker exec -i cursorconcepto-postgres-1 psql -U $DB_USER -d $DB_NAME

Write-Host "🔌 Populating EVSEs..." -ForegroundColor Cyan
Get-Content scripts/populate_evses.sql | docker exec -i cursorconcepto-postgres-1 psql -U $DB_USER -d $DB_NAME

Write-Host "💰 Populating tariffs..." -ForegroundColor Cyan
Get-Content scripts/populate_tariffs.sql | docker exec -i cursorconcepto-postgres-1 psql -U $DB_USER -d $DB_NAME

Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "   - Tables created and configured" -ForegroundColor Gray
Write-Host "   - 75 locations across Spain and Portugal" -ForegroundColor Gray
Write-Host "   - EVSEs distributed (max 50 per location)" -ForegroundColor Gray
Write-Host "   - Basic tariffs configured" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 You can now start the application!" -ForegroundColor Green
