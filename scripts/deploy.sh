#!/bin/bash

# SkillPort Community - AWS Deployment Script
# This script handles the complete deployment process to AWS

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECS_CLUSTER="skillport-cluster"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
}

# Login to ECR
login_ecr() {
    log_info "Logging in to Amazon ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
}

# Create ECR repositories if they don't exist
create_ecr_repos() {
    log_info "Creating ECR repositories..."
    
    for repo in skillport-frontend skillport-backend skillport-extension; do
        if ! aws ecr describe-repositories --repository-names $repo --region $AWS_REGION &> /dev/null; then
            log_info "Creating ECR repository: $repo"
            aws ecr create-repository --repository-name $repo --region $AWS_REGION
        else
            log_info "ECR repository $repo already exists"
        fi
    done
}

# Build and push Docker images
build_and_push() {
    log_info "Building and pushing Docker images..."
    
    # Frontend
    log_info "Building frontend image..."
    docker build -f apps/web/Dockerfile -t $ECR_REGISTRY/skillport-frontend:latest .
    docker push $ECR_REGISTRY/skillport-frontend:latest
    
    # Backend
    log_info "Building backend image..."
    docker build -f backend/Dockerfile -t $ECR_REGISTRY/skillport-backend:latest .
    docker push $ECR_REGISTRY/skillport-backend:latest
    
    # Extension
    log_info "Building extension image..."
    docker build -f apps/extension/Dockerfile -t $ECR_REGISTRY/skillport-extension:latest .
    docker push $ECR_REGISTRY/skillport-extension:latest
}

# Create ECS cluster
create_ecs_cluster() {
    log_info "Creating ECS cluster..."
    if ! aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION &> /dev/null; then
        aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION
    else
        log_info "ECS cluster $ECS_CLUSTER already exists"
    fi
}

# Register task definitions
register_task_definitions() {
    log_info "Registering task definitions..."
    
    # Update account ID in task definitions
    sed -i "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" aws/ecs-task-definition-*.json
    
    aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-frontend.json --region $AWS_REGION
    aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-backend.json --region $AWS_REGION
    aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-extension.json --region $AWS_REGION
}

# Create ECS services
create_ecs_services() {
    log_info "Creating ECS services..."
    
    # Create VPC and subnets if they don't exist
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=skillport-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION)
    
    if [ "$VPC_ID" = "None" ] || [ -z "$VPC_ID" ]; then
        log_info "Creating VPC and networking resources..."
        # This would typically be done with CloudFormation or Terraform
        log_warn "Please create VPC and networking resources manually or use Infrastructure as Code"
    fi
}

# Deploy to S3 and CloudFront
deploy_frontend() {
    log_info "Deploying frontend to S3 and CloudFront..."
    
    # Build the frontend
    cd apps/web
    npm run build
    
    # Sync to S3
    aws s3 sync out/ s3://$S3_BUCKET_NAME --delete
    
    # Invalidate CloudFront
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    
    cd ../..
}

# Main deployment function
deploy() {
    log_info "Starting SkillPort Community deployment to AWS..."
    
    # Pre-flight checks
    check_aws_cli
    check_docker
    
    # Set AWS account ID if not provided
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    fi
    
    log_info "Using AWS Account ID: $AWS_ACCOUNT_ID"
    
    # Deployment steps
    create_ecr_repos
    login_ecr
    build_and_push
    create_ecs_cluster
    register_task_definitions
    
    log_info "Deployment completed successfully!"
    log_info "Next steps:"
    log_info "1. Create VPC and networking resources"
    log_info "2. Create RDS database instance"
    log_info "3. Create ElastiCache Redis cluster"
    log_info "4. Create ECS services with load balancers"
    log_info "5. Configure DNS and SSL certificates"
}

# Run deployment
deploy
