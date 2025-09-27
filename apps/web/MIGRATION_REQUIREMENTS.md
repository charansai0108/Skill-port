# MIGRATION REQUIREMENTS

## 1. Database

### ✅ Required Database Type and Version
- **PostgreSQL 13+** with Prisma ORM
- **Redis** (optional, for caching and rate limiting)

### ✅ Setup Instructions
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Create database
sudo -u postgres psql
CREATE DATABASE skillport_db;
CREATE USER skillport_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE skillport_db TO skillport_user;
\q
```

### ✅ Migration Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations (if using migrate instead of push)
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Create admin user
npm run db:seed:admin

# Open Prisma Studio (optional)
npm run db:studio
```

### ✅ Seed Data
- **Admin User**: `admin@skillport.com` / `admin123`
- **Test User**: `test@example.com` / `hashedpassword123`
- **Sample Communities**: Algorithm Masters, Web Dev Hub
- **Sample Contests**: Weekly Challenge, Monthly Contest
- **Sample Batches**: Batch 2024

### ⚠️ Redis Setup (Optional)
```bash
# Install Redis
sudo apt install redis-server  # Ubuntu/Debian
brew install redis             # macOS

# Start Redis
sudo systemctl start redis-server  # Ubuntu/Debian
brew services start redis          # macOS

# Test connection
redis-cli ping
```

---

## 2. Environment Variables

### ✅ Required Environment Variables

| Variable | Purpose | Where to Obtain | Example |
|----------|---------|-----------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Database setup | `postgresql://user:pass@localhost:5432/skillport_db` |
| `JWT_SECRET` | JWT token signing secret | Generate secure random string | `your-super-secure-jwt-secret-key-here-min-32-chars` |
| `JWT_EXPIRES_IN` | JWT token expiration | Configuration | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | Configuration | `7d` |
| `EMAIL_HOST` | SMTP server hostname | Email provider | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | Email provider | `587` |
| `EMAIL_USER` | SMTP username | Email provider | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP app password | Gmail App Passwords | `your-app-password` |
| `EMAIL_FROM` | From email address | Email provider | `noreply@skillport.com` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | Deployment | `https://skillport.com` |
| `NEXT_PUBLIC_API_URL` | API URL | Deployment | `https://skillport.com/api` |
| `RAZORPAY_KEY_ID` | Razorpay public key | Razorpay Dashboard | `rzp_test_xxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Razorpay Dashboard | `your-razorpay-secret-key` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (frontend) | Razorpay Dashboard | `rzp_test_xxxxxxxxxxxxx` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics property ID | Google Analytics | `G-XXXXXXXXXX` |
| `SENTRY_DSN` | Sentry project DSN | Sentry Dashboard | `https://xxx@sentry.io/xxx` |
| `SENTRY_ORG` | Sentry organization | Sentry Dashboard | `your-sentry-org` |
| `SENTRY_PROJECT` | Sentry project name | Sentry Dashboard | `skillport-web` |
| `RATE_LIMIT_MAX` | Rate limit requests per window | Configuration | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | Configuration | `900000` |
| `NEXTAUTH_SECRET` | NextAuth secret | Generate secure random string | `your-nextauth-secret` |
| `NEXTAUTH_URL` | NextAuth URL | Deployment | `https://skillport.com` |
| `MAX_FILE_SIZE` | Maximum file upload size | Configuration | `5242880` |
| `ALLOWED_FILE_TYPES` | Allowed file types for upload | Configuration | `image/jpeg,image/png,image/gif,application/pdf` |
| `REDIS_URL` | Redis connection string | Redis setup | `redis://localhost:6379` |

### ⚠️ Environment Variable Setup
1. Copy `env.example` to `.env.local` (development) or `.env.production` (production)
2. Fill in all required values
3. Ensure `.env*` files are in `.gitignore`
4. Set environment variables in your hosting platform

---

## 3. External Services

### ✅ Payments: Razorpay
**Setup Required:**
1. Create Razorpay account at https://razorpay.com
2. Get API keys from Razorpay Dashboard → Settings → API Keys
3. Configure webhook URL: `https://yourdomain.com/api/payment/webhook`
4. Enable webhook events: `payment.captured`, `subscription.activated`, `subscription.cancelled`

**Webhook Configuration:**
- URL: `https://yourdomain.com/api/payment/webhook`
- Events: `payment.captured`, `subscription.activated`, `subscription.cancelled`
- Secret: Use same as `RAZORPAY_KEY_SECRET`

