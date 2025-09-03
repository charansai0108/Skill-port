#!/bin/bash

# SkillPort Community Platform - Production Deployment Script
# This script prepares and deploys the application to production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[Deploy]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Deploy]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Deploy]${NC} $1"
}

print_error() {
    echo -e "${RED}[Deploy]${NC} $1"
}

# Configuration
PROJECT_NAME="skillport-community"
BACKUP_DIR="backups"
BUILD_DIR="dist"
NODE_ENV="production"

# Check if running as production deployment
check_production_ready() {
    print_status "Checking production readiness..."
    
    # Check if .env file exists with production values
    if [ ! -f "backend/config/config.env" ]; then
        print_error "Production config file not found: backend/config/config.env"
        print_status "Please create production configuration file with:"
        print_status "  - Production MongoDB URI"
        print_status "  - Production JWT secrets"
        print_status "  - Email service credentials"
        print_status "  - Production domain settings"
        exit 1
    fi
    
    # Check for production MongoDB URI
    if grep -q "localhost:27017" backend/config/config.env; then
        print_warning "Using localhost MongoDB - ensure this is intended for production"
    fi
    
    # Check for default secrets
    if grep -q "your-super-secret-jwt-key-change-in-production" backend/config/config.env; then
        print_error "Default JWT secret detected. Please change JWT_SECRET in config.env"
        exit 1
    fi
    
    print_success "Production configuration validated"
}

# Create backup
create_backup() {
    print_status "Creating backup..."
    
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$BACKUP_DIR"
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment if exists
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$BACKUP_DIR/previous-build-$(date +%Y%m%d-%H%M%S)"
        print_success "Previous build backed up"
    fi
    
    # Backup database (if MongoDB dump is available)
    if command -v mongodump &> /dev/null; then
        print_status "Creating database backup..."
        mongodump --db skillport_community --out "$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S)"
        print_success "Database backup created"
    else
        print_warning "mongodump not available - skipping database backup"
    fi
}

# Install production dependencies
install_dependencies() {
    print_status "Installing production dependencies..."
    
    cd backend
    
    # Clean install with production dependencies only
    rm -rf node_modules package-lock.json
    npm ci --production
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
    print_success "Production dependencies installed"
}

# Build frontend assets
build_frontend() {
    print_status "Building frontend assets..."
    
    # Create build directory
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    mkdir -p "$BUILD_DIR"
    
    # Copy frontend files
    cp -r community-ui "$BUILD_DIR/"
    cp -r skillport-personal "$BUILD_DIR/"
    
    # Copy API service for frontend
    cp backend/utils/apiService.js "$BUILD_DIR/community-ui/js/"
    cp backend/utils/apiService.js "$BUILD_DIR/skillport-personal/js/"
    
    # Update API base URL for production
    if [ ! -z "$PRODUCTION_API_URL" ]; then
        print_status "Updating API URLs for production..."
        sed -i.bak "s|http://localhost:5001/api/v1|$PRODUCTION_API_URL/api/v1|g" "$BUILD_DIR/community-ui/js/apiService.js"
        sed -i.bak "s|http://localhost:5001/api/v1|$PRODUCTION_API_URL/api/v1|g" "$BUILD_DIR/skillport-personal/js/apiService.js"
        rm "$BUILD_DIR/community-ui/js/apiService.js.bak" "$BUILD_DIR/skillport-personal/js/apiService.js.bak"
        print_success "API URLs updated for production"
    fi
    
    # Minify CSS and JS files (if tools available)
    if command -v terser &> /dev/null; then
        print_status "Minifying JavaScript files..."
        find "$BUILD_DIR" -name "*.js" -not -path "*/node_modules/*" -exec terser {} --compress --mangle -o {} \;
    fi
    
    if command -v cleancss &> /dev/null; then
        print_status "Minifying CSS files..."
        find "$BUILD_DIR" -name "*.css" -not -path "*/node_modules/*" -exec cleancss -o {} {} \;
    fi
    
    print_success "Frontend build completed"
}

