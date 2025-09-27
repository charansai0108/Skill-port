#!/bin/bash

# SkillPort Community - Backup Script
# This script creates backups of the database, files, and configuration

set -e

echo "💾 Creating SkillPort Community Backup..."

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
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="skillport_backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        
        if [ -n "$DATABASE_URL" ]; then
            # Extract database connection details
            local db_host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
            local db_port=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
            local db_name=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
            local db_user=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            local db_password=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            
            # Create database backup
            local db_backup_file="$BACKUP_PATH/database.sql"
            mkdir -p "$BACKUP_PATH"
            
            if command -v pg_dump > /dev/null 2>&1; then
                PGPASSWORD="$db_password" pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" > "$db_backup_file"
                print_success "Database backup created: $db_backup_file"
            else
                print_error "pg_dump not found. Please install PostgreSQL client tools."
                return 1
            fi
        else
            print_error "DATABASE_URL not configured"
            return 1
        fi
    else
        print_error ".env.production not found"
        return 1
    fi
}

# Function to backup application files
backup_application_files() {
    print_status "Backing up application files..."
    
    local app_backup_dir="$BACKUP_PATH/application"
    mkdir -p "$app_backup_dir"
    
    # Backup source code
    if [ -d "apps" ]; then
        cp -r apps "$app_backup_dir/"
        print_success "Source code backed up"
    fi
    
    # Backup packages
    if [ -d "packages" ]; then
        cp -r packages "$app_backup_dir/"
        print_success "Packages backed up"
    fi
    
    # Backup backend
    if [ -d "backend" ]; then
        cp -r backend "$app_backup_dir/"
        print_success "Backend backed up"
    fi
    
    # Backup configuration files
    local config_files=(
        "package.json"
        "docker-compose.prod.yml"
        ".env.production"
        "next.config.ts"
        "prisma/schema.prisma"
    )
    
    for config_file in "${config_files[@]}"; do
        if [ -f "$config_file" ]; then
            cp "$config_file" "$app_backup_dir/"
            print_success "Configuration file backed up: $config_file"
        fi
    done
    
    # Backup scripts
    if [ -d "scripts" ]; then
        cp -r scripts "$app_backup_dir/"
        print_success "Scripts backed up"
    fi
    
    # Backup documentation
    if [ -d "docs" ]; then
        cp -r docs "$app_backup_dir/"
        print_success "Documentation backed up"
    fi
}

# Function to backup uploaded files
backup_uploaded_files() {
    print_status "Backing up uploaded files..."
    
    local uploads_backup_dir="$BACKUP_PATH/uploads"
    mkdir -p "$uploads_backup_dir"
    
    # Backup user uploads
    if [ -d "uploads" ]; then
        cp -r uploads/* "$uploads_backup_dir/" 2>/dev/null || true
        print_success "User uploads backed up"
    fi
    
    # Backup static assets
    if [ -d "apps/web/public" ]; then
        cp -r apps/web/public "$uploads_backup_dir/"
        print_success "Static assets backed up"
    fi
}

# Function to backup logs
backup_logs() {
    print_status "Backing up logs..."
    
    local logs_backup_dir="$BACKUP_PATH/logs"
    mkdir -p "$logs_backup_dir"
    
    # Backup application logs
    if [ -d "logs" ]; then
        cp -r logs/* "$logs_backup_dir/" 2>/dev/null || true
        print_success "Application logs backed up"
    fi
    
    # Backup system logs (if accessible)
    if [ -d "/var/log" ]; then
        cp -r /var/log/* "$logs_backup_dir/" 2>/dev/null || true
        print_success "System logs backed up"
    fi
}

# Function to backup environment configuration
backup_environment() {
    print_status "Backing up environment configuration..."
    
    local env_backup_file="$BACKUP_PATH/environment.txt"
    
    # Create environment summary
    {
        echo "=== SkillPort Community Environment Backup ==="
        echo "Timestamp: $(date)"
        echo "Hostname: $(hostname)"
        echo "User: $(whoami)"
        echo "Working Directory: $(pwd)"
        echo ""
        echo "=== System Information ==="
        uname -a
        echo ""
        echo "=== Disk Usage ==="
        df -h
        echo ""
        echo "=== Memory Usage ==="
        free -h
        echo ""
        echo "=== Docker Containers ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "=== Environment Variables ==="
        if [ -f ".env.production" ]; then
            # Mask sensitive information
            sed 's/\(PASSWORD\|SECRET\|KEY\)=.*/\1=***MASKED***/' .env.production
        fi
    } > "$env_backup_file"
    
    print_success "Environment configuration backed up"
}

