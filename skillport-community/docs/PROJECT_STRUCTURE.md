# Project Structure - Restructured Architecture

## 📁 SkillPort Community - Monorepo Structure

This document provides a comprehensive overview of the restructured SkillPort Community project architecture, following modern monorepo patterns for scalability and maintainability.

```plaintext
skillport-community/                        → Root monorepo directory
├── 📁 apps/                               → Applications
│   ├── 📁 web/                            → Next.js Web Application
│   │   ├── 📁 app/                        → Next.js App Router
│   │   │   ├── 📁 admin/                  → Admin dashboard pages
│   │   │   ├── 📁 api/                    → API routes (moved to backend/)
│   │   │   ├── 📁 auth/                   → Authentication pages
│   │   │   ├── 📁 mentor/                 → Mentor dashboard pages
│   │   │   ├── 📁 personal/               → Personal dashboard pages
│   │   │   ├── 📁 student/                → Student dashboard pages
│   │   │   ├── globals.css                → Global styles
│   │   │   ├── layout.tsx                 → Root layout
│   │   │   └── page.tsx                   → Home page
│   │   ├── 📁 components/                 → Web-specific components
│   │   ├── 📁 lib/                        → Web-specific utilities
│   │   ├── 📁 public/                     → Static assets
│   │   ├── 📄 Configuration Files
│   │   │   ├── next.config.ts            → Next.js configuration
│   │   │   ├── tailwind.config.js        → Tailwind CSS configuration
│   │   │   ├── tsconfig.json             → TypeScript configuration
│   │   │   ├── package.json              → Web app dependencies
│   │   │   └── middleware.ts              → Next.js middleware
│   │   └── 📄 Sentry Configuration
│   │       ├── sentry.client.config.ts   → Client-side Sentry
│   │       ├── sentry.edge.config.ts     → Edge runtime Sentry
│   │       └── sentry.server.config.ts   → Server-side Sentry
│   │
│   ├── 📁 mobile/                         → Mobile Application (Future)
│   │   └── (React Native / Flutter app)
│   │
│   └── 📁 extension/                      → Browser Extension
│       ├── 📁 popup/                      → Extension popup interface
│       │   ├── popup.css                 → Popup styles
│       │   ├── popup.html                 → Popup HTML
│       │   └── popup.js                   → Popup functionality
│       ├── 📁 public/                     → Extension static assets
│       │   └── icon16.png                 → Extension icon
│       ├── 📁 scripts/                    → Extension scripts
│       │   ├── background.js              → Background service worker
│       │   └── 📁 content/                → Content scripts
│       │       ├── gfg.js                 → GeeksforGeeks integration
│       │       ├── hackerrank.js         → HackerRank integration
│       │       ├── interviewbit.js        → InterviewBit integration
│       │       └── leetcode.js           → LeetCode integration
│       ├── manifest.json                  → Extension manifest
│       ├── package.json                   → Extension dependencies
│       └── server.js                      → Extension server
│
├── 📁 packages/                           → Shared packages
│   ├── 📁 ui/                             → Shared UI components
│   │   ├── 📁 components/                 → Reusable components
│   │   │   ├── 📁 activity/               → Activity components
│   │   │   ├── 📁 analytics/              → Analytics components
│   │   │   ├── 📁 compliance/              → GDPR compliance components
│   │   │   ├── 📁 contest/                → Contest components
│   │   │   ├── 📁 dashboard/              → Dashboard components
│   │   │   ├── 📁 layout/                 → Layout components
│   │   │   ├── 📁 notifications/          → Notification components
│   │   │   ├── 📁 payment/                → Payment components
│   │   │   ├── 📁 tracker/                → Learning tracker components
│   │   │   └── 📁 ui/                     → Base UI components
│   │   ├── index.ts                       → Package exports
│   │   └── package.json                   → UI package dependencies
│   │
│   ├── 📁 utils/                          → Shared utilities
│   │   ├── utils.ts                       → Utility functions
│   │   ├── index.ts                       → Package exports
│   │   └── package.json                   → Utils package dependencies
│   │
│   ├── 📁 types/                          → Shared type definitions
│   │   ├── types.ts                       → TypeScript types
│   │   ├── index.ts                       → Package exports
│   │   └── package.json                   → Types package dependencies
│   │
│   └── 📁 hooks/                          → Shared React hooks
│       ├── useSocket.ts                   → Socket.IO hook
│       ├── index.ts                       → Package exports
│       └── package.json                   → Hooks package dependencies
│
├── 📁 backend/                            → Backend services
│   ├── 📁 api/                            → API route definitions
│   │   ├── 📁 activity/                   → Activity tracking APIs
│   │   ├── 📁 admin/                      → Admin-only API endpoints
│   │   ├── 📁 analytics/                  → Analytics and reporting APIs
│   │   ├── 📁 auth/                       → Authentication APIs
│   │   ├── 📁 communities/                 → Community management APIs
│   │   ├── 📁 contests/                    → Contest management APIs
│   │   ├── 📁 dashboard/                  → Dashboard data APIs
│   │   ├── 📁 extension/                  → Browser extension integration
│   │   ├── 📁 feedbacks/                   → Feedback system APIs
│   │   ├── 📁 health/                      → Health check endpoints
│   │   ├── 📁 mentor/                      → Mentor-specific APIs
│   │   ├── 📁 payment/                    → Payment processing APIs
│   │   ├── 📁 profile/                    → User profile APIs
│   │   ├── 📁 projects/                   → Project management APIs
│   │   ├── 📁 socket/                      → WebSocket connection handling
│   │   ├── 📁 stats/                      → Statistics and analytics APIs
│   │   ├── 📁 subscription/               → Subscription management APIs
│   │   ├── 📁 tasks/                       → Task management APIs
│   │   ├── 📁 test/                        → Testing endpoints
│   │   └── 📁 user/                        → User management APIs
│   │
│   ├── 📁 services/                       → Business logic services
│   │   ├── auth.service.ts                → Authentication service
│   │   ├── contest.service.ts             → Contest management service
│   │   ├── feedback.service.ts            → Feedback system service
│   │   ├── payment.service.ts             → Payment processing service
│   │   ├── user.service.ts                → User management service
│   │   └── notification.service.ts        → Notification service
│   │
│   ├── 📁 models/                         → Database models
│   │   ├── user.model.ts                  → User model
│   │   ├── contest.model.ts               → Contest model
│   │   ├── feedback.model.ts              → Feedback model
│   │   ├── submission.model.ts            → Submission model
│   │   └── activity.model.ts              → Activity model
│   │
│   ├── 📁 middleware/                     → Authentication & authorization
│   │   ├── admin-middleware.ts            → Admin authentication
│   │   ├── mentor-middleware.ts           → Mentor authentication
│   │   ├── student-middleware.ts         → Student authentication
│   │   ├── subscription-middleware.ts     → Subscription validation
│   │   ├── rate-limit.ts                  → Rate limiting
│   │   └── validation.ts                  → Input validation
│   │
│   ├── 📁 jobs/                           → Scheduled jobs
│   │   ├── contest-cleanup.job.ts         → Contest cleanup job
│   │   ├── email-notifications.job.ts     → Email notification job
│   │   └── analytics-aggregation.job.ts   → Analytics aggregation job
│   │
│   ├── 📁 sockets/                        → WebSocket event handlers
│   │   ├── socket.ts                      → Socket.IO server setup
│   │   ├── contest.socket.ts              → Contest WebSocket events
│   │   ├── leaderboard.socket.ts         → Leaderboard WebSocket events
│   │   └── notification.socket.ts         → Notification WebSocket events
│   │
│   ├── 📁 prisma/                         → Database schema & migrations
│   │   ├── schema.prisma                  → Database schema definition
│   │   ├── admin-seed.ts                  → Admin user seeding script
│   │   └── seed.ts                        → Database seeding script
│   │
│   ├── 📁 config/                         → Configuration files
│   │   ├── database.config.ts             → Database configuration
│   │   ├── auth.config.ts                 → Authentication configuration
│   │   ├── email.config.ts                → Email configuration
│   │   ├── payment.config.ts              → Payment configuration
│   │   └── redis.config.ts                → Redis configuration
│   │
│   ├── 📁 utils/                          → Backend utilities
│   │   ├── auth.ts                        → Authentication utilities
│   │   ├── email.ts                       → Email service
│   │   ├── razorpay.ts                    → Razorpay integration
│   │   ├── analytics.ts                    → Analytics utilities
│   │   ├── performance.ts                 → Performance monitoring
│   │   ├── extension-integration.ts       → Extension integration
│   │   └── email-notifications.ts         → Email notification service
│   │
│   ├── index.ts                           → Backend entry point
│   └── package.json                       → Backend dependencies
│
├── 📁 docs/                               → Documentation
│   ├── PROJECT_STRUCTURE.md              → This file
│   ├── MIGRATION_REQUIREMENTS.md         → Production migration guide
│   ├── DEPLOYMENT_CHECKLIST.md           → Deployment steps
│   ├── TESTING_GUIDE.md                  → How to run tests
│   ├── API_DOCUMENTATION.md              → API endpoint documentation
│   ├── ROLE_FLOWS.md                     → User role flows
│   ├── PROJECT_STATUS_REPORT.md          → Project completion status
│   └── CI_CD_DOCUMENTATION.md            → CI/CD pipeline documentation
│
├── 📁 scripts/                            → Development & deployment scripts
│   ├── setup.sh                          → Project setup script
│   ├── build.sh                          → Build script
│   ├── deploy.sh                         → Deployment script
│   ├── test.sh                           → Test runner script
│   └── db-migrate.sh                     → Database migration script
│
├── 📁 tests/                              → Test suites
│   ├── 📁 unit/                           → Unit tests
│   │   ├── 📁 components/                 → Component unit tests
│   │   ├── 📁 pages/                      → Page unit tests
│   │   └── 📁 utils/                      → Utility unit tests
│   ├── 📁 integration/                    → Integration tests
│   │   ├── 📁 api/                        → API integration tests
│   │   ├── 📁 database/                  → Database integration tests
│   │   └── 📁 auth/                       → Authentication integration tests
│   └── 📁 e2e/                           → End-to-end tests
│       ├── 📁 admin/                      → Admin E2E tests
│       ├── 📁 mentor/                      → Mentor E2E tests
│       ├── 📁 student/                    → Student E2E tests
│       └── 📁 extension/                  → Extension E2E tests
│
├── 📁 public/                             → Static assets
│   ├── 📁 images/                         → Images
│   ├── 📁 icons/                          → Icons
│   └── 📁 fonts/                          → Fonts
│
├── 📁 .github/                            → GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── ci-cd.yml                     → Main CI/CD pipeline
│       ├── deploy.yml                    → Deployment automation
│       └── tests.yml                     → Test automation
│
├── 📄 Root Configuration Files
│   ├── package.json                       → Root dependencies and scripts
│   ├── tsconfig.json                      → TypeScript configuration
│   ├── env.example                        → Environment variables template
│   ├── docker-compose.yml                → Docker setup
│   ├── Dockerfile                        → Docker configuration
│   ├── nginx.conf                        → Nginx configuration
│   └── README.md                         → Project overview
│
└── 📄 Legacy Directories (To be removed)
    ├── SKILL-EXTENSION/                   → Legacy browser extension
    └── skillport-community-nextjs/        → Legacy Next.js app
```

