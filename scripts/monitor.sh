#!/bin/bash

# SkillPort Community - Production Monitoring Script
# This script monitors the production environment and provides health checks

set -e

echo "📊 Monitoring SkillPort Community Production Environment..."

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

# Configuration
MONITORING_INTERVAL=30
LOG_FILE="logs/monitoring.log"
ALERT_EMAIL="admin@skillport.com"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
BACKEND_HEALTH_URL="http://localhost:3001/api/health"
EXTENSION_HEALTH_URL="http://localhost:3002/api/health"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$LOG_FILE"
}

# Function to check service health
check_service_health() {
    local service_name="$1"
    local health_url="$2"
    
    if curl -s -f "$health_url" > /dev/null 2>&1; then
        print_success "$service_name is healthy"
        log_message "$service_name: HEALTHY"
        return 0
    else
        print_error "$service_name is unhealthy"
        log_message "$service_name: UNHEALTHY"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    print_status "Checking database connectivity..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        
        if [ -n "$DATABASE_URL" ]; then
            # Try to connect to database
            if npx prisma db pull --schema=apps/web/prisma/schema.prisma > /dev/null 2>&1; then
                print_success "Database connection successful"
                log_message "Database: HEALTHY"
                return 0
            else
                print_error "Database connection failed"
                log_message "Database: UNHEALTHY"
                return 1
            fi
        else
            print_warning "DATABASE_URL not configured"
            log_message "Database: NOT_CONFIGURED"
            return 1
        fi
    else
        print_error ".env.production not found"
        log_message "Database: CONFIG_NOT_FOUND"
        return 1
    fi
}

# Function to check Redis connectivity
check_redis() {
    print_status "Checking Redis connectivity..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        
        if [ -n "$REDIS_URL" ]; then
            # Try to connect to Redis
            if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
                print_success "Redis connection successful"
                log_message "Redis: HEALTHY"
                return 0
            else
                print_error "Redis connection failed"
                log_message "Redis: UNHEALTHY"
                return 1
            fi
        else
            print_warning "REDIS_URL not configured"
            log_message "Redis: NOT_CONFIGURED"
            return 1
        fi
    else
        print_error ".env.production not found"
        log_message "Redis: CONFIG_NOT_FOUND"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        print_success "Disk space is sufficient ($disk_usage% used)"
        log_message "Disk space: HEALTHY ($disk_usage% used)"
        return 0
    elif [ "$disk_usage" -lt 90 ]; then
        print_warning "Disk space is getting low ($disk_usage% used)"
        log_message "Disk space: WARNING ($disk_usage% used)"
        return 1
    else
        print_error "Disk space is critically low ($disk_usage% used)"
        log_message "Disk space: CRITICAL ($disk_usage% used)"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$memory_usage" -lt 80 ]; then
        print_success "Memory usage is normal ($memory_usage% used)"
        log_message "Memory: HEALTHY ($memory_usage% used)"
        return 0
    elif [ "$memory_usage" -lt 90 ]; then
        print_warning "Memory usage is high ($memory_usage% used)"
        log_message "Memory: WARNING ($memory_usage% used)"
        return 1
    else
        print_error "Memory usage is critically high ($memory_usage% used)"
        log_message "Memory: CRITICAL ($memory_usage% used)"
        return 1
    fi
}

# Function to check CPU usage
check_cpu() {
    print_status "Checking CPU usage..."
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    if [ "$cpu_usage" -lt 80 ]; then
        print_success "CPU usage is normal ($cpu_usage% used)"
        log_message "CPU: HEALTHY ($cpu_usage% used)"
        return 0
    elif [ "$cpu_usage" -lt 90 ]; then
        print_warning "CPU usage is high ($cpu_usage% used)"
        log_message "CPU: WARNING ($cpu_usage% used)"
        return 1
    else
        print_error "CPU usage is critically high ($cpu_usage% used)"
        log_message "CPU: CRITICAL ($cpu_usage% used)"
        return 1
    fi
}

