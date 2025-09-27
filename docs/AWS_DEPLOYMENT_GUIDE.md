# SkillPort Community - AWS Deployment Guide

This guide provides step-by-step instructions for deploying the SkillPort Community project to AWS using ECS Fargate, RDS, S3, CloudFront, and other AWS services.

## Prerequisites

### Required Tools
- AWS CLI v2 installed and configured
- Docker installed and running
- Node.js 18+ installed
- npm installed
- Git installed

### AWS Account Setup
- AWS Account with appropriate permissions
- IAM user with programmatic access
- AWS CLI configured with credentials

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Route 53      │    │   ACM (SSL)     │
│   (CDN)         │    │   (DNS)          │    │   (Certificates)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Application   │
                    │   Load Balancer │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ECS Fargate   │    │   ECS Fargate   │    │   ECS Fargate   │
│   (Frontend)    │    │   (Backend)     │    │   (Extension)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Amazon RDS    │    │   ElastiCache   │    │   S3 Bucket   │
│   (PostgreSQL)  │    │   (Redis)       │    │   (Assets)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Step 1: Environment Setup

### 1.1 Create Environment File
```bash
cp env.production .env.production
```

### 1.2 Configure Environment Variables
Edit `.env.production` with your actual values:

```bash
# Database
DATABASE_URL=postgresql://skillport:YOUR_DB_PASSWORD@your-rds-endpoint:5432/skillport_prod

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# S3 Configuration
AWS_S3_BUCKET=skillport-assets-prod

# Redis Configuration
REDIS_URL=redis://your-redis-endpoint:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## Step 2: Build and Test

### 2.1 Run Tests
```bash
npm test
```

### 2.2 Build All Components
```bash
./scripts/build.sh
```

### 2.3 Verify Builds
```bash
# Check frontend build
ls -la apps/web/.next

# Check backend build
ls -la backend/.next

# Check extension files
ls -la apps/extension/
```

## Step 3: AWS Infrastructure Setup

### 3.1 Create CloudFormation Stack
```bash
aws cloudformation create-stack \
  --stack-name skillport-infrastructure \
  --template-body file://aws/cloudformation-template.yml \
  --parameters ParameterKey=DatabasePassword,ParameterValue=YOUR_DB_PASSWORD \
               ParameterKey=RedisPassword,ParameterValue=YOUR_REDIS_PASSWORD \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### 3.2 Wait for Stack Creation
```bash
aws cloudformation wait stack-create-complete \
  --stack-name skillport-infrastructure \
  --region us-east-1
```

### 3.3 Get Stack Outputs
```bash
aws cloudformation describe-stacks \
  --stack-name skillport-infrastructure \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

## Step 4: Container Registry Setup

### 4.1 Create ECR Repositories
```bash
# Frontend repository
aws ecr create-repository \
  --repository-name skillport-frontend \
  --region us-east-1

# Backend repository
aws ecr create-repository \
  --repository-name skillport-backend \
  --region us-east-1

# Extension repository
aws ecr create-repository \
  --repository-name skillport-extension \
  --region us-east-1
```

### 4.2 Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Step 5: Build and Push Docker Images

### 5.1 Build Frontend Image
```bash
docker build -f apps/web/Dockerfile -t skillport-frontend:latest .
docker tag skillport-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-frontend:latest
```

### 5.2 Build Backend Image
```bash
docker build -f backend/Dockerfile -t skillport-backend:latest .
docker tag skillport-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest
```

### 5.3 Build Extension Image
```bash
docker build -f apps/extension/Dockerfile -t skillport-extension:latest .
docker tag skillport-extension:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-extension:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skillport-extension:latest
```

## Step 6: Secrets Management

### 6.1 Create Secrets in AWS Secrets Manager
```bash
# Database URL
aws secretsmanager create-secret \
  --name skillport/database-url \
  --description "Database connection URL" \
  --secret-string "postgresql://skillport:YOUR_PASSWORD@your-rds-endpoint:5432/skillport_prod"

