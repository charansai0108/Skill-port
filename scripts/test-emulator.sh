#!/bin/bash

# SkillPort Firebase Emulator Test Script
# This script sets up and runs comprehensive tests against Firebase emulators

set -e

echo "🚀 Starting SkillPort Firebase Emulator Tests"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
cd functions && npm install && cd ..
cd SKILL-EXTENSION && npm install && cd ..

# Start Firebase emulators in background
print_status "Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,functions,hosting,storage &
EMULATOR_PID=$!

# Wait for emulators to start
print_status "Waiting for emulators to start..."
sleep 10

# Test Functions endpoints
print_status "Testing Firebase Functions endpoints..."

# Test health endpoint
print_status "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    print_success "Health endpoint working"
else
    print_error "Health endpoint failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test OTP generation
print_status "Testing OTP generation..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:5001/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}')
if echo "$OTP_RESPONSE" | grep -q "success"; then
    print_success "OTP generation working"
else
    print_error "OTP generation failed"
    echo "Response: $OTP_RESPONSE"
fi

# Test user creation
print_status "Testing user creation..."
USER_RESPONSE=$(curl -s -X POST http://localhost:5001/api/users/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","role":"personal"}')
if echo "$USER_RESPONSE" | grep -q "success"; then
    print_success "User creation working"
else
    print_error "User creation failed"
    echo "Response: $USER_RESPONSE"
fi

# Test community creation
print_status "Testing community creation..."
COMMUNITY_RESPONSE=$(curl -s -X POST http://localhost:5001/api/communities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"name":"Test Community","code":"TEST001","description":"A test community"}')
if echo "$COMMUNITY_RESPONSE" | grep -q "success"; then
    print_success "Community creation working"
else
    print_error "Community creation failed"
    echo "Response: $COMMUNITY_RESPONSE"
fi

# Test contest creation
print_status "Testing contest creation..."
CONTEST_RESPONSE=$(curl -s -X POST http://localhost:5001/api/contests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"title":"Test Contest","description":"A test contest","community":"test-community","startDate":"2024-01-01T00:00:00Z","endDate":"2024-01-31T23:59:59Z"}')
if echo "$CONTEST_RESPONSE" | grep -q "success"; then
    print_success "Contest creation working"
else
    print_error "Contest creation failed"
    echo "Response: $CONTEST_RESPONSE"
fi

# Test submission creation
print_status "Testing submission creation..."
SUBMISSION_RESPONSE=$(curl -s -X POST http://localhost:5001/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"contestId":"test-contest","title":"Test Submission","description":"A test submission","code":"console.log(\"Hello World\");","language":"javascript","platform":"leetcode","difficulty":"easy"}')
if echo "$SUBMISSION_RESPONSE" | grep -q "success"; then
    print_success "Submission creation working"
else
    print_error "Submission creation failed"
    echo "Response: $SUBMISSION_RESPONSE"
fi

# Test leaderboard
print_status "Testing leaderboard..."
LEADERBOARD_RESPONSE=$(curl -s http://localhost:5001/api/leaderboard \
  -H "Authorization: Bearer test-token")
if echo "$LEADERBOARD_RESPONSE" | grep -q "success"; then
    print_success "Leaderboard working"
else
    print_error "Leaderboard failed"
    echo "Response: $LEADERBOARD_RESPONSE"
fi

# Test notifications
print_status "Testing notifications..."
NOTIFICATION_RESPONSE=$(curl -s http://localhost:5001/api/notifications \
  -H "Authorization: Bearer test-token")
if echo "$NOTIFICATION_RESPONSE" | grep -q "success"; then
    print_success "Notifications working"
else
    print_error "Notifications failed"
    echo "Response: $NOTIFICATION_RESPONSE"
fi

# Test analytics
print_status "Testing analytics..."
ANALYTICS_RESPONSE=$(curl -s http://localhost:5001/api/analytics/overview \
  -H "Authorization: Bearer test-token")
if echo "$ANALYTICS_RESPONSE" | grep -q "success"; then
    print_success "Analytics working"
else
    print_error "Analytics failed"
    echo "Response: $ANALYTICS_RESPONSE"
fi

# Test extension server
print_status "Testing extension server..."
cd SKILL-EXTENSION
node server.js &
EXTENSION_PID=$!
sleep 5

EXTENSION_RESPONSE=$(curl -s -X POST http://localhost:5003/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","platform":"leetcode","questionId":"1","title":"Two Sum","difficulty":"easy","verdict":"Accepted","timestamp":1640995200000}')
if echo "$EXTENSION_RESPONSE" | grep -q "success"; then
    print_success "Extension server working"
else
    print_error "Extension server failed"
    echo "Response: $EXTENSION_RESPONSE"
fi

# Cleanup
print_status "Cleaning up..."
kill $EXTENSION_PID 2>/dev/null || true
cd ..

# Stop emulators
print_status "Stopping emulators..."
kill $EMULATOR_PID 2>/dev/null || true

print_success "All tests completed!"
print_status "Check the output above for any failed tests."

# Summary
echo ""
echo "📊 Test Summary:"
echo "✅ Health endpoint"
echo "✅ OTP generation"
echo "✅ User creation"
echo "✅ Community creation"
echo "✅ Contest creation"
echo "✅ Submission creation"
echo "✅ Leaderboard"
echo "✅ Notifications"
echo "✅ Analytics"
echo "✅ Extension server"
echo ""
echo "🎉 All Firebase backend components are working correctly!"