# Function to check network connectivity
check_network() {
    print_status "Checking network connectivity..."
    
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        print_success "Network connectivity is working"
        log_message "Network: HEALTHY"
        return 0
    else
        print_error "Network connectivity is down"
        log_message "Network: UNHEALTHY"
        return 1
    fi
}

# Function to check Docker containers
check_docker_containers() {
    print_status "Checking Docker containers..."
    
    local containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(skillport|web|backend|extension)")
    
    if [ -n "$containers" ]; then
        print_success "Docker containers are running"
        log_message "Docker: HEALTHY"
        echo "$containers"
        return 0
    else
        print_error "No Docker containers found"
        log_message "Docker: UNHEALTHY"
        return 1
    fi
}

# Function to check application logs
check_application_logs() {
    print_status "Checking application logs..."
    
    local log_files=(
        "logs/monitoring.log"
        "logs/application.log"
        "logs/error.log"
        "logs/access.log"
    )
    
    local error_count=0
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            local errors=$(grep -i "error\|exception\|fatal" "$log_file" | wc -l)
            error_count=$((error_count + errors))
        fi
    done
    
    if [ $error_count -eq 0 ]; then
        print_success "No errors found in application logs"
        log_message "Application logs: HEALTHY"
        return 0
    else
        print_warning "Found $error_count errors in application logs"
        log_message "Application logs: WARNING ($error_count errors)"
        return 1
    fi
}

