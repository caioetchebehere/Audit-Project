@echo off
echo ========================================
echo    Audit Dashboard - Git Setup
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo Git is installed!
echo.

echo Initializing Git repository...
git init

echo Adding all files to Git...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Audit Dashboard with brand management and backlog features"

echo.
echo ========================================
echo    Git Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub/GitLab/Bitbucket
echo 2. Add remote origin: git remote add origin YOUR_REPO_URL
echo 3. Push to repository: git push -u origin main
echo.
echo Example:
echo   git remote add origin https://github.com/username/audit-dashboard.git
echo   git push -u origin main
echo.
pause
