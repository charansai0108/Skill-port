#!/bin/bash

# SkillPort Community - AWS Deployment Script
# This script deploys the entire infrastructure to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="skillport-community"
REGION="us-east-1"
ENVIRONMENT="production"

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

# Function to check if AWS CLI is configured
check_aws_cli() {
    print_status "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is configured"
}

# Function to check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "DB_PASSWORD"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "REDIS_PASSWORD"
        "SMTP_USER"
        "SMTP_PASS"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these variables in your environment or .env.production file"
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
    
    # Create ECR repositories if they don't exist
    print_status "Creating ECR repositories..."
    
    aws ecr create-repository --repository-name skillport-frontend --region $REGION 2>/dev/null || true
    aws ecr create-repository --repository-name skillport-backend --region $REGION 2>/dev/null || true
    aws ecr create-repository --repository-name skillport-extension --region $REGION 2>/dev/null || true
    
    # Login to ECR
    print_status "Logging in to ECR..."
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Build and push frontend image
    print_status "Building frontend image..."
    docker build -t skillport-frontend -f apps/web/Dockerfile .
    docker tag skillport-frontend:latest $ECR_REGISTRY/skillport-frontend:latest
    docker push $ECR_REGISTRY/skillport-frontend:latest
    
    # Build and push backend image
    print_status "Building backend image..."
    docker build -t skillport-backend -f backend/Dockerfile .
    docker tag skillport-backend:latest $ECR_REGISTRY/skillport-backend:latest
    docker push $ECR_REGISTRY/skillport-backend:latest
    
    # Build and push extension image
    print_status "Building extension image..."
    docker build -t skillport-extension -f apps/extension/Dockerfile .
    docker tag skillport-extension:latest $ECR_REGISTRY/skillport-extension:latest
    docker push $ECR_REGISTRY/skillport-extension:latest
    
    print_success "Docker images built and pushed successfully"
}

# Function to deploy CloudFormation stack
deploy_infrastructure() {
    print_status "Deploying AWS infrastructure..."
    
    # Deploy the CloudFormation stack
    aws cloudformation deploy \
        --template-file aws/cloudformation-template.yml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            Environment=$ENVIRONMENT \
            DatabasePassword=$DB_PASSWORD \
            RedisPassword=$REDIS_PASSWORD \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    print_success "Infrastructure deployed successfully"
}

# Function to update ECS services
update_ecs_services() {
    print_status "Updating ECS services..."
    
    # Get cluster name
    CLUSTER_NAME="skillport-cluster"
    
    # Update frontend service
    print_status "Updating frontend service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service skillport-frontend \
        --force-new-deployment \
        --region $REGION 2>/dev/null || print_warning "Frontend service not found, will be created by ECS task definition"
    
    # Update backend service
    print_status "Updating backend service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service skillport-backend \
        --force-new-deployment \
        --region $REGION 2>/dev/null || print_warning "Backend service not found, will be created by ECS task definition"
    
    # Update extension service
    print_status "Updating extension service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service skillport-extension \
        --force-new-deployment \
        --region $REGION 2>/dev/null || print_warning "Extension service not found, will be created by ECS task definition"
    
    print_success "ECS services updated successfully"
}

# Function to run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    # Get database endpoint
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
        --output text \
        --region $REGION)
    
    if [ -z "$DB_ENDPOINT" ]; then
        print_error "Could not get database endpoint from CloudFormation stack"
        exit 1
    fi
    
    # Set database URL for migrations
    export DATABASE_URL="postgresql://skillport:${DB_PASSWORD}@${DB_ENDPOINT}:5432/skillport_prod"
    
    # Run migrations
    cd apps/web
    npx prisma db push
    npx prisma db seed
    cd ../..
    
    print_success "Database migrations completed successfully"
}

# Function to display deployment information
show_deployment_info() {
    print_status "Deployment completed! Here's your deployment information:"
    
    # Get outputs from CloudFormation stack
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs' \
        --region $REGION)
    
    echo ""
    echo "=== DEPLOYMENT INFORMATION ==="
    echo ""
    
    # Load Balancer DNS
    ALB_DNS=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
    echo "🌐 Application URL: http://$ALB_DNS"
    
    # Database Endpoint
    DB_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="DatabaseEndpoint") | .OutputValue')
    echo "🗄️  Database Endpoint: $DB_ENDPOINT"
    
    # Redis Endpoint
    REDIS_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="RedisEndpoint") | .OutputValue')
    echo "🔴 Redis Endpoint: $REDIS_ENDPOINT"
    
    # S3 Bucket
    S3_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="AssetsBucketName") | .OutputValue')
    echo "📦 S3 Bucket: $S3_BUCKET"
    
    # CloudFront Distribution
    CLOUDFRONT_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CloudFrontDistributionId") | .OutputValue')
    echo "☁️  CloudFront Distribution: $CLOUDFRONT_ID"
    
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Set up a custom domain and SSL certificate"
    echo "2. Configure Route 53 for DNS management"
    echo "3. Set up monitoring and alerting in CloudWatch"
    echo "4. Configure backup policies for RDS"
    echo "5. Set up CI/CD pipeline for automated deployments"
    echo ""
    print_success "Deployment completed successfully! 🎉"
}

# Main deployment function
main() {
    echo "🚀 Starting SkillPort Community AWS Deployment"
    echo "=============================================="
    echo ""
    
    # Check prerequisites
    check_aws_cli
    check_environment
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Build and push images
    build_and_push_images
    
    # Update ECS services
    update_ecs_services
    
    # Run database migrations
    run_database_migrations
    
    # Show deployment information
    show_deployment_info
}

# Run main function
main "$@"
