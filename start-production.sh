#!/bin/bash

# SkillPort Production Start Script
echo "🚀 Starting SkillPort Production Server..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Start local development server
echo "🌐 Starting local development server..."
cd client
python3 -m http.server 3000 &
SERVER_PID=$!

echo "✅ SkillPort is running at: http://localhost:3000"
echo "📱 Firebase-powered application ready!"
echo ""
echo "🔥 Features available:"
echo "  - User Registration & Login"
echo "  - Community Management"
echo "  - Contest Creation & Participation"
echo "  - Real-time Data Sync"
echo "  - Mobile-responsive Design"
echo ""
echo "📊 Test the complete system:"
echo "  - Main App: http://localhost:3000"
echo "  - Complete Test: http://localhost:3000/test-complete-firebase.html"
echo "  - Simple Auth Test: http://localhost:3000/test-auth-simple.html"
echo ""
echo "🛑 To stop the server, press Ctrl+C"

# Wait for user to stop the server
wait $SERVER_PID
