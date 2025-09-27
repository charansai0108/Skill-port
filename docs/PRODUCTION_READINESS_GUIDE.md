# SkillPort Community - Complete Production Readiness Guide

## 1. Testing Setup & Commands

### Install Testing Dependencies
```bash
# Install all testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom @types/jest
npm install --save-dev playwright @playwright/test
npm install --save-dev supertest @types/supertest
npm install --save-dev cypress
```

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test files
npm run test -- --testPathPattern=components
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run API integration tests
npm run test:api

# Run database integration tests
npm run test:db
```

### E2E Tests
```bash
# Run Playwright E2E tests
npm run test:e2e

# Run Cypress E2E tests
npm run test:cypress

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### Cursor Testing
```bash
# Install cursor testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run cursor tests
npm run test:cursor

# Run cursor tests with coverage
npm run test:cursor:coverage
```

### Test Configuration Files

**jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Ensure All Tests Pass
```bash
# Run complete test suite
npm run test:all

# Run tests with exit on failure
npm run test:ci

# Run tests in CI environment
CI=true npm run test:all
```

## 2. Build Preparation

### Directory Structure Adjustments
```bash
# Ensure proper monorepo structure
mkdir -p apps/web apps/extension backend packages/ui packages/utils packages/types packages/hooks
mkdir -p tests/unit tests/integration tests/e2e
mkdir -p scripts deployment
```

### Frontend Build (Next.js)
```bash
cd apps/web

# Install dependencies
npm install

# Build for production
npm run build

# Export static files (if needed)
npm run export

# Analyze bundle size
npm run analyze

# Run production build locally
npm run start
```

### Backend Build (Node.js + Prisma)
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start production server
npm run start:prod
```

### Extension Build
```bash
cd apps/extension

# Install dependencies
npm install

# Build extension
npm run build

# Package extension
npm run package
```

### Shared Packages Build
```bash
# Build all shared packages
npm run build:packages

# Build specific packages
cd packages/ui && npm run build
cd packages/utils && npm run build
cd packages/types && npm run build
cd packages/hooks && npm run build
```

### Production Optimization Commands
```bash
# Optimize images
npm run optimize:images

# Minify assets
npm run minify

# Generate sitemap
npm run generate:sitemap

# Run lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze:bundle
```

## 3. Production Configuration

### Environment Variables Setup

**`.env.production`**
```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/skillport_prod
DATABASE_URL_DIRECT=postgresql://username:password@your-rds-endpoint:5432/skillport_prod

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Redis (for sessions)
REDIS_URL=redis://your-redis-endpoint:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_S3_BUCKET=skillport-assets
AWS_S3_REGION=us-east-1

# WebSocket
WS_URL=wss://your-websocket-endpoint

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### TypeScript Production Configuration

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js Production Configuration

**`next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'your-s3-bucket.s3.amazonaws.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

### Database Connection Setup

**`prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  STUDENT
  MENTOR
  ADMIN
}
```

### Production Package.json Scripts

**Root `package.json`**
```json
{
  "scripts": {
    "build": "npm run build:packages && npm run build:apps",
    "build:packages": "npm run build --workspaces --if-present",
    "build:apps": "npm run build --workspace=apps/web --workspace=backend",
    "test": "jest",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "analyze": "npm run build && npm run analyze:bundle",
    "analyze:bundle": "npx @next/bundle-analyzer",
    "optimize:images": "npx @squoosh/cli --webp",
    "generate:sitemap": "npx next-sitemap",
    "lighthouse": "npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html"
  }
}
```

## 4. Docker & Deployment Preparation

### Frontend Dockerfile (Next.js)
**`apps/web/Dockerfile`**
```dockerfile
# Multi-stage build for Next.js
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Backend Dockerfile (Node.js + Prisma)
**`backend/Dockerfile`**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

CMD ["npm", "start:prod"]
```

### Extension Dockerfile
**`apps/extension/Dockerfile`**
```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build extension
RUN npm run build

# Create production image
FROM nginx:alpine AS runner

# Copy built extension files
COPY --from=base /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose for Local Production Testing
**`docker-compose.prod.yml`**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: skillport_prod
      POSTGRES_USER: skillport
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U skillport"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://skillport:secure_password@postgres:5432/skillport_prod
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules

  # Frontend Next.js
  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://skillport:secure_password@postgres:5432/skillport_prod
      - REDIS_URL=redis://redis:6379
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules

  # Extension
  extension:
    build:
      context: ./apps/extension
      dockerfile: Dockerfile
    ports:
      - "3002:80"

volumes:
  postgres_data:
  redis_data:
```

### Docker Build and Tag Commands
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Build specific services
docker build -t skillport-frontend ./apps/web
docker build -t skillport-backend ./backend
docker build -t skillport-extension ./apps/extension

# Tag images for ECR
docker tag skillport-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-frontend:latest
docker tag skillport-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest
docker tag skillport-extension:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-extension:latest

# Test local production setup
docker-compose -f docker-compose.prod.yml up -d
```