# JWT Secret
aws secretsmanager create-secret \
  --name skillport/jwt-secret \
  --description "JWT signing secret" \
  --secret-string "your-jwt-secret"

# NextAuth Secret
aws secretsmanager create-secret \
  --name skillport/nextauth-secret \
  --description "NextAuth secret" \
  --secret-string "your-nextauth-secret"

# AWS Credentials
aws secretsmanager create-secret \
  --name skillport/aws-access-key \
  --description "AWS Access Key ID" \
  --secret-string "your-aws-access-key"

aws secretsmanager create-secret \
  --name skillport/aws-secret-key \
  --description "AWS Secret Access Key" \
  --secret-string "your-aws-secret-key"

# Redis URL
aws secretsmanager create-secret \
  --name skillport/redis-url \
  --description "Redis connection URL" \
  --secret-string "redis://your-redis-endpoint:6379"

# Sentry DSN
aws secretsmanager create-secret \
  --name skillport/sentry-dsn \
  --description "Sentry DSN for error tracking" \
  --secret-string "your-sentry-dsn"

# Razorpay Keys
aws secretsmanager create-secret \
  --name skillport/razorpay-key-id \
  --description "Razorpay Key ID" \
  --secret-string "your-razorpay-key-id"

aws secretsmanager create-secret \
  --name skillport/razorpay-key-secret \
  --description "Razorpay Key Secret" \
  --secret-string "your-razorpay-key-secret"
```

## Step 7: ECS Task Definitions

### 7.1 Update Task Definitions with Account ID
```bash
# Replace ACCOUNT_ID in task definition files
sed -i 's/ACCOUNT_ID/YOUR_ACCOUNT_ID/g' aws/ecs-task-definition-*.json
```

### 7.2 Register Task Definitions
```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-frontend.json \
  --region us-east-1

aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-backend.json \
  --region us-east-1

aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-extension.json \
  --region us-east-1
```

## Step 8: ECS Services

### 8.1 Create ECS Services
```bash
# Frontend Service
aws ecs create-service \
  --cluster skillport-cluster \
  --service-name skillport-frontend-service \
  --task-definition skillport-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/skillport-frontend-tg/12345,containerName=skillport-frontend,containerPort=3000" \
  --region us-east-1

# Backend Service
aws ecs create-service \
  --cluster skillport-cluster \
  --service-name skillport-backend-service \
  --task-definition skillport-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/skillport-backend-tg/12345,containerName=skillport-backend,containerPort=3001" \
  --region us-east-1

# Extension Service
aws ecs create-service \
  --cluster skillport-cluster \
  --service-name skillport-extension-service \
  --task-definition skillport-extension:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/skillport-extension-tg/12345,containerName=skillport-extension,containerPort=3002" \
  --region us-east-1
```

## Step 9: Frontend Deployment to S3

### 9.1 Build Frontend for Static Export
```bash
cd apps/web
npm run build
npm run export
```

### 9.2 Deploy to S3
```bash
aws s3 sync out/ s3://skillport-assets-prod-YOUR_ACCOUNT_ID --delete
```

### 9.3 Configure CloudFront
```bash
# Get CloudFront Distribution ID from CloudFormation outputs
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name skillport-infrastructure \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"
```

## Step 10: Monitoring Setup

### 10.1 CloudWatch Log Groups
```bash
# Log groups are created automatically by CloudFormation
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/ecs/skillport" \
  --region us-east-1
```

### 10.2 Sentry Integration
- Configure Sentry DSN in your environment variables
- Set up error tracking and performance monitoring
- Configure alerts for critical errors

## Step 11: DNS Configuration

### 11.1 Route 53 Setup
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name skillport.com \
  --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://dns-records.json
```

## Step 12: SSL Certificate

### 12.1 Request SSL Certificate
```bash
aws acm request-certificate \
  --domain-name skillport.com \
  --subject-alternative-names www.skillport.com \
  --validation-method DNS \
  --region us-east-1
```