# Function to create backup archive
create_backup_archive() {
    print_status "Creating backup archive..."
    
    local archive_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    if tar -czf "$archive_file" -C "$BACKUP_DIR" "$BACKUP_NAME"; then
        print_success "Backup archive created: $archive_file"
        
        # Get archive size
        local archive_size=$(du -h "$archive_file" | cut -f1)
        print_status "Archive size: $archive_size"
        
        # Remove temporary directory
        rm -rf "$BACKUP_PATH"
        print_success "Temporary files cleaned up"
        
        return 0
    else
        print_error "Failed to create backup archive"
        return 1
    fi
}

# Function to upload backup to S3
upload_to_s3() {
    print_status "Uploading backup to S3..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        
        if [ -n "$AWS_S3_BUCKET" ] && [ -n "$AWS_REGION" ]; then
            local archive_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
            local s3_key="backups/${BACKUP_NAME}.tar.gz"
            
            if command -v aws > /dev/null 2>&1; then
                if aws s3 cp "$archive_file" "s3://$AWS_S3_BUCKET/$s3_key"; then
                    print_success "Backup uploaded to S3: s3://$AWS_S3_BUCKET/$s3_key"
                else
                    print_error "Failed to upload backup to S3"
                    return 1
                fi
            else
                print_error "AWS CLI not found. Please install AWS CLI."
                return 1
            fi
        else
            print_warning "S3 configuration not found. Skipping S3 upload."
        fi
    else
        print_warning ".env.production not found. Skipping S3 upload."
    fi
}

# Function to clean up old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            rm "$file"
            deleted_count=$((deleted_count + 1))
            print_status "Deleted old backup: $(basename "$file")"
        fi
    done < <(find "$BACKUP_DIR" -name "skillport_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    if [ $deleted_count -gt 0 ]; then
        print_success "Cleaned up $deleted_count old backup files"
    else
        print_status "No old backup files to clean up"
    fi
}

# Function to verify backup integrity
verify_backup() {
    print_status "Verifying backup integrity..."
    
    local archive_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    if [ -f "$archive_file" ]; then
        # Test archive integrity
        if tar -tzf "$archive_file" > /dev/null 2>&1; then
            print_success "Backup archive is valid"
            
            # Show archive contents
            print_status "Backup contents:"
            tar -tzf "$archive_file" | head -20
            if [ $(tar -tzf "$archive_file" | wc -l) -gt 20 ]; then
                echo "... and $(($(tar -tzf "$archive_file" | wc -l) - 20)) more files"
            fi
            
            return 0
        else
            print_error "Backup archive is corrupted"
            return 1
        fi
    else
        print_error "Backup archive not found"
        return 1
    fi
}

# Function to show backup status
show_backup_status() {
    print_status "Backup Status:"
    echo ""
    
    # Show backup directory contents
    if [ -d "$BACKUP_DIR" ]; then
        echo "Backup Directory: $BACKUP_DIR"
        echo "Contents:"
        ls -lah "$BACKUP_DIR"
        echo ""
        
        # Show disk usage
        echo "Backup Directory Usage:"
        du -sh "$BACKUP_DIR"
        echo ""
    fi
    
    # Show recent backups
    echo "Recent Backups:"
    find "$BACKUP_DIR" -name "skillport_backup_*.tar.gz" -type f -exec ls -lah {} \; | sort -k6,7
    echo ""
}

# Function to restore from backup
restore_from_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore from"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_status "Restoring from backup: $backup_file"
    
    # Create restore directory
    local restore_dir="restore_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$restore_dir"
    
    # Extract backup
    if tar -xzf "$backup_file" -C "$restore_dir"; then
        print_success "Backup extracted to: $restore_dir"
        print_warning "Please manually restore the files from $restore_dir"
        print_warning "This is a destructive operation. Make sure you have a current backup!"
    else
        print_error "Failed to extract backup"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "SkillPort Community Backup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  backup       Create a new backup"
    echo "  restore      Restore from a backup"
    echo "  status       Show backup status"
    echo "  cleanup      Clean up old backups"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup                    # Create a new backup"
    echo "  $0 restore backup_file.tar.gz # Restore from backup"
    echo "  $0 status                    # Show backup status"
    echo "  $0 cleanup                   # Clean up old backups"
}

# Main function
main() {
    case "${1:-backup}" in
        "backup")
            print_status "Starting backup process..."
            
            # Create backup directory
            mkdir -p "$BACKUP_PATH"
            
            # Run backup tasks
            backup_database
            backup_application_files
            backup_uploaded_files
            backup_logs
            backup_environment
            
            # Create archive
            create_backup_archive
            
            # Upload to S3 (if configured)
            upload_to_s3
            
            # Verify backup
            verify_backup
            
            # Clean up old backups
            cleanup_old_backups
            
            print_success "🎉 Backup completed successfully!"
            print_status "Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
            ;;
        "restore")
            restore_from_backup "$2"
            ;;
        "status")
            show_backup_status
            ;;
        "cleanup")
            cleanup_old_backups
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
