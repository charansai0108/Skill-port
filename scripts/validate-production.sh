#!/bin/bash

# SkillPort Community - Production Validation Script
# This script validates the production setup and configuration

set -e

echo "🔍 Validating SkillPort Community Production Setup..."

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

# Validation counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local is_warning="${3:-false}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$check_command" 2>/dev/null; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        print_success "✓ $check_name"
    else
        if [ "$is_warning" = "true" ]; then
            WARNINGS=$((WARNINGS + 1))
            print_warning "⚠ $check_name"
        else
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            print_error "✗ $check_name"
        fi
    fi
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    local required_files=(
        "package.json"
        "docker-compose.prod.yml"
        ".env.production"
        "apps/web/package.json"
        "backend/package.json"
        "apps/extension/package.json"
        "packages/ui/package.json"
        "packages/utils/package.json"
        "packages/types/package.json"
        "packages/hooks/package.json"
    )
    
    for file in "${required_files[@]}"; do
        run_check "File exists: $file" "[ -f '$file' ]"
    done
}

# Check if required directories exist
check_directories() {
    print_status "Checking required directories..."
    
    local required_dirs=(
        "apps"
        "packages"
        "backend"
        "scripts"
        "docs"
        "tests"
        "apps/web"
        "apps/extension"
        "packages/ui"
        "packages/utils"
        "packages/types"
        "packages/hooks"
    )
    
    for dir in "${required_dirs[@]}"; do
        run_check "Directory exists: $dir" "[ -d '$dir' ]"
    done
}

# Check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if node_modules exists in root
    run_check "Root node_modules exists" "[ -d 'node_modules' ]"
    
    # Check if workspace dependencies are installed
    run_check "Web app dependencies installed" "[ -d 'apps/web/node_modules' ]"
    run_check "Backend dependencies installed" "[ -d 'backend/node_modules' ]"
    run_check "Extension dependencies installed" "[ -d 'apps/extension/node_modules' ]"
    run_check "UI package dependencies installed" "[ -d 'packages/ui/node_modules' ]"
    run_check "Utils package dependencies installed" "[ -d 'packages/utils/node_modules' ]"
    run_check "Types package dependencies installed" "[ -d 'packages/types/node_modules' ]"
    run_check "Hooks package dependencies installed" "[ -d 'packages/hooks/node_modules' ]"
}

# Check if build artifacts exist
check_build_artifacts() {
    print_status "Checking build artifacts..."
    
    # Check if web app is built
    run_check "Web app build exists" "[ -d 'apps/web/.next' ]"
    
    # Check if backend is built
    run_check "Backend build exists" "[ -d 'backend/dist' ]"
    
    # Check if packages are built
    run_check "UI package build exists" "[ -d 'packages/ui/dist' ]"
    run_check "Utils package build exists" "[ -d 'packages/utils/dist' ]"
    run_check "Types package build exists" "[ -d 'packages/types/dist' ]"
    run_check "Hooks package build exists" "[ -d 'packages/hooks/dist' ]"
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -f ".env.production" ]; then
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
            run_check "Environment variable $var is set" "grep -q '^${var}=' .env.production"
        done
    else
        print_error ".env.production not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Check Docker configuration
check_docker() {
    print_status "Checking Docker configuration..."
    
    # Check if Docker is running
    run_check "Docker is running" "docker info > /dev/null 2>&1"
    
    # Check if Docker Compose is available
    run_check "Docker Compose is available" "docker-compose --version > /dev/null 2>&1"
    
    # Check if production Docker Compose file exists
    run_check "Production Docker Compose file exists" "[ -f 'docker-compose.prod.yml' ]"
    
    # Check if Dockerfiles exist
    run_check "Web app Dockerfile exists" "[ -f 'apps/web/Dockerfile' ]"
    run_check "Backend Dockerfile exists" "[ -f 'backend/Dockerfile' ]"
    run_check "Extension Dockerfile exists" "[ -f 'apps/extension/Dockerfile' ]"
}

# Check database configuration
check_database() {
    print_status "Checking database configuration..."
    
    # Check if Prisma schema exists
    run_check "Prisma schema exists" "[ -f 'apps/web/prisma/schema.prisma' ]"
    
    # Check if Prisma client is generated
    run_check "Prisma client is generated" "[ -d 'apps/web/node_modules/.prisma' ]"
}

