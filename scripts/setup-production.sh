#!/bin/bash

# SkillPort Community - Production Setup Script
# This script sets up the production environment with all necessary configurations

set -e

echo "🚀 Setting up SkillPort Community for Production..."

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and run this script again"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Create production environment file
setup_environment() {
    print_status "Setting up production environment..."
    
    if [ ! -f ".env.production" ]; then
        if [ -f "env.production.template" ]; then
            cp env.production.template .env.production
            print_success "Created .env.production from template"
            print_warning "Please edit .env.production with your actual values"
        else
            print_error "env.production.template not found"
            exit 1
        fi
    else
        print_warning ".env.production already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install workspace dependencies
    npm run install:all
    
    print_success "Dependencies installed"
}

# Build all packages
build_packages() {
    print_status "Building all packages..."
    
    # Build shared packages first
    npm run build:packages
    
    # Build applications
    npm run build:apps
    
    print_success "All packages built successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run all tests
    npm run test:all
    
    print_success "All tests passed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    cd apps/web
    npx prisma generate
    cd ../..
    
    print_success "Database setup complete"
}

# Create production Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Build all Docker images
    docker-compose -f docker-compose.prod.yml build
    
    print_success "Docker images built successfully"
}

# Validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_error ".env.production not found"
        exit 1
    fi
    
    # Check if required environment variables are set
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
        "AWS_REGION"
        "SENTRY_DSN"
        "RAZORPAY_KEY_ID"
        "RAZORPAY_KEY_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.production; then
            print_warning "Required environment variable ${var} not found in .env.production"
        fi
    done
    
    print_success "Configuration validation complete"
}

# Create production directories
create_directories() {
    print_status "Creating production directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    
    print_success "Production directories created"
}

# Set proper permissions
set_permissions() {
    print_status "Setting proper permissions..."
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    # Set proper permissions for uploads
    chmod 755 uploads
    
    print_success "Permissions set correctly"
}

# Main setup function
main() {
    print_status "Starting SkillPort Community production setup..."
    
    check_dependencies
    setup_environment
    install_dependencies
    build_packages
    run_tests
    setup_database
    build_docker_images
    validate_config
    create_directories
    set_permissions
    
    print_success "🎉 Production setup complete!"
    print_status "Next steps:"
    echo "1. Edit .env.production with your actual values"
    echo "2. Configure your AWS resources"
    echo "3. Deploy to production using: npm run deploy:prod"
    echo "4. Monitor your application using the provided monitoring tools"
}

# Run main function
main "$@"
