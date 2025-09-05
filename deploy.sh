#!/bin/bash

# SkillPort Community Platform Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting SkillPort Community Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --production
else
    print_warning "node_modules already exists, skipping installation"
fi

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    print_warning "MongoDB is not running on localhost:27017"
    print_warning "Please start MongoDB before deploying"
fi

# Create production environment file if it doesn't exist
if [ ! -f "config.env.production" ]; then
    print_warning "Production environment file not found. Creating from template..."
    cp config.env config.env.production
    print_warning "Please update config.env.production with your production values"
fi

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

# Set proper permissions
chmod 755 uploads
chmod 644 config.env.production

print_status "Backend setup complete!"

# Go back to root directory
cd ..

# Create production build directory
print_status "Creating production build..."
mkdir -p dist

# Copy client files to dist
print_status "Copying client files..."
cp -r client dist/

# Copy backend files to dist
print_status "Copying backend files..."
cp -r backend dist/
cp package.json dist/
cp README.md dist/

# Create production package.json
print_status "Creating production package.json..."
cat > dist/package.json << EOF
{
  "name": "skillport-community-platform",
  "version": "1.0.0",
  "description": "SkillPort Community Platform - Production Build",
  "main": "backend/server.js",
  "scripts": {
    "start": "cd backend && NODE_ENV=production node server.js",
    "dev": "cd backend && npm run dev",
    "build": "echo 'Build complete'",
    "test": "cd backend && npm test"
  },
  "keywords": ["skillport", "community", "learning", "platform"],
  "author": "SkillPort Team",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Create Dockerfile for containerized deployment
print_status "Creating Dockerfile..."
cat > dist/Dockerfile << EOF
# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p backend/logs backend/uploads

# Set proper permissions
RUN chmod 755 backend/uploads

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:5001/health || exit 1

# Start the application
CMD ["npm", "start"]
EOF

# Create docker-compose.yml for easy deployment
print_status "Creating docker-compose.yml..."
cat > dist/docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    env_file:
      - backend/config.env.production
    volumes:
      - ./backend/uploads:/app/backend/uploads
      - ./backend/logs:/app/backend/logs
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    restart: unless-stopped

volumes:
  mongodb_data:
EOF

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > dist/DEPLOYMENT.md << EOF
# SkillPort Community Platform - Deployment Guide

## Quick Start

### Option 1: Direct Deployment
1. Update \`backend/config.env.production\` with your production values
2. Start MongoDB: \`mongod\`
3. Start the application: \`npm start\`
4. Access at: \`http://localhost:5001\`

### Option 2: Docker Deployment
1. Update \`backend/config.env.production\` with your production values
2. Run: \`docker-compose up -d\`
3. Access at: \`http://localhost:5001\`

## Production Checklist

- [ ] Update JWT_SECRET in config.env.production
- [ ] Update database connection string
- [ ] Configure email service (Gmail SMTP)
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all user flows
- [ ] Set up CI/CD pipeline

## Environment Variables

Required production environment variables:
- NODE_ENV=production
- MONGODB_URI=mongodb://your-mongodb-connection
- JWT_SECRET=your-strong-jwt-secret
- EMAIL_USER=your-email@gmail.com
- EMAIL_PASS=your-app-password
- CORS_ORIGIN=https://yourdomain.com

## Security Notes

- Never commit production environment files
- Use strong, unique secrets
- Enable HTTPS in production
- Set up proper firewall rules
- Regular security updates
- Monitor for suspicious activity

## Support

For deployment issues, check:
1. MongoDB connection
2. Environment variables
3. Port availability
4. File permissions
5. Log files in backend/logs/
EOF

print_status "Deployment preparation complete!"
print_status "Production build created in: dist/"
print_status "Next steps:"
print_status "1. Update dist/backend/config.env.production with your production values"
print_status "2. Deploy the dist/ folder to your production server"
print_status "3. Follow the instructions in dist/DEPLOYMENT.md"

echo ""
print_status "🎉 SkillPort Community Platform is ready for deployment!"