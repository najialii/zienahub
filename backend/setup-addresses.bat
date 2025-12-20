@echo off
echo Setting up addresses table...
echo.

cd /d "%~dp0"

echo Running migration...
php artisan migrate --path=database/migrations/2024_01_04_000001_create_addresses_table.php

echo.
echo Addresses table setup complete!
echo.
pause
