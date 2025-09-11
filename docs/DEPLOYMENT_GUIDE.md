
# 🚀 SkillPort Production Deployment Guide

## **Overview**
This guide provides step-by-step instructions for deploying SkillPort to production with Firebase backend integration.

## **Prerequisites**

### **Required Tools**
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Google Cloud account with billing enabled

### **Required Accounts**
- Firebase project with Blaze plan (for Functions)
- Google Cloud Platform account
- GitHub account (for CI/CD)

## **Environment Setup**

### **1. Firebase Project Setup**
```bash
# Login to Firebase
firebase login

# Create projects (if not exists)
firebase projects:create skillport-dev
firebase projects:create skillport-staging
firebase projects:create skillport-a0c39

# Set up project aliases
firebase use --add skillport-dev
firebase use --add skillport-staging
firebase use --add skillport-a0c39
```

### **2. Environment Configuration**
```bash
# Copy environment templates
cp .env.example .env
cp .env.example .env.development
cp .env.example .env.production

# Edit with your actual values
nano .env.development
nano .env.production
```

### **3. Service Account Setup**
```bash
# Generate service account keys
firebase projects:list
# Download service account JSON for each project
# Store in secure location (not in repo)
```

## **Local Development**

### **1. Install Dependencies**
```bash
# Root dependencies
npm install

# Functions dependencies
cd functions && npm install && cd ..

# Extension dependencies
cd SKILL-EXTENSION && npm install && cd ..
```

### **2. Start Emulators**
```bash
# Start all emulators
npm run emulator:all

# Or start specific emulators
firebase emulators:start --only functions,firestore,hosting,storage
```

### **3. Run Tests**
```bash
# Run comprehensive tests
npm run test:emulator

# Or run individual tests
./scripts/test-emulator.sh
```

## **Deployment Process**

### **Phase 1: Development Deployment**
```bash
# Deploy to development
firebase use development
firebase deploy --only functions,firestore:rules,firestore:indexes,storage:rules

# Test development environment
curl https://skillport-dev.web.app/api/health
```

### **Phase 2: Staging Deployment**
```bash
# Deploy to staging
firebase use staging
firebase deploy --only functions,firestore:rules,firestore:indexes,storage:rules,hosting

# Test staging environment
curl https://skillport-staging.web.app/api/health
```

### **Phase 3: Production Deployment**
```bash
# Deploy to production
firebase use production
firebase deploy

# Test production environment
curl https://skillport-a0c39.web.app/api/health
```

## **CI/CD Setup**

### **1. GitHub Secrets**
Add these secrets to your GitHub repository:

```
FIREBASE_SERVICE_ACCOUNT_DEVELOPMENT
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PRODUCTION
GITHUB_TOKEN
```

### **2. GitHub Actions**
The deployment workflow is already configured in `.github/workflows/deploy.yml`:

- **Push to `staging` branch**: Deploys to staging
- **Push to `main` branch**: Deploys to production
- **Pull requests**: Runs tests only

### **3. Automated Deployment**
```bash
# Deploy to staging
git checkout staging
git merge feature-branch
git push origin staging

# Deploy to production
git checkout main
git merge staging
git push origin main
```

## **Environment-Specific Configuration**

### **Development Environment**
```env
NODE_ENV=development
FIREBASE_PROJECT_ID=skillport-dev
API_BASE_URL=http://localhost:5001
```

### **Staging Environment**
```env
NODE_ENV=staging
FIREBASE_PROJECT_ID=skillport-staging
API_BASE_URL=https://skillport-staging.web.app/api
```

### **Production Environment**
```env
NODE_ENV=production
FIREBASE_PROJECT_ID=skillport-a0c39
API_BASE_URL=https://skillport-a0c39.web.app/api
```

## **Firebase Functions Configuration**

### **1. Set Environment Variables**
```bash
# For each environment
firebase functions:config:set smtp.user="your-email@gmail.com" smtp.pass="your-app-password"
firebase functions:config:set admin.email="admin@skillport.com"
```