# Setup backend for production
setup_backend() {
    print_status "Setting up backend for production..."
    
    cd backend
    
    # Set production environment
    export NODE_ENV=production
    
    # Create production start script
    cat > start-production.js << 'EOF'
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    console.log(`Starting ${numCPUs} worker processes...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    // Workers can share any TCP port
    require('./server.js');
    console.log(`Worker ${process.pid} started`);
}
EOF
    
    # Update package.json for production
    npm pkg set scripts.start="node start-production.js"
    npm pkg set scripts.prod="NODE_ENV=production node start-production.js"
    
    cd ..
    print_success "Backend configured for production"
}

# Create systemd service (Linux only)
create_systemd_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Creating systemd service..."
        
        cat > skillport.service << EOF
[Unit]
Description=SkillPort Community Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/node start-production.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        print_success "Systemd service file created: skillport.service"
        print_status "To install: sudo cp skillport.service /etc/systemd/system/"
        print_status "To start: sudo systemctl start skillport"
        print_status "To enable: sudo systemctl enable skillport"
    fi
}

# Create nginx configuration
create_nginx_config() {
    print_status "Creating nginx configuration..."
    
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (update paths)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Serve static files
    location / {
        root /path/to/skillport-community/dist;
        try_files $uri $uri/ /community-ui/index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Uploads
    location /uploads/ {
        root /path/to/skillport-community/backend;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}
EOF
    
    print_success "Nginx configuration created: nginx.conf"
    print_status "Update the following in nginx.conf:"
    print_status "  - server_name (your domain)"
    print_status "  - SSL certificate paths"
    print_status "  - root directory path"
}

# Create Docker configuration
create_docker_config() {
    print_status "Creating Docker configuration..."
    
    # Dockerfile
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy application files
COPY backend/ ./backend/
COPY dist/ ./dist/

# Create uploads directory
RUN mkdir -p backend/uploads/{avatars,projects,certificates,branding}

# Expose port
EXPOSE 5001

# Start application
WORKDIR /app/backend
CMD ["node", "start-production.js"]
EOF
    
    # Docker Compose
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  skillport-app:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/uploads:/app/backend/uploads
      - ./backend/config:/app/backend/config
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
      - MONGO_INITDB_DATABASE=skillport_community
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - skillport-app
    restart: unless-stopped

volumes:
  mongodb_data:
EOF
    
    # .dockerignore
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.coverage.*
backups/
*.log
EOF
    
    print_success "Docker configuration created"
    print_status "To deploy with Docker: docker-compose up -d"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    cd backend
    
    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        npm test
        if [ $? -ne 0 ]; then
            print_error "Tests failed. Deployment aborted."
            exit 1
        fi
        print_success "All tests passed"
    else
        print_warning "No tests configured"
    fi
    
    cd ..
}

# Create deployment summary
create_deployment_summary() {
    print_status "Creating deployment summary..."
    
    cat > deployment-summary.md << EOF
# SkillPort Community Platform - Deployment Summary

**Deployment Date:** $(date)
**Environment:** Production
**Version:** $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

## Files Created

- \`dist/\` - Production frontend build
- \`backend/start-production.js\` - Production server with clustering
- \`nginx.conf\` - Nginx reverse proxy configuration
- \`skillport.service\` - Systemd service file (Linux)
- \`Dockerfile\` - Docker container configuration
- \`docker-compose.yml\` - Docker Compose orchestration
- \`deployment-summary.md\` - This summary

## Deployment Options

### Option 1: Traditional Server
1. Copy files to production server
2. Install systemd service: \`sudo cp skillport.service /etc/systemd/system/\`
3. Configure nginx: Copy \`nginx.conf\` to nginx sites
4. Start services: \`sudo systemctl start skillport\`

### Option 2: Docker Deployment
1. Build and run: \`docker-compose up -d\`
2. Monitor: \`docker-compose logs -f\`

## Configuration Required

- [ ] Update \`backend/config/config.env\` with production values
- [ ] Update \`nginx.conf\` with your domain and SSL certificates
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Configure firewall rules (ports 80, 443, 5001)
- [ ] Set up database backups
- [ ] Configure monitoring and logging

## Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify file uploads work
- [ ] Check email notifications
- [ ] Test API endpoints
- [ ] Verify SSL certificate
- [ ] Set up monitoring alerts
- [ ] Configure log rotation
- [ ] Test backup/restore procedures

## Environment Variables

Ensure these are set in production:
- \`NODE_ENV=production\`
- \`MONGODB_URI\` (production database)
- \`JWT_SECRET\` (secure random string)
- \`EMAIL_USER\` and \`EMAIL_PASS\`
- \`FRONTEND_URL\` (your domain)

## Support

For issues, check:
- Application logs: \`journalctl -u skillport -f\`
- Nginx logs: \`/var/log/nginx/error.log\`
- Database status: \`systemctl status mongod\`
EOF
    
    print_success "Deployment summary created: deployment-summary.md"
}

# Main deployment function
deploy() {
    clear
    echo "=================================================="
    echo "  SkillPort Community Platform - Production Deploy"
    echo "=================================================="
    echo ""
    
    # Pre-deployment checks
    check_production_ready
    run_tests
    
    # Create backup
    create_backup
    
    # Install dependencies and build
    install_dependencies
    build_frontend
    setup_backend
    
    # Create deployment configurations
    create_systemd_service
    create_nginx_config
    create_docker_config
    create_deployment_summary
    
    echo ""
    print_success "🚀 Deployment preparation completed!"
    echo ""
    print_status "Next steps:"
    print_status "1. Review deployment-summary.md"
    print_status "2. Update configuration files with your production settings"
    print_status "3. Choose deployment method (traditional server or Docker)"
    print_status "4. Deploy to your production environment"
    echo ""
    print_warning "⚠️  Don't forget to:"
    print_warning "   - Set up SSL certificates"
    print_warning "   - Configure production database"
    print_warning "   - Update domain names in configs"
    print_warning "   - Set secure JWT secrets"
    echo ""
}

# Show help
show_help() {
    echo "SkillPort Production Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PRODUCTION_API_URL    Production API URL (e.g., https://api.yoursite.com)"
    echo ""
    echo "Examples:"
    echo "  $0                                    Deploy with default settings"
    echo "  PRODUCTION_API_URL=https://api.yoursite.com $0    Deploy with custom API URL"
}

# Parse command line arguments
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    "")
        deploy
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
