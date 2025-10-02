# SkillPort Community - Full Stack Learning Platform

A modern, responsive learning platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. Features role-based access control, community management, and dynamic content loading.

## 🚀 Features

- **Modern UI/UX** - Glass-morphism design with smooth animations
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Role-based Access** - Admin, Mentor, Student, and Personal user roles
- **Authentication** - JWT-based auth with OTP verification
- **Community Management** - Multi-tenant community system
- **Dynamic Dashboards** - Role-specific dashboards with real-time data
- **Database Integration** - PostgreSQL with Prisma ORM
- **TypeScript** - Full type safety and better developer experience

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **SQLite** - Development database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Prisma Studio** - Database GUI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js (Required)
- **Version**: Node.js 18.17.0 or higher
- **Download**: [https://nodejs.org/](https://nodejs.org/)
- **Verify Installation**:
  ```bash
  node --version
  npm --version
  ```

### 2. Database (Choose One)

#### Option A: PostgreSQL (Production)
- **Version**: PostgreSQL 14 or higher
- **Download**: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- **Alternative**: Use a cloud service like [Supabase](https://supabase.com/) or [Railway](https://railway.app/)

#### Option B: SQLite (Development - Easier Setup)
- **Included**: SQLite comes with Node.js
- **No additional installation required**

### 3. Git (Optional but Recommended)
- **Download**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

## 🚀 Quick Start Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/charansai0108/Skill-port.git

# Navigate to the project directory
cd Skill-port
```

### Step 2: Install Node.js Dependencies

```bash
# Install root dependencies
npm install

# Navigate to the web app directory
cd apps/web

# Install web app dependencies
npm install
```

### Step 3: Environment Setup

```bash
# Copy the environment template
cp .env.example .env

# Edit the environment file
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="file:./dev.db"  # For SQLite (development)
# DATABASE_URL="postgresql://username:password@localhost:5432/skillport"  # For PostgreSQL

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (for OTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### Step 4: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### Step 5: Start the Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

## 📁 Project Structure

```
skillport-community/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── mentor/        # Mentor dashboard
│   │   │   ├── student/       # Student dashboard
│   │   │   ├── personal/      # Personal user pages
│   │   │   ├── community/     # Community pages
│   │   │   └── api/           # API routes
│   │   ├── components/        # React components
│   │   ├── lib/              # Utility functions
│   │   ├── prisma/           # Database schema and migrations
│   │   └── public/           # Static assets
│   └── extension/            # Browser extension
├── backend/                   # Backend API (if separate)
├── packages/                 # Shared packages
└── docs/                    # Documentation
```

## 🔑 Demo Credentials

### Test Users
- **Admin**: `admin@skillport.com` / `admin123`
- **Mentor**: `mentor@skillport.com` / `password123`
- **Student**: `student@skillport.com` / `password123`
- **Personal**: `personal@skillport.com` / `password123`

### OTP Verification
- **Demo OTP Code**: `123456` (works for any email during development)

## 🌐 Available Pages

### Authentication
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/verify-otp` - Email verification

### Admin Dashboard
- `/admin/dashboard` - Main admin dashboard
- `/community/[slug]/dashboard` - Community-specific admin dashboard
- `/community/[slug]/students` - Student management
- `/community/[slug]/mentors` - Mentor management
- `/community/[slug]/contests` - Contest management
- `/community/[slug]/analytics` - Analytics and reports
- `/community/[slug]/leaderboard` - Community leaderboard
- `/community/[slug]/profile` - Admin profile

### Mentor Dashboard
- `/community/[slug]/mentor/dashboard` - Mentor dashboard
- `/community/[slug]/mentor/profile` - Mentor profile
- `/community/[slug]/mentor/contests` - Contest management
- `/community/[slug]/mentor/feedback` - Student feedback
- `/community/[slug]/mentor/leaderboard` - Mentor leaderboard

### Student/User Dashboard
- `/community/[slug]/user/dashboard` - User dashboard
- `/community/[slug]/user/profile` - User profile
- `/community/[slug]/user/contests` - Contest participation
- `/community/[slug]/user/leaderboard` - User leaderboard
- `/personal/dashboard` - Personal dashboard (community-agnostic)
- `/personal/profile` - Personal profile
- `/personal/stats` - Personal statistics
- `/personal/projects` - Personal projects

## 🛠️ Development Commands

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# Database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed database with sample data
npx prisma db push       # Push schema changes to database

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## 🗄️ Database Management

### Using Prisma Studio
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# This will open a web interface at http://localhost:5555
# where you can view and edit your database data
```

### Database Schema
The database schema is defined in `apps/web/prisma/schema.prisma`. Key models include:
- **User** - User accounts with roles
- **Community** - Learning communities
- **Batch** - Student batches within communities
- **Contest** - Programming contests
- **Submission** - Contest submissions
- **ActivityLog** - User activity tracking

### Adding New Data
```bash
# Create a new migration
npx prisma migrate dev --name your-migration-name

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset
```

## 🚀 Deployment

### Environment Variables for Production

```env
# Database (Production)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (Generate a strong secret)
JWT_SECRET="your-production-jwt-secret"

# Email Configuration
EMAIL_HOST="your-smtp-host"
EMAIL_PORT=587
EMAIL_USER="your-email@domain.com"
EMAIL_PASS="your-email-password"

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Optional: Sentry for error tracking
SENTRY_DSN="your-sentry-dsn"
```

### Deployment Platforms

#### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

#### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Deploy with one click

#### Docker
```bash
# Build Docker image
docker build -t skillport-community .

# Run container
docker run -p 3000:3000 skillport-community
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version is too old, update Node.js
# Download from https://nodejs.org/
```

#### 2. Database Connection Issues
```bash
# Check if database is running
# For PostgreSQL: Check if service is running
# For SQLite: Check if file exists

# Reset database
npx prisma migrate reset
```

#### 3. Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use yarn
yarn install
```

#### 4. Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma client
npx prisma db push
```

### Getting Help

1. **Check the logs**: Look at the terminal output for error messages
2. **Check the database**: Use `npx prisma studio` to inspect data
3. **Check environment variables**: Ensure all required variables are set
4. **Check Node.js version**: Ensure you're using Node.js 18.17.0 or higher

## 📚 Additional Resources

### Node.js Resources
- [Node.js Official Website](https://nodejs.org/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Course](https://nextjs.org/learn)

### Prisma Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Studio](https://www.prisma.io/studio)

### Database Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@skillport.com
- **GitHub Issues**: [Create an issue](https://github.com/charansai0108/Skill-port/issues)
- **Documentation**: Check the `/docs` folder for detailed guides

---

**Built with ❤️ using Next.js 15, TypeScript, Prisma, and PostgreSQL**

## 🎯 Quick Reference

### Essential Commands
```bash
# Start development
cd apps/web && npm run dev

# Database operations
npx prisma studio
npx prisma migrate dev
npx prisma db seed

# Build and deploy
npm run build
npm run start
```

### Important URLs
- **Application**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Community Dashboard**: http://localhost:3000/community/[slug]/dashboard