# Function to check SSL certificates
check_ssl_certificates() {
    print_status "Checking SSL certificates..."
    
    local domains=(
        "skillport.com"
        "api.skillport.com"
        "cdn.skillport.com"
    )
    
    local expired_certs=0
    
    for domain in "${domains[@]}"; do
        if openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
            local expiry_date=$(openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
            local expiry_timestamp=$(date -d "$expiry_date" +%s)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_until_expiry -lt 30 ]; then
                print_warning "SSL certificate for $domain expires in $days_until_expiry days"
                log_message "SSL: WARNING ($domain expires in $days_until_expiry days)"
                expired_certs=$((expired_certs + 1))
            else
                print_success "SSL certificate for $domain is valid ($days_until_expiry days remaining)"
                log_message "SSL: HEALTHY ($domain - $days_until_expiry days remaining)"
            fi
        else
            print_error "Could not check SSL certificate for $domain"
            log_message "SSL: ERROR ($domain - could not check)"
            expired_certs=$((expired_certs + 1))
        fi
    done
    
    if [ $expired_certs -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Function to check backup status
check_backup_status() {
    print_status "Checking backup status..."
    
    local backup_dir="backups"
    local latest_backup=$(find "$backup_dir" -name "*.sql" -type f -exec ls -t {} + | head -n1 2>/dev/null)
    
    if [ -n "$latest_backup" ]; then
        local backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup" 2>/dev/null || stat -f %m "$latest_backup" 2>/dev/null)))
        local backup_age_hours=$((backup_age / 3600))
        
        if [ $backup_age_hours -lt 24 ]; then
            print_success "Backup is recent ($backup_age_hours hours old)"
            log_message "Backup: HEALTHY ($backup_age_hours hours old)"
            return 0
        else
            print_warning "Backup is old ($backup_age_hours hours old)"
            log_message "Backup: WARNING ($backup_age_hours hours old)"
            return 1
        fi
    else
        print_error "No backups found"
        log_message "Backup: ERROR (no backups found)"
        return 1
    fi
}

# Function to send alert
send_alert() {
    local alert_type="$1"
    local message="$2"
    
    if command -v mail > /dev/null 2>&1; then
        echo "$message" | mail -s "SkillPort Alert: $alert_type" "$ALERT_EMAIL"
        log_message "Alert sent: $alert_type"
    else
        print_warning "Mail command not available, cannot send alert"
        log_message "Alert: FAILED (mail command not available)"
    fi
}

# Function to run comprehensive health check
run_health_check() {
    print_status "Running comprehensive health check..."
    
    local health_score=0
    local total_checks=0
    
    # Check services
    total_checks=$((total_checks + 1))
    if check_service_health "Web App" "$HEALTH_CHECK_URL"; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_service_health "Backend API" "$BACKEND_HEALTH_URL"; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_service_health "Extension Server" "$EXTENSION_HEALTH_URL"; then
        health_score=$((health_score + 1))
    fi
    
    # Check infrastructure
    total_checks=$((total_checks + 1))
    if check_database; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_redis; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_disk_space; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_memory; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_cpu; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_network; then
        health_score=$((health_score + 1))
    fi
    
    total_checks=$((total_checks + 1))
    if check_docker_containers; then
        health_score=$((health_score + 1))
    fi
    
    # Check logs
    total_checks=$((total_checks + 1))
    if check_application_logs; then
        health_score=$((health_score + 1))
    fi
    
    # Check SSL
    total_checks=$((total_checks + 1))
    if check_ssl_certificates; then
        health_score=$((health_score + 1))
    fi
    
    # Check backups
    total_checks=$((total_checks + 1))
    if check_backup_status; then
        health_score=$((health_score + 1))
    fi
    
    # Calculate health percentage
    local health_percentage=$((health_score * 100 / total_checks))
    
    echo ""
    echo "=========================================="
    echo "           HEALTH CHECK SUMMARY"
    echo "=========================================="
    echo "Health Score: $health_score/$total_checks ($health_percentage%)"
    echo ""
    
    if [ $health_percentage -ge 90 ]; then
        print_success "🎉 System is healthy!"
        log_message "Health check: HEALTHY ($health_percentage%)"
    elif [ $health_percentage -ge 70 ]; then
        print_warning "⚠️  System has some issues but is operational"
        log_message "Health check: WARNING ($health_percentage%)"
    else
        print_error "❌ System is unhealthy and requires immediate attention"
        log_message "Health check: CRITICAL ($health_percentage%)"
        send_alert "CRITICAL" "System health is at $health_percentage%. Immediate attention required."
    fi
}

# Function to run continuous monitoring
run_continuous_monitoring() {
    print_status "Starting continuous monitoring (interval: ${MONITORING_INTERVAL}s)..."
    print_status "Press Ctrl+C to stop monitoring"
    
    while true; do
        echo ""
        echo "=========================================="
        echo "        MONITORING CYCLE - $(date)"
        echo "=========================================="
        
        run_health_check
        
        echo ""
        print_status "Waiting ${MONITORING_INTERVAL} seconds for next check..."
        sleep $MONITORING_INTERVAL
    done
}

# Function to show monitoring dashboard
show_dashboard() {
    print_status "Showing monitoring dashboard..."
    
    echo ""
    echo "=========================================="
    echo "        SKILLPORT MONITORING DASHBOARD"
    echo "=========================================="
    echo ""
    
    # System information
    echo "System Information:"
    echo "  Hostname: $(hostname)"
    echo "  Uptime: $(uptime -p)"
    echo "  Load Average: $(uptime | awk -F'load average:' '{print $2}')"
    echo ""
    
    # Memory usage
    echo "Memory Usage:"
    free -h
    echo ""
    
    # Disk usage
    echo "Disk Usage:"
    df -h
    echo ""
    
    # Docker containers
    echo "Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Recent logs
    echo "Recent Logs (last 10 lines):"
    if [ -f "$LOG_FILE" ]; then
        tail -n 10 "$LOG_FILE"
    else
        echo "No logs found"
    fi
    echo ""
}

# Function to show help
show_help() {
    echo "SkillPort Community Monitoring Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  health       Run a single health check"
    echo "  monitor      Run continuous monitoring"
    echo "  dashboard    Show monitoring dashboard"
    echo "  logs         Show recent logs"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 health     # Run single health check"
    echo "  $0 monitor    # Start continuous monitoring"
    echo "  $0 dashboard  # Show dashboard"
    echo "  $0 logs       # Show recent logs"
}

# Main function
main() {
    case "${1:-health}" in
        "health")
            run_health_check
            ;;
        "monitor")
            run_continuous_monitoring
            ;;
        "dashboard")
            show_dashboard
            ;;
        "logs")
            if [ -f "$LOG_FILE" ]; then
                tail -n 50 "$LOG_FILE"
            else
                echo "No logs found"
            fi
            ;;
        "help")
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
