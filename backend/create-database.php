<?php
// Create BloomCart database

try {
    // Connect to MySQL without selecting a database
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306',
        'root',
        '', // Empty password - update if you set a password
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Create database if it doesn't exist
    $pdo->exec('CREATE DATABASE IF NOT EXISTS bloomcart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    echo "✓ Database 'bloomcart' created successfully!\n";
    echo "\nNext steps:\n";
    echo "1. Run: php artisan migrate\n";
    echo "2. Run: php artisan serve\n";
    
} catch (PDOException $e) {
    echo "✗ Error creating database: " . $e->getMessage() . "\n\n";
    
    if (str_contains($e->getMessage(), 'Access denied')) {
        echo "MySQL connection failed. Please check:\n";
        echo "1. Is MySQL running? (Herd should start it automatically)\n";
        echo "2. Is the password correct in backend/.env?\n";
        echo "3. Try setting DB_PASSWORD in .env if you have a MySQL password\n";
    } else if (str_contains($e->getMessage(), 'Connection refused')) {
        echo "MySQL is not running. Please:\n";
        echo "1. Open Herd from the Start menu\n";
        echo "2. Herd will start MySQL automatically\n";
        echo "3. Try running this script again\n";
    }
    
    exit(1);
}