# Check security configuration
check_security() {
    print_status "Checking security configuration..."
    
    # Check if .env.production has proper permissions
    run_check ".env.production has secure permissions" "[ \$(stat -c %a .env.production 2>/dev/null || stat -f %A .env.production 2>/dev/null) -le 600 ]"
    
    # Check if sensitive files are not committed
    run_check "No sensitive files in git" "! git ls-files | grep -E '\.(key|pem|p12|pfx)$'"
}

# Check monitoring configuration
check_monitoring() {
    print_status "Checking monitoring configuration..."
    
    # Check if Sentry configuration exists
    run_check "Sentry configuration exists" "[ -f 'apps/web/sentry.server.config.ts' ]"
    
    # Check if monitoring scripts exist
    run_check "Monitoring scripts exist" "[ -f 'scripts/monitor.sh' ]"
}

# Check CI/CD configuration
check_cicd() {
    print_status "Checking CI/CD configuration..."
    
    # Check if GitHub Actions workflow exists
    run_check "GitHub Actions workflow exists" "[ -f '.github/workflows/deploy.yml' ]"
    
    # Check if deployment scripts exist
    run_check "Deployment scripts exist" "[ -f 'scripts/deploy.sh' ]"
    run_check "Build scripts exist" "[ -f 'scripts/build.sh' ]"
}

# Check documentation
check_documentation() {
    print_status "Checking documentation..."
    
    local required_docs=(
        "README.md"
        "docs/PROJECT_STRUCTURE.md"
        "docs/MIGRATION_REQUIREMENTS.md"
        "docs/DEPLOYMENT_CHECKLIST.md"
        "docs/TESTING_GUIDE.md"
        "docs/API_DOCUMENTATION.md"
        "docs/ROLE_FLOWS.md"
    )
    
    for doc in "${required_docs[@]}"; do
        run_check "Documentation exists: $doc" "[ -f '$doc' ]"
    done
}

# Check tests
check_tests() {
    print_status "Checking tests..."
    
    # Check if test directories exist
    run_check "Test directory exists" "[ -d 'tests' ]"
    
    # Check if test configuration exists
    run_check "Jest configuration exists" "[ -f 'apps/web/jest.config.js' ]"
    
    # Check if test scripts exist
    run_check "Test scripts exist" "grep -q 'test' package.json"
}

# Check performance
check_performance() {
    print_status "Checking performance configuration..."
    
    # Check if Next.js config exists
    run_check "Next.js configuration exists" "[ -f 'apps/web/next.config.ts' ]"
    
    # Check if optimization is enabled
    run_check "Next.js optimization enabled" "grep -q 'output.*standalone' apps/web/next.config.ts"
}

# Check accessibility
check_accessibility() {
    print_status "Checking accessibility configuration..."
    
    # Check if accessibility tests exist
    run_check "Accessibility tests exist" "[ -f 'tests/accessibility.test.js' ]"
}

# Check internationalization
check_i18n() {
    print_status "Checking internationalization configuration..."
    
    # Check if i18n configuration exists
    run_check "i18n configuration exists" "[ -f 'apps/web/i18n.config.js' ]"
}

# Check PWA configuration
check_pwa() {
    print_status "Checking PWA configuration..."
    
    # Check if PWA manifest exists
    run_check "PWA manifest exists" "[ -f 'apps/web/public/manifest.json' ]"
    
    # Check if service worker exists
    run_check "Service worker exists" "[ -f 'apps/web/public/sw.js' ]"
}

# Check SEO configuration
check_seo() {
    print_status "Checking SEO configuration..."
    
    # Check if sitemap exists
    run_check "Sitemap exists" "[ -f 'apps/web/public/sitemap.xml' ]"
    
    # Check if robots.txt exists
    run_check "Robots.txt exists" "[ -f 'apps/web/public/robots.txt' ]"
}

# Check analytics
check_analytics() {
    print_status "Checking analytics configuration..."
    
    # Check if Google Analytics is configured
    run_check "Google Analytics configured" "grep -q 'GA_TRACKING_ID' .env.production"
}

# Check error handling
check_error_handling() {
    print_status "Checking error handling..."
    
    # Check if error pages exist
    run_check "Error pages exist" "[ -f 'apps/web/app/error.tsx' ]"
    run_check "Not found page exists" "[ -f 'apps/web/app/not-found.tsx' ]"
}

# Check caching
check_caching() {
    print_status "Checking caching configuration..."
    
    # Check if caching is configured
    run_check "Caching configured" "grep -q 'CACHE_TTL' .env.production"
}