### 12.2 Validate Certificate
- Add DNS validation records to Route 53
- Wait for certificate validation

## Step 13: CI/CD Pipeline

### 13.1 GitHub Secrets
Add the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

### 13.2 Enable GitHub Actions
The CI/CD pipeline is configured in `.github/workflows/deploy.yml` and will automatically:
- Run tests on every push
- Build and push Docker images on main branch
- Deploy to ECS services
- Deploy frontend to S3 and CloudFront

## Step 14: Health Checks

### 14.1 Application Health
```bash
# Check frontend health
curl https://skillport.com/api/health

# Check backend health
curl https://api.skillport.com/api/health

# Check extension health
curl https://extension.skillport.com/api/v1/health
```

### 14.2 Database Health
```bash
# Connect to RDS instance
psql -h your-rds-endpoint -U skillport -d skillport_prod
```

## Step 15: Performance Optimization

### 15.1 CloudFront Optimization
- Configure caching policies
- Set up compression
- Enable HTTP/2

### 15.2 Database Optimization
- Configure connection pooling
- Set up read replicas if needed
- Monitor performance metrics

### 15.3 ECS Optimization
- Configure auto-scaling
- Set up health checks
- Monitor resource utilization

## Troubleshooting

### Common Issues

1. **ECS Service Won't Start**
   - Check task definition
   - Verify security groups
   - Check CloudWatch logs

2. **Database Connection Issues**
   - Verify security groups
   - Check database endpoint
   - Validate credentials

3. **Load Balancer Health Check Failures**
   - Check application health endpoints
   - Verify security groups
   - Check target group configuration

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster skillport-cluster \
  --services skillport-frontend-service \
  --region us-east-1

# Check CloudWatch logs
aws logs describe-log-streams \
  --log-group-name /aws/ecs/skillport-frontend \
  --region us-east-1

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier skillport-database \
  --region us-east-1
```

## Cost Optimization

### Estimated Monthly Costs (US East 1)
- ECS Fargate (2 vCPU, 4GB RAM): ~$60
- RDS PostgreSQL (db.t3.micro): ~$15
- ElastiCache Redis (cache.t3.micro): ~$15
- S3 Storage (10GB): ~$0.25
- CloudFront (1TB transfer): ~$85
- Application Load Balancer: ~$18
- **Total: ~$193/month**

### Cost Optimization Tips
- Use Spot instances for non-critical workloads
- Implement auto-scaling
- Use S3 Intelligent Tiering
- Monitor and optimize CloudFront usage

## Security Best Practices

1. **Network Security**
   - Use private subnets for databases
   - Configure security groups properly
   - Enable VPC Flow Logs

2. **Application Security**
   - Use HTTPS everywhere
   - Implement rate limiting
   - Regular security updates

3. **Data Security**
   - Encrypt data at rest and in transit
   - Use AWS Secrets Manager
   - Regular backups

## Monitoring and Alerting

### CloudWatch Metrics
- ECS service metrics
- RDS performance metrics
- Application Load Balancer metrics
- CloudFront metrics

### Alerts
- High error rates
- High response times
- Database connection issues
- Service health check failures

## Backup and Disaster Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Cross-region backup replication

### Application Backups
- ECS task definitions
- CloudFormation templates
- Docker images in ECR

## Scaling

### Horizontal Scaling
- ECS service auto-scaling
- Database read replicas
- CloudFront edge locations

### Vertical Scaling
- Increase ECS task CPU/memory
- Upgrade RDS instance class
- Optimize application code

## Maintenance

### Regular Tasks
- Update dependencies
- Security patches
- Performance monitoring
- Cost optimization

### Updates
- Blue-green deployments
- Rolling updates
- Database migrations

## Support

For issues and questions:
- Check CloudWatch logs
- Review ECS service events
- Monitor application metrics
- Contact AWS support if needed

---

**Note**: Replace placeholder values (YOUR_ACCOUNT_ID, YOUR_DB_PASSWORD, etc.) with your actual values throughout this guide.