## 🏗️ Architecture Overview

### **Monorepo Structure**
- **`apps/`**: Applications (web, mobile, extension)
- **`packages/`**: Shared libraries and utilities
- **`backend/`**: Backend services and APIs
- **`docs/`**: Comprehensive documentation
- **`tests/`**: Organized test suites

### **Shared Packages**
- **`@skillport/ui`**: Reusable UI components
- **`@skillport/utils`**: Utility functions
- **`@skillport/types`**: TypeScript type definitions
- **`@skillport/hooks`**: Custom React hooks

### **Backend Services**
- **API Routes**: RESTful endpoints
- **Services**: Business logic layer
- **Models**: Database models
- **Middleware**: Authentication and validation
- **Jobs**: Scheduled tasks
- **Sockets**: Real-time communication

### **Development & Deployment**
- **Workspaces**: npm workspaces for dependency management
- **CI/CD**: GitHub Actions workflows
- **Docker**: Containerized deployment
- **Testing**: Comprehensive test coverage

## 🎯 Key Benefits

### **Scalability**
- **Monorepo**: Single repository for all components
- **Shared Packages**: Reusable code across applications
- **Modular Backend**: Service-oriented architecture

### **Maintainability**
- **Clear Separation**: Frontend, backend, and shared code
- **Type Safety**: Shared TypeScript types
- **Documentation**: Comprehensive guides and API docs

### **Development Experience**
- **Hot Reload**: Fast development cycles
- **Type Checking**: End-to-end type safety
- **Testing**: Automated test suites

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅  
**Architecture**: Monorepo with Shared Packages