# Check rate limiting
check_rate_limiting() {
    print_status "Checking rate limiting..."
    
    # Check if rate limiting is configured
    run_check "Rate limiting configured" "grep -q 'RATE_LIMIT' .env.production"
}

# Check CORS
check_cors() {
    print_status "Checking CORS configuration..."
    
    # Check if CORS is configured
    run_check "CORS configured" "grep -q 'CORS_ORIGIN' .env.production"
}

# Check file uploads
check_file_uploads() {
    print_status "Checking file upload configuration..."
    
    # Check if file upload limits are configured
    run_check "File upload limits configured" "grep -q 'MAX_FILE_SIZE' .env.production"
}

# Check session management
check_sessions() {
    print_status "Checking session management..."
    
    # Check if session configuration exists
    run_check "Session configuration exists" "grep -q 'SESSION_SECRET' .env.production"
}

# Check WebSocket configuration
check_websockets() {
    print_status "Checking WebSocket configuration..."
    
    # Check if WebSocket configuration exists
    run_check "WebSocket configuration exists" "grep -q 'WS_URL' .env.production"
}

# Check payment integration
check_payments() {
    print_status "Checking payment integration..."
    
    # Check if Razorpay configuration exists
    run_check "Razorpay configuration exists" "grep -q 'RAZORPAY_KEY_ID' .env.production"
}

# Check email configuration
check_email() {
    print_status "Checking email configuration..."
    
    # Check if email configuration exists
    run_check "Email configuration exists" "grep -q 'SMTP_HOST' .env.production"
}

# Check Redis configuration
check_redis() {
    print_status "Checking Redis configuration..."
    
    # Check if Redis configuration exists
    run_check "Redis configuration exists" "grep -q 'REDIS_URL' .env.production"
}

# Check AWS configuration
check_aws() {
    print_status "Checking AWS configuration..."
    
    # Check if AWS configuration exists
    run_check "AWS configuration exists" "grep -q 'AWS_REGION' .env.production"
}

# Check logging
check_logging() {
    print_status "Checking logging configuration..."
    
    # Check if logging is configured
    run_check "Logging configured" "grep -q 'CLOUDWATCH_LOG_GROUP' .env.production"
}

# Check feature flags
check_feature_flags() {
    print_status "Checking feature flags..."
    
    # Check if feature flags are configured
    run_check "Feature flags configured" "grep -q 'ENABLE_' .env.production"
}

# Check API configuration
check_api() {
    print_status "Checking API configuration..."
    
    # Check if API configuration exists
    run_check "API configuration exists" "grep -q 'API_BASE_URL' .env.production"
}

# Check frontend configuration
check_frontend() {
    print_status "Checking frontend configuration..."
    
    # Check if frontend configuration exists
    run_check "Frontend configuration exists" "grep -q 'FRONTEND_URL' .env.production"
}

# Check database pool configuration
check_db_pool() {
    print_status "Checking database pool configuration..."
    
    # Check if database pool is configured
    run_check "Database pool configured" "grep -q 'DB_POOL' .env.production"
}

# Check security headers
check_security_headers() {
    print_status "Checking security headers..."
    
    # Check if security headers are configured
    run_check "Security headers configured" "grep -q 'HELMET_CSP' .env.production"
}

# Check file types
check_file_types() {
    print_status "Checking file type configuration..."
    
    # Check if file types are configured
    run_check "File types configured" "grep -q 'ALLOWED_FILE_TYPES' .env.production"
}

# Check session max age
check_session_max_age() {
    print_status "Checking session max age..."
    
    # Check if session max age is configured
    run_check "Session max age configured" "grep -q 'SESSION_MAX_AGE' .env.production"
}

# Check cache max size
check_cache_max_size() {
    print_status "Checking cache max size..."
    
    # Check if cache max size is configured
    run_check "Cache max size configured" "grep -q 'CACHE_MAX_SIZE' .env.production"
}

# Check cache TTL
check_cache_ttl() {
    print_status "Checking cache TTL..."
    
    # Check if cache TTL is configured
    run_check "Cache TTL configured" "grep -q 'CACHE_TTL' .env.production"
}

# Check rate limit window
check_rate_limit_window() {
    print_status "Checking rate limit window..."
    
    # Check if rate limit window is configured
    run_check "Rate limit window configured" "grep -q 'RATE_LIMIT_WINDOW_MS' .env.production"
}

