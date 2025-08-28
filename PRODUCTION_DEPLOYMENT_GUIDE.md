# 🚀 SkillPort Production Deployment Guide

## **Overview**
This guide provides step-by-step instructions for deploying SkillPort to production.

## **Prerequisites**
- Node.js 18+ installed
- MongoDB Atlas account
- Domain name and SSL certificate
- Server/VPS with Ubuntu 20.04+
- PM2 for process management

## **1. Server Setup**

### **1.1 Update System**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx
```

### **1.2 Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **1.3 Install PM2**
```bash
sudo npm install -g pm2
```

## **2. Application Deployment**

### **2.1 Clone Repository**
```bash
cd /var/www
sudo git clone https://github.com/your-username/skillport-community.git
sudo chown -R $USER:$USER skillport-community
cd skillport-community
```

### **2.2 Install Dependencies**
```bash
cd backend
npm install --production
cd ../community-ui
npm install --production
```

### **2.3 Environment Configuration**
Create production environment file:
```bash
cd backend
cp .env .env.production
nano .env.production
```

**Production Environment Variables:**
```env
# Server Configuration
PORT=5001
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REQUEST_TIMEOUT_MS=30000

# Email (Production)
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=SkillPort <noreply@yourdomain.com>

# Frontend
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

## **3. Process Management with PM2**

### **3.1 Create PM2 Configuration**
```bash
cd backend
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'skillport-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10
  }]
};
```

### **3.2 Start Application**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## **4. Nginx Configuration**

### **4.1 Create Nginx Site Configuration**
```bash
sudo nano /etc/nginx/sites-available/skillport
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # API Routes
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:5001;
        access_log off;
    }
    
    # Static Files
    location / {
        root /var/www/skillport-community/community-ui;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Security: Block sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
}
```

### **4.2 Enable Site and Get SSL Certificate**
```bash
sudo ln -s /etc/nginx/sites-available/skillport /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## **5. Database Setup**

### **5.1 MongoDB Atlas Production**
1. Create production cluster
2. Set up network access (0.0.0.0/0 for server IP)
3. Create production database user
4. Update connection string in .env.production

### **5.2 Database Indexes**
```bash
# Connect to MongoDB and create indexes
mongo "mongodb+srv://cluster.mongodb.net/skillport" --username username

# Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.communities.createIndex({ "name": 1 }, { unique: true })
db.contests.createIndex({ "status": 1, "startDate": 1 })
db.posts.createIndex({ "community": 1, "createdAt": -1 })
db.submissions.createIndex({ "user": 1, "problem": 1 })
```

## **6. Monitoring and Logging**

### **6.1 PM2 Monitoring**
```bash
pm2 monit
pm2 logs skillport-api
```

### **6.2 Application Logs**
```bash
tail -f /var/www/skillport-community/backend/logs/production.log
```

### **6.3 Nginx Logs**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## **7. Security Hardening**

### **7.1 Firewall Configuration**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **7.2 Fail2ban Installation**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### **7.3 Regular Security Updates**
```bash
# Add to crontab
0 2 * * 0 sudo apt update && sudo apt upgrade -y
```

## **8. Backup Strategy**

### **8.1 Database Backup**
```bash
# Create backup script
nano /var/www/backup-db.sh
chmod +x /var/www/backup-db.sh
```

**backup-db.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/skillport" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### **8.2 Application Backup**
```bash
# Backup application code
tar -czf /var/backups/app/skillport_$(date +%Y%m%d).tar.gz /var/www/skillport-community
```

## **9. Performance Optimization**

### **9.1 Node.js Optimization**
```bash
# Set Node.js flags in ecosystem.config.js
node_args: '--max-old-space-size=2048 --optimize-for-size'
```

### **9.2 Nginx Optimization**
```bash
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

### **9.3 Database Optimization**
```bash
# MongoDB connection pooling
MONGODB_OPTIONS="maxPoolSize=50&minPoolSize=5&maxIdleTimeMS=30000"
```

## **10. Deployment Checklist**

- [ ] Server updated and secured
- [ ] Node.js and PM2 installed
- [ ] Application deployed and running
- [ ] Nginx configured and SSL enabled
- [ ] Database connected and indexed
- [ ] Environment variables configured
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Security measures applied
- [ ] Performance optimized
- [ ] Domain DNS configured
- [ ] Health checks passing

## **11. Troubleshooting**

### **Common Issues:**
1. **Port already in use**: Check if another service is using port 5001
2. **Permission denied**: Ensure proper file ownership
3. **Database connection failed**: Verify MongoDB Atlas network access
4. **SSL certificate issues**: Check domain DNS and certbot logs

### **Useful Commands:**
```bash
# Check application status
pm2 status
pm2 logs skillport-api

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check server resources
htop
df -h
free -h
```

## **12. Maintenance**

### **Regular Tasks:**
- Monitor application logs
- Check server resources
- Update dependencies monthly
- Review security logs
- Test backup restoration
- Monitor SSL certificate expiration

---

**🎉 Congratulations! Your SkillPort application is now production-ready!**
