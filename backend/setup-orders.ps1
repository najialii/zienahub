Write-Host "Setting up order system..." -ForegroundColor Green
Write-Host ""

Write-Host "Running migrations..." -ForegroundColor Yellow
php artisan migrate

Write-Host ""
Write-Host "Order system setup complete!" -ForegroundColor Green
Write-Host "You can now place orders through the checkout page." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
