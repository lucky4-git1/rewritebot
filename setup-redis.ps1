# Redis Setup Script for Windows
Write-Host "Setting up Redis for Windows..." -ForegroundColor Green

$redisDir = "redis"
$redisUrl = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip"
$redisZip = "redis.zip"

# Download Redis
if (!(Test-Path $redisDir)) {
    Write-Host "Downloading Redis..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $redisUrl -OutFile $redisZip
    
    Write-Host "Extracting Redis..." -ForegroundColor Yellow
    Expand-Archive -Path $redisZip -DestinationPath $redisDir -Force
    Remove-Item $redisZip
    
    Write-Host "✅ Redis downloaded successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Redis already exists" -ForegroundColor Green
}

# Start Redis
Write-Host ""
Write-Host "Starting Redis server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop Redis" -ForegroundColor Cyan
Write-Host ""

Set-Location $redisDir
.\redis-server.exe