### ✅ Email: SMTP/Nodemailer
**Gmail Setup (Recommended):**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Gmail → Security → App passwords
3. Use App Password as `EMAIL_PASS`

**Other SMTP Providers:**
- **SendGrid**: Get API key from SendGrid dashboard
- **Mailgun**: Get SMTP credentials from Mailgun dashboard
- **AWS SES**: Configure SMTP credentials in AWS console

### ✅ Analytics: Google Analytics 4
**Setup Required:**
1. Create Google Analytics account at https://analytics.google.com
2. Create GA4 property for your website
3. Get Measurement ID (format: G-XXXXXXXXXX)
4. Add to `NEXT_PUBLIC_GA_ID` environment variable

### ✅ Monitoring: Sentry
**Setup Required:**
1. Create Sentry account at https://sentry.io
2. Create new project for "Next.js"
3. Get DSN from project settings
4. Configure organization and project names

### ✅ Browser Extension (Optional)
**Extension Integration:**
- Extension communicates with `/api/extension/sync` endpoint
- No additional setup required for extension integration
- Extension data is stored in database automatically

---

## 4. Deployment Infrastructure

### ✅ Required Node.js Version
- **Node.js 18.17+** (required for Next.js 15)
- **npm 9+** or **yarn 1.22+**

### ✅ Build and Run Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm run start

# Database operations
npm run db:generate
npm run db:push
npm run db:seed
npm run db:seed:admin
```

### ✅ Hosting Requirements
- **Next.js 15** compatible hosting
- **PostgreSQL** database access
- **Redis** (optional, for caching)
- **Environment variables** support
- **File upload** support (for avatars)

**Recommended Platforms:**
- **Vercel** (easiest for Next.js)
- **Railway** (includes PostgreSQL)
- **DigitalOcean App Platform**
- **AWS Amplify**
- **Docker** deployment

### ✅ CI/CD Considerations
```yaml
# Example GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run db:generate
      - run: npm run db:push
      - run: npm run db:seed:admin
```

### ✅ Static Asset Handling
- **Next.js** handles static assets automatically
- **CDN** recommended for production (Vercel, Cloudflare)
- **Image optimization** built into Next.js
- **File uploads** stored in database or cloud storage

### ✅ Backup & Restore Strategy
```bash
# Database backup
pg_dump skillport_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Database restore
psql skillport_db < backup_file.sql

# Automated backup (cron job)
0 2 * * * pg_dump skillport_db | gzip > /backups/skillport_$(date +\%Y\%m\%d).sql.gz
```

---

## 5. GDPR & Legal Compliance

### ⚠️ Cookie Consent Text (Must be Supplied)
**Required Legal Text:**
- Cookie consent banner text
- Privacy policy content
- Terms of service
- Data processing agreements
- User rights explanations

**Current Implementation:**
- Cookie consent component exists but needs legal review
- Privacy policy page template exists
- Data export/deletion functionality implemented

### ⚠️ Privacy Policy and Terms of Service
**Required Legal Documents:**
1. **Privacy Policy** - Data collection, usage, sharing
2. **Terms of Service** - User agreements, limitations
3. **Cookie Policy** - Cookie usage and management
4. **Data Processing Agreement** - GDPR compliance

**TODO:** Legal review and customization required

### ⚠️ User Rights Handling
**Operational Process Required:**
- **Data Export**: Automated via `/api/user/data-export`
- **Account Deletion**: 30-day grace period via `/api/user/delete-account`
- **Consent Management**: Via `/api/user/consent`
- **Data Retention**: Policy implementation needed

---

## 6. Manual Setup Tasks

### ✅ Configure Razorpay Webhooks
1. Login to Razorpay Dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
4. Select events: `payment.captured`, `subscription.activated`, `subscription.cancelled`
5. Copy webhook secret (use as `RAZORPAY_KEY_SECRET`)

### ✅ Create Gmail/SMTP App Password
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate new app password for "Mail"
4. Use as `EMAIL_PASS` environment variable

### ✅ Add Google Analytics Property
1. Create Google Analytics account
2. Create GA4 property
3. Get Measurement ID (G-XXXXXXXXXX)
4. Add to `NEXT_PUBLIC_GA_ID` environment variable
5. Verify tracking works

### ✅ Configure Sentry Project
1. Create Sentry account
2. Create new project (Next.js)
3. Get DSN from project settings
4. Add to environment variables
5. Test error reporting

### ✅ One-time Database Setup Commands
```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema to database
npm run db:push

