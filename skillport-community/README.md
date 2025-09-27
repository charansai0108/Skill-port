# SkillPort Community - Monorepo Architecture

## 🚀 Overview

SkillPort Community is a comprehensive learning platform with multi-role architecture, featuring contest management, mentorship, real-time collaboration, and browser extension integration. The project has been restructured into a modern monorepo architecture for better scalability and maintainability.

## 🏗️ Architecture

### **Monorepo Structure**
```
skillport-community/
├── apps/                    # Applications
│   ├── web/                # Next.js Web Application
│   ├── mobile/             # Future Mobile App
│   └── extension/          # Browser Extension
├── packages/               # Shared Packages
│   ├── ui/                 # UI Components
│   ├── utils/              # Utilities
│   ├── types/              # TypeScript Types
│   └── hooks/              # React Hooks
├── backend/                # Backend Services
│   ├── api/                # API Routes
│   ├── services/           # Business Logic
│   ├── models/             # Database Models
│   ├── middleware/         # Auth & Validation
│   ├── jobs/               # Scheduled Jobs
│   ├── sockets/            # WebSocket Handlers
│   ├── prisma/             # Database Schema
│   ├── config/             # Configuration
│   └── utils/              # Backend Utilities
├── docs/                   # Documentation
├── scripts/                # Development Scripts
├── tests/                  # Test Suites
└── public/                 # Static Assets
```

## 🎯 Key Features

### **Multi-Role Architecture**
- **Admin**: System management and analytics
- **Mentor**: Contest management and student guidance
- **Student**: Learning and contest participation
- **Personal**: Individual learning tracking

### **Core Features**
- **Contest Management**: Create, manage, and participate in coding contests
- **Real-Time Collaboration**: Live leaderboards, chat, and notifications
- **Browser Extension**: Track submissions on LeetCode, HackerRank, GeeksforGeeks, InterviewBit
- **Payment Integration**: Razorpay subscription management
- **Analytics**: Comprehensive usage tracking and reporting
- **GDPR Compliance**: Data privacy and consent management

### **Technical Features**
- **Monorepo**: Single repository for all components
- **Shared Packages**: Reusable code across applications
- **Type Safety**: End-to-end TypeScript
- **Real-Time**: WebSocket integration
- **Security**: JWT authentication, rate limiting, input validation
- **Testing**: Unit, integration, and E2E tests
- **CI/CD**: Automated testing and deployment

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14 or higher
- Redis (optional, for caching)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/charansai0108/Skill-port.git
   cd skillport-community
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Start web application
   npm run dev
   
   # Start backend API (in another terminal)
   npm run backend:dev
   ```

6. **Access the application**
   - Web App: http://localhost:3000
   - API: http://localhost:8000
   - Database Studio: http://localhost:5555

## 📚 Documentation

### **Comprehensive Guides**
- [**Project Structure**](docs/PROJECT_STRUCTURE.md) - Complete architecture overview
- [**Migration Requirements**](docs/MIGRATION_REQUIREMENTS.md) - Production setup guide
- [**Deployment Checklist**](docs/DEPLOYMENT_CHECKLIST.md) - Deployment steps
- [**Testing Guide**](docs/TESTING_GUIDE.md) - How to run tests
- [**API Documentation**](docs/API_DOCUMENTATION.md) - Complete API reference
- [**Role Flows**](docs/ROLE_FLOWS.md) - User role workflows

### **API Documentation**
- **Authentication**: JWT-based authentication
- **Contests**: Contest management and participation
- **Feedback**: Mentorship and feedback system
- **Payments**: Razorpay integration
- **Analytics**: Usage tracking and reporting
- **Extension**: Browser extension integration

## 🧪 Testing

### **Run Tests**
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests

# Run with coverage
npm run test:coverage
```

### **Test Coverage**
- **Unit Tests**: >90% coverage
- **Integration Tests**: >80% coverage
- **E2E Tests**: Critical user flows covered

## 🚀 Deployment

### **Production Deployment**
```bash
# Build all applications
npm run build

# Deploy with Docker
docker-compose up -d

# Or deploy to cloud platforms
npm run deploy:vercel
npm run deploy:aws
```

### **Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/skillport"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Payment
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
SENTRY_DSN="your-sentry-dsn"
```

## 🔧 Development

### **Available Scripts**
```bash
# Development
npm run dev                 # Start web app
npm run backend:dev        # Start backend API
npm run extension:dev      # Start extension development

# Building
npm run build              # Build web app
npm run extension:build    # Build extension
npm run backend:build      # Build backend

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema changes
npm run db:migrate        # Run migrations
npm run db:seed           # Seed database
npm run db:studio         # Open Prisma Studio

# Testing
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Linting
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript check
```

### **Package Management**
```bash
# Install dependencies for all workspaces
npm run install:all

# Add dependency to specific workspace
npm install package-name --workspace=apps/web
npm install package-name --workspace=packages/ui

# Run command in specific workspace
npm run dev --workspace=apps/web
npm run build --workspace=packages/ui
```

## 🌐 Browser Extension

### **Installation**
1. Build the extension:
   ```bash
   npm run extension:build
   ```

2. Load in browser:
   - Chrome: Extensions → Developer mode → Load unpacked
   - Firefox: about:debugging → This Firefox → Load Temporary Add-on

### **Supported Platforms**
- **LeetCode**: Problem tracking and submission sync
- **HackerRank**: Challenge participation tracking
- **GeeksforGeeks**: Practice problem tracking
- **InterviewBit**: Interview preparation tracking

## 🔒 Security

### **Security Features**
- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Data Encryption**: Sensitive data encryption at rest
- **GDPR Compliance**: Data privacy and consent management

### **Security Best Practices**
- Environment variables for secrets
- HTTPS enforcement in production
- Regular security audits
- Dependency vulnerability scanning
- Secure coding practices

## 📊 Monitoring

### **Application Monitoring**
- **Error Tracking**: Sentry integration
- **Performance**: Web Vitals monitoring
- **Analytics**: Google Analytics 4
- **Uptime**: Health check endpoints
- **Logs**: Structured logging with Winston

### **Health Checks**
```bash
# Application health
curl https://skillport.com/api/health

# Database health
curl https://api.skillport.com/health
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- Conventional commits for git messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@skillport.com

### **Common Issues**
- **Database Connection**: Check DATABASE_URL
- **Authentication**: Verify JWT_SECRET
- **Build Errors**: Check Node.js version
- **Extension Issues**: Check browser permissions

## 🎯 Roadmap

### **Phase 1: Core Features** ✅
- [x] Multi-role architecture
- [x] Contest management
- [x] Real-time collaboration
- [x] Browser extension
- [x] Payment integration

### **Phase 2: Advanced Features** 🔄
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Video call integration
- [ ] Advanced contest features

### **Phase 3: Enterprise Features** 📋
- [ ] Enterprise dashboard
- [ ] Advanced reporting
- [ ] Custom branding
- [ ] SSO integration
- [ ] Advanced security

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅  
**Architecture**: Monorepo with Shared Packages

## 🏆 Acknowledgments

- **Contributors**: All developers who contributed to this project
- **Community**: Users who provided feedback and suggestions
- **Open Source**: Libraries and frameworks that made this possible
- **Mentors**: Industry experts who guided the development

---

**Built with ❤️ by the SkillPort Community Team**
