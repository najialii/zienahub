@echo off
echo Setting up order system...
echo.

echo Running migrations...
php artisan migrate --force

echo.
echo Order system setup complete!
echo You can now place orders through the checkout page.
echo.
echo Note: Guest checkout is now enabled (user_id is nullable)
echo.
pause
