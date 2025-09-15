# Audit Dashboard - Git Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Audit Dashboard - Git Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Initialize Git repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files
Write-Host "Adding all files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Audit Dashboard with brand management and backlog features"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Git Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a repository on GitHub/GitLab/Bitbucket" -ForegroundColor White
Write-Host "2. Add remote origin: git remote add origin YOUR_REPO_URL" -ForegroundColor White
Write-Host "3. Push to repository: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "  git remote add origin https://github.com/username/audit-dashboard.git" -ForegroundColor Gray
Write-Host "  git push -u origin main" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue"
