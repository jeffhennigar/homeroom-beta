# Deploy Script for HomeRoom Pro

$sourceDir = "C:\Users\jeff_\Downloads\HomeROom ANtigravity\HomeRoom-Pro"
$deployDir = "$sourceDir\deploy"

Write-Host "Starting Deployment..." -ForegroundColor Cyan

# 1. Copy index.html
Write-Host "Copying index.html..."
Copy-Item "$sourceDir\index.html" -Destination "$deployDir\index.html" -Force

# 2. Copy Public Assets (Audio, Images, etc.)
# The app references "sounds/..." so we need "deploy/sounds/..."
# We will copy everything from public/ to deploy/ to be safe.
Write-Host "Syncing public assets..."
Copy-Item "$sourceDir\public\*" -Destination "$deployDir" -Recurse -Force

# 3. Git Commit
Write-Host "Committing changes..."
Set-Location $deployDir
git add .
git commit -m "Deploy: Sync from source"

# 4. Push to Remote
Write-Host "Pushing to GitHub..."
git push

Write-Host "Deployment and Push Complete!" -ForegroundColor Green
