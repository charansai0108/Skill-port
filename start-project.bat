@echo off
echo 🚀 Starting SkillPort Community Platform...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Create .env file in backend if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating .env file in backend...
    copy "backend\config.env" "backend\.env" >nul
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

echo.
echo 🔧 Starting Backend Server...
echo =============================
echo 1. Open a NEW Command Prompt window
echo 2. Navigate to the backend folder:
echo    cd backend
echo 3. Start the backend server:
echo    node server.js
echo.
echo 🌐 Starting Frontend Server...
echo ==============================
echo 4. Open ANOTHER NEW Command Prompt window
echo 5. Navigate to the community-ui folder:
echo    cd community-ui
echo 6. Start the frontend server:
echo    npx http-server -p 8000 --cors
echo.
echo 🎯 Test URLs:
echo =============
echo Backend: http://localhost:5001/health
echo Frontend: http://localhost:8000/pages/auth/register.html
echo.
echo 📱 Registration Flow:
echo ====================
echo 1. Click 'Start Learning Journey' → Personal form appears
echo 2. Click 'Build Community' → Community form appears
echo 3. Fill forms and submit → OTP sent via Gmail
echo 4. Verify OTP → User redirected based on role
echo.
echo 🎉 Your SkillPort Community Platform is ready!
echo ==============================================
pause

