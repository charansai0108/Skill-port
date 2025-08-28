#!/bin/bash

echo "🚀 Starting SkillPort Community Platform..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create .env file in backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file in backend..."
    cp backend/config.env backend/.env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Starting Backend Server..."
echo "============================="
echo "1. Open a NEW terminal window/tab"
echo "2. Navigate to the backend folder:"
echo "   cd backend"
echo "3. Start the backend server:"
echo "   node server.js"
echo ""
echo "🌐 Starting Frontend Server..."
echo "=============================="
echo "4. Open ANOTHER NEW terminal window/tab"
echo "5. Navigate to the community-ui folder:"
echo "   cd community-ui"
echo "6. Start the frontend server:"
echo "   npx http-server -p 8000 --cors"
echo ""
echo "🎯 Test URLs:"
echo "============="
echo "Backend: http://localhost:5001/health"
echo "Frontend: http://localhost:8000/pages/auth/register.html"
echo ""
echo "📱 Registration Flow:"
echo "===================="
echo "1. Click 'Start Learning Journey' → Personal form appears"
echo "2. Click 'Build Community' → Community form appears"
echo "3. Fill forms and submit → OTP sent via Gmail"
echo "4. Verify OTP → User redirected based on role"
echo ""
echo "🎉 Your SkillPort Community Platform is ready!"
echo "=============================================="

