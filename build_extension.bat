@echo off
echo ==========================================
echo      SWADES AI ASSIGNMENT BUILDER
echo ==========================================

echo [1/3] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed!
    echo.
    echo Please download and install the "LTS" version from:
    echo https://nodejs.org/
    echo.
    echo After installing, RESTART VS Code and run this script again.
    pause
    exit /b
)

echo ✅ Node.js is installed.

echo [2/3] Installing Dependencies (this might take a minute)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed. Check your internet connection.
    pause
    exit /b
)

echo [3/3] Building Extension...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed.
    pause
    exit /b
)

echo.
echo ==========================================
echo ✅ BUILD SUCCESSFUL!
echo ==========================================
echo.
echo The extension is ready in the 'dist' folder.
echo You can now load it in Chrome.
echo.
pause
