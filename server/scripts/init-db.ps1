# RewriteBot Database Initialization Script (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🗄️  Initializing RewriteBot Database..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "   Please set it in your .env file" -ForegroundColor Yellow
    exit 1
}

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

# Seed database
Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Cyan
npx tsx prisma/seed.ts

Write-Host ""
Write-Host "✅ Database initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor Cyan
Write-Host "  Email: demo@rewritebot.com" -ForegroundColor White
Write-Host "  Password: demo123456" -ForegroundColor White
