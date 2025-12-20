# BloomCart Backend Setup Script
# Run this script after installing PHP and Composer

Write-Host "BloomCart Backend Setup" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

# Check if PHP is installed
Write-Host "Checking PHP installation..." -ForegroundColor Yellow
try {
    $phpVersion = php --version
    Write-Host "✓ PHP is installed" -ForegroundColor Green
    Write-Host $phpVersion[0] -ForegroundColor Gray
} catch {
    Write-Host "✗ PHP is not installed" -ForegroundColor Red
    Write-Host "Please install PHP 8.1+ from https://windows.php.net/download/" -ForegroundColor Yellow
    Write-Host "Or install Laravel Herd from https://herd.laravel.com/" -ForegroundColor Yellow
    exit 1
}

# Check if Composer is installed
Write-Host ""
Write-Host "Checking Composer installation..." -ForegroundColor Yellow
try {
    $composerVersion = composer --version
    Write-Host "✓ Composer is installed" -ForegroundColor Green
    Write-Host $composerVersion -ForegroundColor Gray
} catch {
    Write-Host "✗ Composer is not installed" -ForegroundColor Red
    Write-Host "Please install Composer from https://getcomposer.org/download/" -ForegroundColor Yellow
    exit 1
}

# Install Laravel dependencies
Write-Host ""
Write-Host "Installing Laravel dependencies..." -ForegroundColor Yellow
composer install

# Copy .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
}

# Generate application key
Write-Host ""
Write-Host "Generating application key..." -ForegroundColor Yellow
php artisan key:generate

# Install Laravel Sanctum
Write-Host ""
Write-Host "Installing Laravel Sanctum..." -ForegroundColor Yellow
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

Write-Host ""
Write-Host "======================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a MySQL database named 'bloomcart'" -ForegroundColor White
Write-Host "2. Update .env with your database credentials" -ForegroundColor White
Write-Host "3. Run: php artisan migrate" -ForegroundColor White
Write-Host "4. Run: php artisan serve" -ForegroundColor White
Write-Host ""