# 3. Seed with demo data
npm run db:seed

# 4. Create admin user
npm run db:seed:admin

# 5. Verify database connection
npm run db:studio
```

---

## 7. Migration Checklist

### ✅ Step-by-Step Migration Checklist

1. **✅ Provision PostgreSQL Database**
   - Install PostgreSQL 13+
   - Create database: `skillport_db`
   - Create user with permissions
   - Test connection

2. **✅ Set DATABASE_URL**
   - Add to `.env.production`
   - Format: `postgresql://user:pass@host:port/dbname`
   - Test connection

3. **✅ Run Prisma Migrations**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **✅ Run Database Seeding**
   ```bash
   npm run db:seed
   npm run db:seed:admin
   ```

5. **✅ Setup Razorpay Keys + Webhook**
   - Get API keys from Razorpay Dashboard
   - Configure webhook URL
   - Test payment flow

6. **✅ Configure SMTP Provider**
   - Setup Gmail App Password or other SMTP
   - Test email sending
   - Verify email templates

7. **✅ Add Google Analytics Property ID**
   - Create GA4 property
   - Get Measurement ID
   - Add to environment variables
   - Test tracking

8. **✅ Configure Sentry DSN**
   - Create Sentry project
   - Get DSN
   - Add to environment variables
   - Test error reporting

9. **✅ Add All Environment Variables**
   - Copy from `env.example`
   - Fill in all required values
   - Verify all services work

10. **✅ Deploy Application**
    - Choose hosting platform
    - Configure environment variables
    - Deploy application
    - Verify deployment

11. **✅ Run Smoke Tests**
    - Test user registration
    - Test email verification
    - Test login/logout
    - Test payment flow
    - Test extension data sync
    - Test admin dashboard
    - Test all role-based features

### ⚠️ Post-Deployment Verification

**Critical Tests:**
- [ ] User registration and email verification
- [ ] Login/logout for all roles
- [ ] Payment processing (test mode)
- [ ] Email sending (verification, password reset)
- [ ] Database operations (CRUD)
- [ ] File uploads (avatars)
- [ ] Real-time features (WebSocket)
- [ ] Extension data sync
- [ ] Analytics tracking
- [ ] Error monitoring (Sentry)
- [ ] GDPR compliance features

**Performance Tests:**
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] File upload performance
- [ ] Real-time update latency

**Security Tests:**
- [ ] Authentication/authorization
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers

---

## 8. Known Issues & TODOs

### ❌ Missing Implementations
- **Push Notifications**: Not implemented
- **SMS Integration**: Not implemented
- **Advanced Analytics**: Basic implementation only
- **Mobile App**: Not developed

### ⚠️ Partial Implementations
- **Email Templates**: Basic templates, needs customization
- **Error Monitoring**: Sentry configured but needs fine-tuning
- **Rate Limiting**: Basic implementation, needs optimization
- **Legal Documents**: Templates exist, need legal review

### 🔧 Configuration Required
- **Environment Variables**: All must be set manually
- **Database Setup**: Requires manual PostgreSQL setup
- **External Services**: All require manual account setup
- **Legal Compliance**: Requires legal review and customization

---

## 9. Production Readiness Status

### ✅ Ready for Production
- **Core Features**: All implemented and tested
- **Authentication**: JWT-based with email verification
- **Database**: Prisma ORM with PostgreSQL
- **Payments**: Razorpay integration complete
- **Real-time**: WebSocket implementation
- **Analytics**: Google Analytics 4 integration
- **Monitoring**: Sentry error tracking
- **GDPR**: Basic compliance features

### ⚠️ Requires Manual Setup
- **Environment Variables**: Must be configured
- **External Services**: Must be set up manually
- **Database**: Must be provisioned and seeded
- **Legal Documents**: Must be reviewed and customized
- **Deployment**: Must be configured for hosting platform

### 🎯 Next Steps
1. **Immediate**: Set up environment variables and external services
2. **Short-term**: Deploy to staging environment for testing
3. **Medium-term**: Legal review and document customization
4. **Long-term**: Mobile app development and advanced features

---

**Document Version**: 2.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready with Manual Setup Required ✅
