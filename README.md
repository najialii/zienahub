# BloomCart E-Commerce Platform

An elegant e-commerce platform for gifts and flowers, built with Laravel (backend) and Next.js (frontend).

## 🌍 Multi-Language Support

BloomCart supports **Arabic (العربية)** and **English** throughout the platform:
- ✅ Bilingual product catalog
- ✅ RTL support for Arabic
- ✅ Localized UI and content
- ✅ User language preferences

See [MULTILINGUAL-SETUP.md](MULTILINGUAL-SETUP.md) for details.

## Project Structure

```
bloomcart/
├── backend/          # Laravel API
├── frontend/         # Next.js application
└── README.md         # This file
```

## Prerequisites

### Backend Requirements
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher

### Frontend Requirements
- Node.js 18.x or higher (✓ Installed: v24.11.1)
- npm or yarn

## Quick Start

### 🚀 Automated Installation (Recommended)

Run the installation wizard:

```powershell
.\install.ps1
```

This will guide you through three installation options:
1. **Laravel Herd** - Easiest, all-in-one (Recommended)
2. **Chocolatey** - Automated package manager
3. **Manual** - Download and install each component

**OR** see [QUICK-INSTALL.md](QUICK-INSTALL.md) for detailed step-by-step instructions.

### ✅ Prerequisites Check

After installation, verify everything is installed:

```powershell
php --version      # Should show PHP 8.1+
composer --version # Should show Composer 2.x
mysql --version    # Should show MySQL 8.0+
```

### Backend Setup

```bash
cd backend

# Install dependencies (after PHP and Composer are installed)
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Create MySQL database named 'bloomcart'
# Update .env with your database credentials

# Run migrations
php artisan migrate

# Install Laravel Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Start development server
php artisan serve
```

Backend will run at: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.local.example .env.local

# Start development server
npm run dev
```

Frontend will run at: http://localhost:3000

## Development Workflow

1. Start the backend API server (Laravel)
2. Start the frontend development server (Next.js)
3. Access the application at http://localhost:3000

## Technology Stack

### Backend
- Laravel 10.x
- Laravel Sanctum (Authentication)
- MySQL 8.0+
- PHP 8.1+

### Frontend
- Next.js 14.x (App Router)
- React 18.x
- TypeScript
- Tailwind CSS
- Axios (HTTP client)

## Design System

The platform features an elegant monochromatic design:
- Primary: Black (#000000)
- Secondary: Gray shades (#6b7280, #9ca3af, #4b5563)
- Accent: White (#ffffff, #f3f4f6)

## Next Steps

After completing the setup:

1. Review the requirements document: `.kiro/specs/bloomcart-ecommerce/requirements.md`
2. Review the design document: `.kiro/specs/bloomcart-ecommerce/design.md`
3. Follow the implementation tasks: `.kiro/specs/bloomcart-ecommerce/tasks.md`

## Current Status

✓ Frontend project initialized with Next.js 14, TypeScript, and Tailwind CSS
✓ Monochromatic color scheme configured
✓ Environment variables configured
⚠ Backend requires PHP and Composer installation
⚠ Database migrations pending
⚠ Laravel Sanctum installation pending

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs/10.x
- Next.js Documentation: https://nextjs.org/docs
- Project specifications in `.kiro/specs/bloomcart-ecommerce/`
# zienahub
# zienahub
