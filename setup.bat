@echo off
REM SkillPort Community - Quick Setup Script for Windows
REM This script will help you set up the project quickly

echo 🚀 SkillPort Community - Quick Setup
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 18.17.0 or higher from: https://nodejs.org/
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

echo ✅ npm is available
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo ✅ Root dependencies installed
echo.

REM Navigate to web app directory
cd apps\web

REM Install web app dependencies
echo 📦 Installing web app dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install web app dependencies
    pause
    exit /b 1
)

echo ✅ Web app dependencies installed
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ✅ Environment file created (.env)
    echo.
    echo ⚠️  IMPORTANT: Please edit the .env file with your configuration:
    echo    - Database URL
    echo    - JWT Secret
    echo    - Email configuration (optional for development)
    echo.
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo ✅ Prisma client generated
echo.

REM Run database migrations
echo 🗄️  Setting up database...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Failed to run database migrations
    pause
    exit /b 1
)

echo ✅ Database migrations completed
echo.

REM Seed the database
echo 🌱 Seeding database with sample data...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database seeded with sample data
echo.

echo 🎉 Setup completed successfully!
echo.
echo 🚀 Next steps:
echo 1. Edit the .env file if needed
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo 📚 Demo credentials:
echo    Admin: admin@skillport.com / admin123
echo    Mentor: mentor@skillport.com / password123
echo    Student: student@skillport.com / password123
echo    Personal: personal@skillport.com / password123
echo.
echo 🔧 Useful commands:
echo    npm run dev          # Start development server
echo    npx prisma studio    # Open database GUI
echo    npm run build        # Build for production
echo.
echo 📖 For more information, check the README.md file
echo.
echo Happy coding! 🎯
pause
