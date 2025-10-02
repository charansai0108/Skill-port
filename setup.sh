#!/bin/bash

# SkillPort Community - Quick Setup Script
# This script will help you set up the project quickly

echo "🚀 SkillPort Community - Quick Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18.17.0 or higher from: https://nodejs.org/"
    echo ""
    echo "After installing Node.js, run this script again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old!"
    echo "Please install Node.js 18.17.0 or higher from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ npm is available"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install root dependencies"
    exit 1
fi

echo "✅ Root dependencies installed"
echo ""

# Navigate to web app directory
cd apps/web

# Install web app dependencies
echo "📦 Installing web app dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install web app dependencies"
    exit 1
fi

echo "✅ Web app dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created (.env)"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file with your configuration:"
    echo "   - Database URL"
    echo "   - JWT Secret"
    echo "   - Email configuration (optional for development)"
    echo ""
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Run database migrations
echo "🗄️  Setting up database..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Failed to run database migrations"
    exit 1
fi

echo "✅ Database migrations completed"
echo ""

# Seed the database
echo "🌱 Seeding database with sample data..."
npx prisma db seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded with sample data"
echo ""

echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Edit the .env file if needed"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Demo credentials:"
echo "   Admin: admin@skillport.com / admin123"
echo "   Mentor: mentor@skillport.com / password123"
echo "   Student: student@skillport.com / password123"
echo "   Personal: personal@skillport.com / password123"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          # Start development server"
echo "   npx prisma studio    # Open database GUI"
echo "   npm run build        # Build for production"
echo ""
echo "📖 For more information, check the README.md file"
echo ""
echo "Happy coding! 🎯"
