#!/bin/bash
set -e

echo "🚀 Starting SkillPort Community deployment..."

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

# Check prerequisites
print_status "Checking prerequisites..."
command -v aws >/dev/null 2>&1 || { print_error "AWS CLI not found. Please install it."; exit 1; }
command -v docker >/dev/null 2>&1 || { print_error "Docker not found. Please install it."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm not found. Please install it."; exit 1; }

# Set variables
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY="123456789.dkr.ecr.${AWS_REGION}.amazonaws.com"
STACK_NAME="skillport-infrastructure"

# Step 1: Run tests
print_status "Running tests..."
npm run test:ci || { print_error "Tests failed!"; exit 1; }

# Step 2: Build applications
print_status "Building applications..."
npm run build || { print_error "Build failed!"; exit 1; }

# Step 3: Build Docker images
print_status "Building Docker images..."
docker build -t skillport-frontend ./apps/web
docker build -t skillport-backend ./backend
docker build -t skillport-extension ./apps/extension

# Step 4: Login to ECR
print_status "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Step 5: Tag and push images
print_status "Pushing images to ECR..."
docker tag skillport-frontend:latest $ECR_REGISTRY/skillport-frontend:latest
docker tag skillport-backend:latest $ECR_REGISTRY/skillport-backend:latest
docker tag skillport-extension:latest $ECR_REGISTRY/skillport-extension:latest

docker push $ECR_REGISTRY/skillport-frontend:latest
docker push $ECR_REGISTRY/skillport-backend:latest
docker push $ECR_REGISTRY/skillport-extension:latest

# Step 6: Deploy infrastructure (if not exists)
print_status "Deploying infrastructure..."
aws cloudformation describe-stacks --stack-name $STACK_NAME >/dev/null 2>&1 || {
    print_status "Creating CloudFormation stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://infrastructure/cloudformation.yml \
        --capabilities CAPABILITY_IAM
}

# Step 7: Deploy to ECS
print_status "Deploying to ECS..."
aws ecs update-service --cluster skillport-cluster --service skillport-frontend-service --force-new-deployment
aws ecs update-service --cluster skillport-cluster --service skillport-backend-service --force-new-deployment

# Step 8: Run database migrations
print_status "Running database migrations..."
aws ecs run-task --cluster skillport-cluster --task-definition skillport-migration --launch-type FARGATE

# Step 9: Run smoke tests
print_status "Running smoke tests..."
sleep 30  # Wait for services to be ready
npm run test:smoke || { print_warning "Smoke tests failed, but deployment completed."; }

print_status "✅ Deployment completed successfully!"
print_status "🌐 Frontend: https://your-domain.com"
print_status "🔧 Backend: https://api.your-domain.com"
print_status "📊 Monitoring: https://console.aws.amazon.com/cloudwatch"
