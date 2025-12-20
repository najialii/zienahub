# BloomCart Installation Menu
# Choose your preferred installation method

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BloomCart Installation Wizard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This wizard will help you install PHP, Composer, and MySQL" -ForegroundColor White
Write-Host ""
Write-Host "Choose your installation method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Laravel Herd (RECOMMENDED - Easiest)" -ForegroundColor Green
Write-Host "   - All-in-one installer" -ForegroundColor Gray
Write-Host "   - Includes PHP, Composer, MySQL, Nginx" -ForegroundColor Gray
Write-Host "   - Automatic configuration" -ForegroundColor Gray
Write-Host "   - Best for beginners" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Chocolatey (Automated)" -ForegroundColor Green
Write-Host "   - Uses Windows package manager" -ForegroundColor Gray
Write-Host "   - Automated installation" -ForegroundColor Gray
Write-Host "   - Requires Administrator" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Manual Installation" -ForegroundColor Green
Write-Host "   - Download and install each component" -ForegroundColor Gray
Write-Host "   - More control over versions" -ForegroundColor Gray
Write-Host "   - Requires Administrator" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Exit (I'll install manually)" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Opening Laravel Herd website..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor Yellow
        Write-Host "1. Download Laravel Herd from the website" -ForegroundColor White
        Write-Host "2. Run the installer" -ForegroundColor White
        Write-Host "3. After installation, close and reopen PowerShell" -ForegroundColor White
        Write-Host "4. Run: cd backend" -ForegroundColor White
        Write-Host "5. Run: .\setup.ps1" -ForegroundColor White
        Write-Host ""
        Start-Process "https://herd.laravel.com/"
    }
    "2" {
        Write-Host ""
        Write-Host "Starting Chocolatey installation..." -ForegroundColor Green
        Write-Host ""
        
        # Check if running as admin
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if (-not $isAdmin) {
            Write-Host "ERROR: This method requires Administrator privileges" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please:" -ForegroundColor Yellow
            Write-Host "1. Close this window" -ForegroundColor White
            Write-Host "2. Right-click PowerShell" -ForegroundColor White
            Write-Host "3. Select 'Run as Administrator'" -ForegroundColor White
            Write-Host "4. Run this script again" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit
        }
        
        Write-Host "Running Chocolatey installation script..." -ForegroundColor Yellow
        & .\install-with-chocolatey.ps1
    }
    "3" {
        Write-Host ""
        Write-Host "Starting manual installation..." -ForegroundColor Green
        Write-Host ""
        
        # Check if running as admin
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if (-not $isAdmin) {
            Write-Host "ERROR: This method requires Administrator privileges" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please:" -ForegroundColor Yellow
            Write-Host "1. Close this window" -ForegroundColor White
            Write-Host "2. Right-click PowerShell" -ForegroundColor White
            Write-Host "3. Select 'Run as Administrator'" -ForegroundColor White
            Write-Host "4. Run this script again" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit
        }
        
        Write-Host "Running manual installation script..." -ForegroundColor Yellow
        & .\install-requirements.ps1
    }
    "4" {
        Write-Host ""
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Manual installation resources:" -ForegroundColor White
        Write-Host "- PHP: https://windows.php.net/download/" -ForegroundColor Gray
        Write-Host "- Composer: https://getcomposer.org/download/" -ForegroundColor Gray
        Write-Host "- MySQL: https://dev.mysql.com/downloads/installer/" -ForegroundColor Gray
        Write-Host ""
        Write-Host "See QUICK-INSTALL.md for detailed instructions" -ForegroundColor White
        Write-Host ""
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Read-Host "Press Enter to exit"
