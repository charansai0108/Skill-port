#!/bin/bash

# SkillPort Community - Server Startup Script
# This script starts both backend and frontend servers properly

echo "🚀 Starting SkillPort Community Servers..."

# Function to kill existing processes
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "node server.js" 2>/dev/null
    pkill -f "python3 -m http.server" 2>/dev/null
    pkill -f "npx serve" 2>/dev/null
    lsof -ti:5001,8000 | xargs kill -9 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Stopping existing processes..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Check and clean ports
check_port 5001
check_port 8000

# Start backend server
echo "🔧 Starting backend server on port 5001..."
cd backend
if [ ! -f "config.env" ]; then
    echo "⚠️  config.env not found in backend root, copying from config/..."
    cp config/config.env . 2>/dev/null || echo "❌ config.env not found in config/ either"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
node server.js &
BACKEND_PID=$!
echo "✅ Backend server started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 8000..."
cd ../client

# Start frontend in background
python3 -m http.server 8000 &
FRONTEND_PID=$!
echo "✅ Frontend server started (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 2

echo ""
echo "🎉 SkillPort Community is now running!"
echo "📍 Backend API: http://localhost:5001"
echo "📍 Frontend: http://localhost:8000"
echo "📍 Health Check: http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
