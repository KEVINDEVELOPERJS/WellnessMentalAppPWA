@echo off
REM Setup script for Capacitor iOS project (Windows)

echo 🚀 Setting up Wellness Mental PWA for iOS...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Initialize Capacitor
echo ⚡ Initializing Capacitor...
call npx cap init "Wellness Mental" "com.wellnessmental.app" --web-dir=www

REM Add iOS platform
echo 📱 Adding iOS platform...
call npx cap add ios

REM Sync Capacitor
echo 🔄 Syncing Capacitor...
call npx cap sync ios

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Open iOS project: npx cap open ios
echo 2. Build in Xcode (requires Mac)
echo 3. Run on simulator or device
echo.
echo For development, run: npm start
pause