### **2. Deploy Functions**
```bash
# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:api
```

## **Database Setup**

### **1. Firestore Rules**
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### **2. Storage Rules**
```bash
# Deploy storage rules
firebase deploy --only storage:rules
```

## **Monitoring & Maintenance**

### **1. Firebase Console**
- Monitor Functions execution
- Check Firestore usage
- Review Storage usage
- Monitor Authentication

### **2. Google Cloud Console**
- Set up billing alerts
- Monitor resource usage
- Configure logging
- Set up monitoring

### **3. Error Tracking**
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api
```

## **Security Checklist**

### **✅ Pre-Deployment**
- [ ] All secrets moved to environment variables
- [ ] Firestore rules tested and deployed
- [ ] Storage rules tested and deployed
- [ ] CORS configuration verified
- [ ] Rate limiting enabled
- [ ] Input validation implemented

### **✅ Post-Deployment**
- [ ] Authentication flow tested
- [ ] File uploads working
- [ ] API endpoints responding
- [ ] Extension integration tested
- [ ] Real-time updates working
- [ ] Error handling verified

## **Performance Optimization**

### **1. Functions Optimization**
- Enable connection pooling
- Optimize cold starts
- Set appropriate memory limits
- Use regional deployment

### **2. Firestore Optimization**
- Create composite indexes
- Optimize queries
- Use pagination
- Implement caching

### **3. Storage Optimization**
- Compress images
- Use CDN
- Implement lazy loading
- Set appropriate cache headers

## **Backup & Recovery**

### **1. Database Backup**
```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket

# Import Firestore data
gcloud firestore import gs://your-backup-bucket
```

### **2. Functions Backup**
- Functions code is in Git repository
- Environment variables in Firebase config
- Service account keys stored securely

## **Troubleshooting**

### **Common Issues**

#### **Functions Deployment Fails**
```bash
# Check logs
firebase functions:log

# Verify dependencies
cd functions && npm install

# Check Node.js version
node --version
```

#### **Firestore Rules Deployment Fails**
```bash
# Validate rules syntax
firebase firestore:rules:validate

# Test rules locally
firebase emulators:start --only firestore
```

#### **Storage Upload Fails**
```bash
# Check storage rules
firebase storage:rules:validate

# Verify CORS configuration
# Check file size limits
```

### **Support Resources**
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Google Cloud Support: https://cloud.google.com/support

## **Rollback Procedures**

### **1. Functions Rollback**
```bash
# Rollback to previous version
firebase functions:rollback

# Rollback specific function
firebase functions:rollback --only api
```

### **2. Hosting Rollback**
```bash
# Rollback hosting
firebase hosting:rollback

# Rollback to specific version
firebase hosting:rollback --version VERSION_ID
```

### **3. Database Rollback**
```bash
# Restore from backup
gcloud firestore import gs://your-backup-bucket
```

## **Success Metrics**

### **Technical Metrics**
- [ ] 99.9% uptime
- [ ] < 2 second API response time
- [ ] < 5 second function cold start
- [ ] Zero security vulnerabilities

### **Business Metrics**
- [ ] User registration working
- [ ] Community creation working
- [ ] Contest participation working
- [ ] Extension tracking working

## **Next Steps**

1. **Monitor Performance**: Set up alerts and monitoring
2. **Scale Infrastructure**: Add more regions as needed
3. **Add Features**: Implement additional functionality
4. **Optimize Costs**: Review and optimize resource usage
5. **Security Audit**: Regular security reviews

---

## **🎉 Deployment Complete!**

Your SkillPort platform is now production-ready with:
- ✅ Complete Firebase backend
- ✅ Secure authentication
- ✅ Real-time database
- ✅ File storage
- ✅ Chrome extension
- ✅ CI/CD pipeline
- ✅ Multi-environment setup
- ✅ Monitoring and logging

**Live URLs:**
- Development: https://skillport-dev.web.app
- Staging: https://skillport-staging.web.app
- Production: https://skillport-a0c39.web.app