# Check rate limit max requests
check_rate_limit_max_requests() {
    print_status "Checking rate limit max requests..."
    
    # Check if rate limit max requests is configured
    run_check "Rate limit max requests configured" "grep -q 'RATE_LIMIT_MAX_REQUESTS' .env.production"
}

# Check CloudWatch log group
check_cloudwatch_log_group() {
    print_status "Checking CloudWatch log group..."
    
    # Check if CloudWatch log group is configured
    run_check "CloudWatch log group configured" "grep -q 'CLOUDWATCH_LOG_GROUP' .env.production"
}

# Check CloudWatch region
check_cloudwatch_region() {
    print_status "Checking CloudWatch region..."
    
    # Check if CloudWatch region is configured
    run_check "CloudWatch region configured" "grep -q 'CLOUDWATCH_REGION' .env.production"
}

# Check S3 bucket
check_s3_bucket() {
    print_status "Checking S3 bucket..."
    
    # Check if S3 bucket is configured
    run_check "S3 bucket configured" "grep -q 'AWS_S3_BUCKET' .env.production"
}

# Check S3 region
check_s3_region() {
    print_status "Checking S3 region..."
    
    # Check if S3 region is configured
    run_check "S3 region configured" "grep -q 'AWS_S3_REGION' .env.production"
}

# Check S3 endpoint
check_s3_endpoint() {
    print_status "Checking S3 endpoint..."
    
    # Check if S3 endpoint is configured
    run_check "S3 endpoint configured" "grep -q 'AWS_S3_ENDPOINT' .env.production"
}

# Check CloudFront distribution
check_cloudfront_distribution() {
    print_status "Checking CloudFront distribution..."
    
    # Check if CloudFront distribution is configured
    run_check "CloudFront distribution configured" "grep -q 'CLOUDFRONT_DISTRIBUTION_ID' .env.production"
}

# Check CloudFront domain
check_cloudfront_domain() {
    print_status "Checking CloudFront domain..."
    
    # Check if CloudFront domain is configured
    run_check "CloudFront domain configured" "grep -q 'CLOUDFRONT_DOMAIN' .env.production"
}

# Check Redis password
check_redis_password() {
    print_status "Checking Redis password..."
    
    # Check if Redis password is configured
    run_check "Redis password configured" "grep -q 'REDIS_PASSWORD' .env.production"
}

# Check SMTP host
check_smtp_host() {
    print_status "Checking SMTP host..."
    
    # Check if SMTP host is configured
    run_check "SMTP host configured" "grep -q 'SMTP_HOST' .env.production"
}

# Check SMTP port
check_smtp_port() {
    print_status "Checking SMTP port..."
    
    # Check if SMTP port is configured
    run_check "SMTP port configured" "grep -q 'SMTP_PORT' .env.production"
}

# Check SMTP user
check_smtp_user() {
    print_status "Checking SMTP user..."
    
    # Check if SMTP user is configured
    run_check "SMTP user configured" "grep -q 'SMTP_USER' .env.production"
}

# Check SMTP pass
check_smtp_pass() {
    print_status "Checking SMTP pass..."
    
    # Check if SMTP pass is configured
    run_check "SMTP pass configured" "grep -q 'SMTP_PASS' .env.production"
}

# Check email from
check_email_from() {
    print_status "Checking email from..."
    
    # Check if email from is configured
    run_check "Email from configured" "grep -q 'EMAIL_FROM' .env.production"
}

# Check WebSocket URL
check_ws_url() {
    print_status "Checking WebSocket URL..."
    
    # Check if WebSocket URL is configured
    run_check "WebSocket URL configured" "grep -q 'WS_URL' .env.production"
}

# Check WebSocket port
check_ws_port() {
    print_status "Checking WebSocket port..."
    
    # Check if WebSocket port is configured
    run_check "WebSocket port configured" "grep -q 'WS_PORT' .env.production"
}

# Check Google Analytics tracking ID
check_ga_tracking_id() {
    print_status "Checking Google Analytics tracking ID..."
    
    # Check if Google Analytics tracking ID is configured
    run_check "Google Analytics tracking ID configured" "grep -q 'GA_TRACKING_ID' .env.production"
}

# Check Sentry organization
check_sentry_org() {
    print_status "Checking Sentry organization..."
    
    # Check if Sentry organization is configured
    run_check "Sentry organization configured" "grep -q 'SENTRY_ORG' .env.production"
}

