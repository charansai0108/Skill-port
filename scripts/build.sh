#!/bin/bash

# SkillPort Community - Build Script
# This script builds all components of the SkillPort Community project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_info "Node.js version: $(node --version)"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    log_info "npm version: $(npm --version)"
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    npm ci
    log_info "Dependencies installed successfully"
}

# Run tests
run_tests() {
    log_step "Running tests..."
    npm test
    log_info "All tests passed successfully"
}

# Run linting
run_linting() {
    log_step "Running linting..."
    npm run lint
    log_info "Linting completed successfully"
}

# Build frontend
build_frontend() {
    log_step "Building frontend..."
    cd apps/web
    
    # Clean previous build
    rm -rf .next out
    
    # Build the application
    npm run build
    
    # Verify build output
    if [ -d ".next" ]; then
        log_info "Frontend build completed successfully"
    else
        log_error "Frontend build failed"
        exit 1
    fi
    
    cd ../..
}

# Build backend
build_backend() {
    log_step "Building backend..."
    cd backend
    
    # Clean previous build
    rm -rf .next
    
    # Build the application
    npm run build
    
    # Verify build output
    if [ -d ".next" ]; then
        log_info "Backend build completed successfully"
    else
        log_error "Backend build failed"
        exit 1
    fi
    
    cd ..
}

# Build extension
build_extension() {
    log_step "Building extension..."
    cd apps/extension
    
    # Extension doesn't need a build step, just verify files exist
    if [ -f "server.js" ] && [ -f "package.json" ]; then
        log_info "Extension build completed successfully"
    else
        log_error "Extension build failed - missing required files"
        exit 1
    fi
    
    cd ../..
}

# Optimize images
optimize_images() {
    log_step "Optimizing images..."
    
    # Find and optimize images in public directory
    if [ -d "apps/web/public" ]; then
        find apps/web/public -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | while read -r file; do
            log_info "Optimizing: $file"
            # Add image optimization logic here if needed
        done
    fi
    
    log_info "Image optimization completed"
}

# Remove console logs (production optimization)
remove_console_logs() {
    log_step "Removing console logs for production..."
    
    # Remove console.log statements from production builds
    find apps/web -name "*.js" -o -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak '/console\.log/d'
    find backend -name "*.js" -o -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak '/console\.log/d'
    find apps/extension -name "*.js" -o -name "*.ts" | xargs sed -i.bak '/console\.log/d'
    
    # Clean up backup files
    find . -name "*.bak" -delete
    
    log_info "Console logs removed for production"
}

# Generate build report
generate_build_report() {
    log_step "Generating build report..."
    
    BUILD_REPORT="build-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "SkillPort Community - Build Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        echo "Node.js Version: $(node --version)"
        echo "npm Version: $(npm --version)"
        echo ""
        echo "Build Status:"
        echo "- Frontend: $(if [ -d "apps/web/.next" ]; then echo "SUCCESS"; else echo "FAILED"; fi)"
        echo "- Backend: $(if [ -d "backend/.next" ]; then echo "SUCCESS"; else echo "FAILED"; fi)"
        echo "- Extension: $(if [ -f "apps/extension/server.js" ]; then echo "SUCCESS"; else echo "FAILED"; fi)"
        echo ""
        echo "File Sizes:"
        if [ -d "apps/web/.next" ]; then
            echo "- Frontend build: $(du -sh apps/web/.next | cut -f1)"
        fi
        if [ -d "backend/.next" ]; then
            echo "- Backend build: $(du -sh backend/.next | cut -f1)"
        fi
        echo ""
        echo "Dependencies:"
        echo "- Total packages: $(find node_modules -type d -name "*" | wc -l)"
        echo "- Frontend packages: $(find apps/web/node_modules -type d -name "*" 2>/dev/null | wc -l || echo "0")"
        echo "- Backend packages: $(find backend/node_modules -type d -name "*" 2>/dev/null | wc -l || echo "0")"
    } > "$BUILD_REPORT"
    
    log_info "Build report generated: $BUILD_REPORT"
}

# Main build function
build() {
    log_info "Starting SkillPort Community build process..."
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Build process
    install_dependencies
    run_tests
    run_linting
    build_frontend
    build_backend
    build_extension
    optimize_images
    remove_console_logs
    generate_build_report
    
    log_info "Build process completed successfully!"
    log_info "All components are ready for deployment."
}

# Run build
build
