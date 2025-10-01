# 🚀 AWS Setup Guide for SkillPort Community

This guide will help you deploy your SkillPort Community application to AWS using a complete serverless and containerized architecture.

## 📋 Prerequisites

### Required Tools
- **AWS CLI v2** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Docker** - [Install Guide](https://docs.docker.com/get-docker/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### AWS Account Setup
1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create an IAM user with programmatic access
3. Attach the following policies:
   - `AmazonECS_FullAccess`
   - `AmazonRDS_FullAccess`
   - `AmazonS3_FullAccess`
   - `AmazonElastiCache_FullAccess`
   - `CloudFormation_FullAccess`
   - `IAM_FullAccess`

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Route 53      │    │   ACM (SSL)     │
│   (CDN)         │    │   (DNS)         │    │   (Certificates)│
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
│   Amazon RDS    │    │   ElastiCache   │    │   S3 Bucket     │
│   (PostgreSQL)  │    │   (Redis)       │    │   (Assets)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start Deployment

### 1. Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

### 2. Set Environment Variables
Create a `.env.production` file with your AWS credentials:

```bash
# Database
DB_PASSWORD=your_secure_database_password
DATABASE_URL=postgresql://skillport:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/skillport_prod

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Redis
REDIS_PASSWORD=your_redis_password

# Email (Gmail)
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
GA_TRACKING_ID=your_google_analytics_id
```

### 3. Deploy to AWS
```bash
# Make the script executable
chmod +x scripts/deploy-aws.sh

# Deploy everything to AWS
./scripts/deploy-aws.sh
```

## 🔧 Manual Setup (Step by Step)

### Step 1: Deploy Infrastructure
```bash
# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file aws/cloudformation-template.yml \
  --stack-name skillport-community \
  --parameter-overrides \
    Environment=production \
    DatabasePassword=your_secure_password \
    RedisPassword=your_redis_password \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### Step 2: Build and Push Docker Images
```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repositories
aws ecr create-repository --repository-name skillport-frontend --region us-east-1
aws ecr create-repository --repository-name skillport-backend --region us-east-1
aws ecr create-repository --repository-name skillport-extension --region us-east-1

# Build and push images
docker build -t skillport-frontend -f apps/web/Dockerfile .
docker tag skillport-frontend:latest $ECR_REGISTRY/skillport-frontend:latest
docker push $ECR_REGISTRY/skillport-frontend:latest

# Repeat for backend and extension...
```

### Step 3: Run Database Migrations
```bash
# Get database endpoint
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name skillport-community \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

# Set database URL
export DATABASE_URL="postgresql://skillport:${DB_PASSWORD}@${DB_ENDPOINT}:5432/skillport_prod"

# Run migrations
cd apps/web
npx prisma db push
npx prisma db seed
```

## 📊 AWS Services Used

### Core Services
- **ECS Fargate** - Container hosting (no server management)
- **RDS PostgreSQL** - Managed database
- **S3** - File storage and static assets
- **ElastiCache Redis** - Caching and sessions
- **CloudFront** - Global CDN
- **Application Load Balancer** - Traffic distribution

### Security & Networking
- **VPC** - Isolated network environment
- **Security Groups** - Firewall rules
- **IAM** - Access control and permissions
- **Secrets Manager** - Secure credential storage

### Monitoring & Logging
- **CloudWatch** - Logs and metrics
- **CloudTrail** - API audit trail
- **X-Ray** - Distributed tracing (optional)

## 💰 Cost Estimation

### Monthly Costs (US East 1)
- **ECS Fargate** (3 services): ~$15-30
- **RDS PostgreSQL** (db.t3.micro): ~$15
- **ElastiCache Redis** (cache.t3.micro): ~$10
- **S3 Storage** (1GB): ~$0.02
- **CloudFront** (1TB transfer): ~$85
- **Application Load Balancer**: ~$16
- **Data Transfer**: ~$10-20

**Total Estimated Cost: ~$150-180/month**

### Cost Optimization Tips
1. Use **Reserved Instances** for RDS (30-50% savings)
2. Enable **S3 Intelligent Tiering** for storage
3. Use **CloudFront** caching to reduce origin requests
4. Monitor usage with **AWS Cost Explorer**

## 🔒 Security Best Practices

### Database Security
- Database is in private subnets (not publicly accessible)
- Security groups restrict access to application only
- Encryption at rest and in transit enabled

### Application Security
- All traffic goes through HTTPS
- Security headers configured
- Rate limiting implemented
- Input validation and sanitization

### AWS Security
- IAM roles with least privilege access
- Secrets stored in AWS Secrets Manager
- CloudTrail enabled for audit logging
- VPC with private subnets for sensitive resources

## 📈 Scaling Considerations

### Horizontal Scaling
- ECS Fargate auto-scales based on CPU/memory
- Application Load Balancer distributes traffic
- RDS can scale read replicas for read-heavy workloads

### Vertical Scaling
- Upgrade RDS instance class for more performance
- Increase ECS task CPU/memory allocation
- Add more ElastiCache nodes

### Performance Optimization
- CloudFront CDN for global content delivery
- Redis caching for frequently accessed data
- Database connection pooling
- S3 for static asset storage

## 🚨 Troubleshooting

### Common Issues

#### 1. ECS Tasks Not Starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition skillport-frontend

# Check service events
aws ecs describe-services --cluster skillport-cluster --services skillport-frontend
```

#### 2. Database Connection Issues
```bash
# Check security groups
aws ec2 describe-security-groups --group-names skillport-database-sg

# Test connection
psql "postgresql://skillport:password@your-db-endpoint:5432/skillport_prod"
```

#### 3. S3 Access Issues
```bash
# Check IAM policies
aws iam get-role-policy --role-name ecsTaskRole --policy-name S3Access

# Test S3 access
aws s3 ls s3://your-bucket-name
```

### Monitoring Commands
```bash
# View CloudFormation stack status
aws cloudformation describe-stacks --stack-name skillport-community

# Check ECS cluster status
aws ecs describe-clusters --clusters skillport-cluster

# View application logs
aws logs describe-log-groups --log-group-name-prefix /aws/ecs/skillport
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
1. Create `.github/workflows/deploy.yml`
2. Add AWS credentials as repository secrets
3. Configure automatic deployment on push to main branch

### Manual Deployment
```bash
# Update application
git pull origin main

# Rebuild and deploy
./scripts/deploy-aws.sh
```

## 📞 Support

### AWS Documentation
- [ECS Fargate](https://docs.aws.amazon.com/ecs/latest/developerguide/AWS_Fargate.html)
- [RDS PostgreSQL](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_PostgreSQL.html)
- [S3](https://docs.aws.amazon.com/s3/)
- [CloudFront](https://docs.aws.amazon.com/cloudfront/)

### Project Documentation
- Check `docs/` folder for detailed guides
- Review `README.md` for project overview
- See `PRODUCTION_READINESS_GUIDE.md` for production checklist

---

## 🎉 You're All Set!

Your SkillPort Community application is now running on AWS with:
- ✅ Scalable containerized architecture
- ✅ Managed PostgreSQL database
- ✅ Global CDN with CloudFront
- ✅ Redis caching
- ✅ S3 file storage
- ✅ Load balancing
- ✅ Security best practices

**Next Steps:**
1. Set up a custom domain
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Implement CI/CD pipeline
5. Configure backups and disaster recovery

Happy coding! 🚀