## 5. AWS Deployment Plan

### Recommended AWS Architecture

**Services Selection:**
- **Frontend**: AWS Amplify (for Next.js SSR) or ECS Fargate
- **Backend**: ECS Fargate (for Node.js API)
- **Database**: RDS PostgreSQL (Multi-AZ for production)
- **WebSocket**: API Gateway WebSocket or ECS with Socket.IO
- **Storage**: S3 for static assets, user uploads
- **CDN**: CloudFront for global distribution
- **Caching**: ElastiCache Redis for sessions
- **Monitoring**: CloudWatch, X-Ray tracing
- **Security**: WAF, Secrets Manager, IAM roles

### AWS Infrastructure Setup

**1. Create ECR Repositories**
```bash
# Create ECR repositories
aws ecr create-repository --repository-name skillport-frontend --region us-east-1
aws ecr create-repository --repository-name skillport-backend --region us-east-1
aws ecr create-repository --repository-name skillport-extension --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
```

**2. Create RDS Database**
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier skillport-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username skillport \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name skillport-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

**3. Create ElastiCache Redis**
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id skillport-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --vpc-security-group-ids sg-12345678
```

**4. Create S3 Bucket**
```bash
# Create S3 bucket for assets
aws s3 mb s3://skillport-assets-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket skillport-assets-prod \
  --versioning-configuration Status=Enabled
```

### CloudFormation Template

**`infrastructure/cloudformation.yml`**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'SkillPort Community Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-vpc'

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-igw'

  # Public Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-public-subnet-1'

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-public-subnet-2'

  # Private Subnets
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.3.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-private-subnet-1'

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.4.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-private-subnet-2'

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub '${AWS::StackName}-cluster'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${AWS::StackName}-alb'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # Security Groups
  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ALB
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  ECSSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ECS tasks
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3000
          ToPort: 3000
          SourceSecurityGroupId: !Ref ALBSecurityGroup
        - IpProtocol: tcp
          FromPort: 3001
          ToPort: 3001
          SourceSecurityGroupId: !Ref ALBSecurityGroup

Outputs:
  VPC:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub '${AWS::StackName}-VPC'

  ECSCluster:
    Description: ECS Cluster
    Value: !Ref ECSCluster
    Export:
      Name: !Sub '${AWS::StackName}-ECSCluster'

  ApplicationLoadBalancer:
    Description: Application Load Balancer
    Value: !Ref ApplicationLoadBalancer
    Export:
      Name: !Sub '${AWS::StackName}-ALB'
```

### Deploy Infrastructure
```bash
# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name skillport-infrastructure \
  --template-body file://infrastructure/cloudformation.yml \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=Environment,ParameterValue=production
```

### Push Docker Images to ECR
```bash
# Build and push frontend
docker build -t skillport-frontend ./apps/web
docker tag skillport-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-frontend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-frontend:latest

# Build and push backend
docker build -t skillport-backend ./backend
docker tag skillport-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest

# Build and push extension
docker build -t skillport-extension ./apps/extension
docker tag skillport-extension:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-extension:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-extension:latest
```

## 6. CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 7. Security Setup

### IAM Roles
```bash
# Create IAM role for ECS
aws iam create-role --role-name ecsTaskRole --assume-role-policy-document file://trust-policy.json
```

### SSL Configuration
```bash
# Request SSL certificate
aws acm request-certificate --domain-name your-domain.com --validation-method DNS
```

## 8. Monitoring

### CloudWatch Setup
```bash
# Create log groups
aws logs create-log-group --log-group-name /aws/ecs/skillport-backend
aws logs create-log-group --log-group-name /aws/ecs/skillport-frontend
```

## 9. Post-Deployment Verification

### Health Checks
```bash
# Check frontend
curl https://your-domain.com/api/health

# Check backend
curl https://api.your-domain.com/health

# Check database connection
curl https://api.your-domain.com/api/db-status
```

### Smoke Tests
```bash
# Run smoke tests
npm run test:smoke

# Check all endpoints
npm run test:endpoints
```

## 10. Deployment Script

### deploy.sh
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Run tests
echo "🧪 Running tests..."
npm test

# Build applications
echo "🔨 Building applications..."
npm run build:all

# Build Docker images
echo "🐳 Building Docker images..."
docker build -t skillport-web ./apps/web
docker build -t skillport-backend ./backend

# Push to ECR
echo "📤 Pushing to ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-web:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/skillport-backend:latest

# Deploy to ECS
echo "🚀 Deploying to ECS..."
aws ecs update-service --cluster skillport-cluster --service skillport-web --force-new-deployment
aws ecs update-service --cluster skillport-cluster --service skillport-backend --force-new-deployment

echo "✅ Deployment complete!"
```

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Run all tests
npm test && npm run test:integration

# 3. Build for production
npm run build:all

# 4. Test Docker builds
docker-compose up --build

# 5. Deploy to AWS
./deploy.sh
```

This guide provides the essential steps to make your SkillPort Community project production-ready for AWS deployment.
