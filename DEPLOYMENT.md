# 🚀 SkillPort Community Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **CRITICAL FIXES COMPLETED**
- [x] **Duplicate Files Removed** - Consolidated community pages
- [x] **Routing Fixed** - All redirects now use correct paths
- [x] **Authentication Fixed** - Role-based redirects working
- [x] **Security Enhanced** - JWT, CSRF, rate limiting implemented
- [x] **Database Sessions** - Moved from localStorage to database
- [x] **Production Config** - Environment variables secured
- [x] **Health Checks** - Monitoring endpoints added
- [x] **Deployment Scripts** - Automated deployment ready

## 🏗️ Architecture Overview

```
SkillPort Community Platform
├── Frontend (Vanilla JS + Tailwind CSS)
│   ├── Public Pages (index, login, register, community)
│   ├── Personal Dashboard (skillport-personal/)
│   ├── Admin Dashboard (pages/admin/)
│   ├── Mentor Dashboard (pages/mentor/)
│   └── Student Dashboard (pages/user/)
├── Backend (Node.js + Express + MongoDB)
│   ├── Authentication & Authorization
│   ├── Role-based Access Control
│   ├── Database Session Management
│   ├── Email Service (Gmail SMTP)
│   └── File Upload System
└── Database (MongoDB)
    ├── Users (personal, community-admin, mentor, student)
    ├── Communities
    ├── Contests
    └── Sessions
```

## 🔧 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 6.0+
- Gmail account for email service

### 1. Clone and Setup
```bash
git clone <your-repo>
cd skillport-community
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Go back to root
cd ..
```

### 3. Configure Environment
```bash
# Copy production config
cp backend/config.env.production backend/config.env

# Edit with your values
nano backend/config.env
```

**Required Environment Variables:**
```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/skillport_community
JWT_SECRET=your-strong-jwt-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGIN=https://yourdomain.com
```

### 4. Start Services
```bash
# Start MongoDB
mongod

# Start the application
cd backend
npm start
```

### 5. Access the Platform
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5001/api/v1
- **Health Check**: http://localhost:5001/api/v1/health

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Update environment variables
cp backend/config.env.production backend/config.env

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Docker Build
```bash
# Build image
docker build -t skillport-community .

# Run container
docker run -p 5001:5001 --env-file backend/config.env skillport-community
```

## 🌐 Production Deployment

### Option 1: VPS/Cloud Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd skillport-community
   
   # Install dependencies
   cd backend && npm install --production
   
   # Configure environment
   cp config.env.production config.env
   # Edit config.env with production values
   
   # Start application
   npm start
   ```

3. **Setup Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           root /path/to/skillport-community/client;
           index index.html;
           try_files $uri $uri/ =404;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Platform-as-a-Service

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create skillport-community

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb://your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 🔒 Security Configuration

### 1. Environment Security
```bash
# Set proper file permissions
chmod 600 backend/config.env
chmod 755 backend/uploads

# Create non-root user
sudo useradd -m -s /bin/bash skillport
sudo chown -R skillport:skillport /path/to/skillport-community
```

### 2. Database Security
```javascript
// Enable MongoDB authentication
use admin
db.createUser({
  user: "skillport_admin",
  pwd: "strong_password_here",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### 3. SSL/HTTPS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Checks
- **Basic**: `GET /api/v1/health`
- **Detailed**: `GET /api/v1/health/detailed` (Admin only)

### Logging
```bash
# View application logs
tail -f backend/logs/app.log

# View error logs
tail -f backend/logs/error.log
```

### Database Maintenance
```bash
# Backup database
mongodump --db skillport_community --out /backup/$(date +%Y%m%d)

# Restore database
mongorestore --db skillport_community /backup/20240101/skillport_community
```

## 🧪 Testing

### Run Flow Tests
```bash
# Install test dependencies
npm install axios colors

# Run comprehensive tests
node test-flows.js
```

### Manual Testing Checklist
- [ ] Personal user registration and login
- [ ] Community admin registration and login
- [ ] Mentor creation by admin
- [ ] Student joining community
- [ ] Contest creation and management
- [ ] File upload functionality
- [ ] Email service (OTP sending)
- [ ] Role-based access control
- [ ] Session management
- [ ] Database operations

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Email Service Not Working**
   ```bash
   # Check Gmail app password
   # Enable 2FA on Gmail
   # Generate app-specific password
   ```

3. **CORS Errors**
   ```bash
   # Update CORS_ORIGIN in config.env
   # Include your frontend domain
   ```

4. **File Upload Issues**
   ```bash
   # Check uploads directory permissions
   chmod 755 backend/uploads
   ```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm start
```

## 📈 Performance Optimization

### 1. Database Indexing
```javascript
// Add indexes for better performance
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "role": 1 })
db.communities.createIndex({ "code": 1 })
db.contests.createIndex({ "community": 1, "status": 1 })
```

### 2. Caching
```bash
# Install Redis for session storage
sudo apt install redis-server

# Update environment
REDIS_URL=redis://localhost:6379
```

### 3. CDN Setup
- Use CloudFlare or AWS CloudFront
- Serve static assets from CDN
- Enable gzip compression

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      - run: docker build -t skillport-community .
      - run: docker push your-registry/skillport-community
```

## 📞 Support

### Getting Help
1. Check the logs: `backend/logs/`
2. Run health checks: `/api/v1/health`
3. Review this documentation
4. Check GitHub issues

### Emergency Contacts
- **Technical Issues**: [Your technical contact]
- **Security Issues**: [Your security contact]
- **Database Issues**: [Your DBA contact]

---

## 🎉 **DEPLOYMENT READY!**

Your SkillPort Community Platform is now fully prepared for production deployment with:
- ✅ **Security**: JWT, CSRF, rate limiting, secure sessions
- ✅ **Scalability**: Database sessions, health checks, monitoring
- ✅ **Reliability**: Error handling, logging, automated testing
- ✅ **Maintainability**: Clean code, documentation, deployment scripts

**Next Steps:**
1. Update production environment variables
2. Deploy to your chosen platform
3. Run the test suite
4. Monitor health checks
5. Set up monitoring and alerts

**Happy Deploying! 🚀**
