# 🚀 SkillPort Deployment Runbook

## Prerequisites
- Node.js 18+
- MongoDB 4.4+
- Git
- Docker (optional)

## Quick Start

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/charansai0108/Skill-port.git
cd Skill-port

# Copy environment file
cp backend/config.env.example backend/config.env

# Edit environment variables
nano backend/config.env
```

### 2. Database Setup
```bash
# Start MongoDB
mongod --config /opt/homebrew/etc/mongod.conf

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```

### 4. Frontend Setup
```bash
cd client
python3 -m http.server 8000
```

### 5. Verify Installation
```bash
# Health check
curl http://localhost:5001/health

# Test auth endpoint
curl http://localhost:5001/api/v1/auth/me
```

## Production Deployment

### Using Docker
```bash
# Build image
docker build -t skillport-backend ./backend

# Run container
docker run -d \
  --name skillport-backend \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/skillport \
  -e JWT_SECRET=your_production_secret \
  -e JWT_REFRESH_SECRET=your_refresh_secret \
  skillport-backend
```

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
cd backend
pm2 start server.js --name skillport-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

## Environment Variables

### Required Variables
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillport
JWT_SECRET=your_secure_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### Email Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=skillport24@gmail.com
```

## Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] User registration works
- [ ] Email verification works
- [ ] Login redirects correctly
- [ ] Protected routes require auth
- [ ] Role-based access works
- [ ] Community joining flow works
- [ ] OTP verification works

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:5001 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb
   # Start MongoDB
   brew services start mongodb-community
   ```

3. **JWT Secret Missing**
   ```bash
   # Generate new secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **CORS Issues**
   - Check CORS_ORIGIN in environment
   - Ensure frontend URL matches

## Monitoring

### Health Checks
- Backend: `GET /health`
- Database: Check MongoDB connection
- Email: Test OTP sending

### Logs
```bash
# PM2 logs
pm2 logs skillport-backend

# Docker logs
docker logs skillport-backend
```

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Passwords hashed with bcrypt
- [ ] OTP codes expire and are single-use
- [ ] HttpOnly cookies for tokens

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up Redis for session storage (optional)
- [ ] Configure CDN for static assets
- [ ] Database indexing on frequently queried fields
- [ ] Rate limiting on sensitive endpoints

## Backup & Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --db skillport --out /backup/skillport-$(date +%Y%m%d)

# Restore
mongorestore --db skillport /backup/skillport-20240101/skillport
```

### Application Backup
```bash
# Backup application files
tar -czf skillport-backup-$(date +%Y%m%d).tar.gz /path/to/skillport
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx)
- Multiple backend instances
- Database clustering
- Redis for session sharing

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- Use CDN for static assets