# Check Sentry project
check_sentry_project() {
    print_status "Checking Sentry project..."
    
    # Check if Sentry project is configured
    run_check "Sentry project configured" "grep -q 'SENTRY_PROJECT' .env.production"
}

# Check Sentry auth token
check_sentry_auth_token() {
    print_status "Checking Sentry auth token..."
    
    # Check if Sentry auth token is configured
    run_check "Sentry auth token configured" "grep -q 'SENTRY_AUTH_TOKEN' .env.production"
}

# Check AWS access key ID
check_aws_access_key_id() {
    print_status "Checking AWS access key ID..."
    
    # Check if AWS access key ID is configured
    run_check "AWS access key ID configured" "grep -q 'AWS_ACCESS_KEY_ID' .env.production"
}

# Check AWS secret access key
check_aws_secret_access_key() {
    print_status "Checking AWS secret access key..."
    
    # Check if AWS secret access key is configured
    run_check "AWS secret access key configured" "grep -q 'AWS_SECRET_ACCESS_KEY' .env.production"
}

# Check NextAuth URL
check_nextauth_url() {
    print_status "Checking NextAuth URL..."
    
    # Check if NextAuth URL is configured
    run_check "NextAuth URL configured" "grep -q 'NEXTAUTH_URL' .env.production"
}

# Check NextAuth URL internal
check_nextauth_url_internal() {
    print_status "Checking NextAuth URL internal..."
    
    # Check if NextAuth URL internal is configured
    run_check "NextAuth URL internal configured" "grep -q 'NEXTAUTH_URL_INTERNAL' .env.production"
}

# Check database URL direct
check_database_url_direct() {
    print_status "Checking database URL direct..."
    
    # Check if database URL direct is configured
    run_check "Database URL direct configured" "grep -q 'DATABASE_URL_DIRECT' .env.production"
}

# Check application configuration
check_app_config() {
    print_status "Checking application configuration..."
    
    # Check if application configuration exists
    run_check "Application configuration exists" "grep -q 'NODE_ENV' .env.production"
    run_check "Port configuration exists" "grep -q 'PORT' .env.production"
    run_check "Backend port configuration exists" "grep -q 'BACKEND_PORT' .env.production"
    run_check "Extension port configuration exists" "grep -q 'EXTENSION_PORT' .env.production"
}

# Check all validations
run_all_validations() {
    print_status "Running all validations..."
    
    check_files
    check_directories
    check_dependencies
    check_build_artifacts
    check_environment
    check_docker
    check_database
    check_security
    check_monitoring
    check_cicd
    check_documentation
    check_tests
    check_performance
    check_accessibility
    check_i18n
    check_pwa
    check_seo
    check_analytics
    check_error_handling
    check_caching
    check_rate_limiting
    check_cors
    check_file_uploads
    check_sessions
    check_websockets
    check_payments
    check_email
    check_redis
    check_aws
    check_logging
    check_feature_flags
    check_api
    check_frontend
    check_db_pool
    check_security_headers
    check_file_types
    check_session_max_age
    check_cache_max_size
    check_cache_ttl
    check_rate_limit_window
    check_rate_limit_max_requests
    check_cloudwatch_log_group
    check_cloudwatch_region
    check_s3_bucket
    check_s3_region
    check_s3_endpoint
    check_cloudfront_distribution
    check_cloudfront_domain
    check_redis_password
    check_smtp_host
    check_smtp_port
    check_smtp_user
    check_smtp_pass
    check_email_from
    check_ws_url
    check_ws_port
    check_ga_tracking_id
    check_sentry_org
    check_sentry_project
    check_sentry_auth_token
    check_aws_access_key_id
    check_aws_secret_access_key
    check_nextauth_url
    check_nextauth_url_internal
    check_database_url_direct
    check_app_config
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================="
    echo "           VALIDATION SUMMARY"
    echo "=========================================="
    echo "Total checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNINGS"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        print_success "🎉 All critical checks passed!"
        if [ $WARNINGS -gt 0 ]; then
            print_warning "⚠️  $WARNINGS warnings found. Please review them."
        fi
        exit 0
    else
        print_error "❌ $FAILED_CHECKS critical checks failed!"
        print_error "Please fix the failed checks before proceeding to production."
        exit 1
    fi
}

# Main function
main() {
    run_all_validations
    print_summary
}

# Run main function
main "$@"
