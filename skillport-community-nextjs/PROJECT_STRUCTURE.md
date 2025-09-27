# Project Structure

## 📁 SkillPort Community - Complete Project Structure

This document provides a comprehensive overview of the SkillPort Community project structure, including all directories, files, and their purposes.

```plaintext
skillport-community/                        → Root project directory
├── 📁 .github/                            → GitHub Actions CI/CD workflows (Root)
│   └── workflows/
│       ├── ci-cd.yml                      → Main CI/CD pipeline
│       ├── deploy.yml                     → Deployment automation
│       └── tests.yml                      → Test automation
│
├── 📁 .vscode/                            → VS Code workspace settings
│   └── settings.json                      → VS Code configuration
│
├── 📁 SKILL-EXTENSION/                    → Browser Extension (Legacy)
│   ├── 📁 background/                     → Extension background scripts
│   │   └── background.js                  → Background service worker
│   ├── 📁 content_scripts/               → Content scripts for platforms
│   │   ├── gfg.js                         → GeeksforGeeks integration
│   │   ├── hackerrank.js                  → HackerRank integration
│   │   ├── interviewbit.js                → InterviewBit integration
│   │   └── leetcode.js                    → LeetCode integration
│   ├── 📁 popup/                         → Extension popup interface
│   ├── manifest.json                      → Extension manifest
│   ├── package.json                       → Extension dependencies
│   ├── package-lock.json                  → Dependency lock file
│   └── server.js                          → Extension server
│
├── 📁 SKILL-EXTENSION-NEW/                → Browser Extension (Updated)
│   ├── 📁 popup/                          → Extension popup interface
│   │   ├── popup.css                      → Popup styles
│   │   ├── popup.html                     → Popup HTML
│   │   └── popup.js                       → Popup functionality
│   ├── 📁 public/                         → Extension static assets
│   │   └── icon16.png                     → Extension icon
│   ├── 📁 scripts/                        → Extension scripts
│   │   ├── background.js                  → Background service worker
│   │   └── 📁 content/                    → Content scripts
│   │       ├── gfg.js                     → GeeksforGeeks integration
│   │       ├── hackerrank.js              → HackerRank integration
│   │       ├── interviewbit.js            → InterviewBit integration
│   │       └── leetcode.js                → LeetCode integration
│   ├── manifest.json                      → Extension manifest
│   ├── package.json                       → Extension dependencies
│   └── server.js                          → Extension server
│
├── 📁 skillport-community-nextjs/        → Main Next.js Application
├── 📁 .github/                          → GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── backup.yml                   → Daily database backup automation
│       ├── ci.yml                       → Main CI/CD pipeline
│       ├── dependency-update.yml        → Automated dependency updates
│       ├── docker.yml                   → Docker build and deployment
│       ├── performance.yml             → Performance testing and monitoring
│       ├── release.yml                  → Automated release management
│       ├── security.yml                 → Security scanning and compliance
│       └── simple-ci.yml                → Basic CI checks
│
├── 📁 __tests__/                        → Jest test files
│   ├── components/                      → Component unit tests
│   │   ├── AdminLayout.test.tsx
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   └── Input.test.tsx
│   ├── pages/                           → Page component tests
│   └── utils/                           → Utility function tests
│
├── 📁 app/                              → Next.js 15 App Router (Frontend)
│   ├── 📁 admin/                        → Admin dashboard pages
│   │   ├── admin.css                    → Admin-specific styles
│   │   ├── analytics/page.tsx          → Admin analytics dashboard
│   │   ├── contests/page.tsx            → Contest management interface
│   │   ├── dashboard/page.tsx           → Admin main dashboard
│   │   ├── layout.tsx                   → Admin layout wrapper
│   │   ├── leaderboard/page.tsx        → Global leaderboard management
│   │   ├── mentors/page.tsx             → Mentor management interface
│   │   ├── profile/page.tsx             → Admin profile management
│   │   └── users/page.tsx               → User management interface
│   │
│   ├── 📁 api/                          → Backend API Routes (RESTful)
│   │   ├── 📁 activity/                 → Activity tracking APIs
│   │   │   └── feed/route.ts            → Activity feed endpoint
│   │   ├── 📁 admin/                    → Admin-only API endpoints
│   │   │   ├── analytics/route.ts       → Admin analytics data
│   │   │   ├── batches/                 → Batch management APIs
│   │   │   ├── contests/                → Contest management APIs
│   │   │   ├── dashboard/route.ts       → Admin dashboard data
│   │   │   ├── leaderboard/route.ts     → Global leaderboard data
│   │   │   ├── login/route.ts           → Admin authentication
│   │   │   ├── mentors/                 → Mentor management APIs
│   │   │   ├── profile/                 → Admin profile APIs
│   │   │   ├── upload/                  → File upload APIs
│   │   │   └── users/                   → User management APIs
│   │   ├── 📁 analytics/                → Analytics and reporting APIs
│   │   │   └── overview/route.ts        → Analytics overview data
│   │   ├── 📁 auth/                     → Authentication APIs
│   │   │   ├── forgot-password/route.ts → Password reset initiation
│   │   │   ├── login/route.ts           → User login endpoint
│   │   │   ├── register/route.ts        → User registration
│   │   │   ├── reset-password/route.ts  → Password reset completion
│   │   │   └── verify-email/route.ts    → Email verification
│   │   ├── 📁 communities/              → Community management APIs
│   │   │   ├── [id]/                    → Community-specific operations
│   │   │   └── route.ts                 → Community CRUD operations
│   │   ├── 📁 contests/                 → Contest management APIs
│   │   │   ├── [id]/                    → Contest-specific operations
│   │   │   └── route.ts                 → Contest CRUD operations
│   │   ├── 📁 dashboard/                → Dashboard data APIs
│   │   │   ├── route.ts                 → Main dashboard data
│   │   │   └── summary/route.ts         → Dashboard summary stats
│   │   ├── 📁 extension/                → Browser extension integration
│   │   │   ├── data/route.ts            → Extension data retrieval
│   │   │   └── sync/route.ts            → Extension data synchronization
│   │   ├── 📁 feedbacks/                → Feedback system APIs
│   │   │   ├── [id]/route.ts            → Individual feedback operations
│   │   │   └── route.ts                 → Feedback CRUD operations
│   │   ├── 📁 health/                   → Health check endpoints
│   │   │   └── route.ts                 → Application health status
│   │   ├── 📁 mentor/                   → Mentor-specific APIs
│   │   │   ├── contests/                → Mentor contest management
│   │   │   ├── dashboard/route.ts       → Mentor dashboard data
│   │   │   ├── feedback/                → Mentor feedback system
│   │   │   ├── leaderboard/             → Mentor leaderboard management
│   │   │   └── profile/                 → Mentor profile management
│   │   ├── 📁 payment/                  → Payment processing APIs
│   │   │   ├── create-order/route.ts    → Razorpay order creation
│   │   │   └── verify-order/route.ts    → Payment verification
│   │   ├── 📁 profile/                  → User profile APIs
│   │   │   └── route.ts                 → Profile management
│   │   ├── 📁 projects/                 → Project management APIs
│   │   │   ├── [id]/route.ts            → Individual project operations
│   │   │   └── route.ts                 → Project CRUD operations
│   │   ├── 📁 socket/                   → WebSocket connection handling
│   │   │   └── route.ts                 → Socket.IO server setup
│   │   ├── 📁 stats/                    → Statistics and analytics APIs
│   │   │   └── summary/route.ts         → Statistical summary data
│   │   ├── 📁 subscription/             → Subscription management APIs
│   │   │   ├── cancel/route.ts          → Subscription cancellation
│   │   │   └── route.ts                 → Subscription CRUD operations
│   │   ├── 📁 tasks/                    → Task management APIs
│   │   │   ├── [id]/route.ts            → Individual task operations
│   │   │   ├── bulk/route.ts            → Bulk task operations
│   │   │   ├── route.ts                 → Task CRUD operations
│   │   │   └── today/route.ts           → Today's tasks
│   │   ├── 📁 test/                     → Testing endpoints
│   │   │   └── route.ts                 → Test API endpoint
│   │   └── 📁 user/                     → User management APIs
│   │       ├── consent/route.ts         → GDPR consent management
│   │       ├── data-export/route.ts     → User data export
│   │       └── delete-account/route.ts → Account deletion requests
│   │
│   ├── 📁 auth/                         → Authentication pages
│   │   ├── complete-profile/page.tsx    → Profile completion flow
│   │   ├── forgot-password/page.tsx     → Password reset request
│   │   ├── login/page.tsx               → User login interface
│   │   ├── register/page.tsx            → User registration interface
│   │   ├── reset-password/page.tsx      → Password reset form
│   │   ├── unauthorized/page.tsx        → Unauthorized access page
│   │   ├── verify-email/page.tsx        → Email verification page
│   │   └── verify-otp/page.tsx          → OTP verification page
│   │
│   ├── 📁 mentor/                       → Mentor dashboard pages
│   │   ├── contest-manage/page.tsx      → Contest management interface
│   │   ├── contests/                    → Mentor contest pages
│   │   ├── dashboard/page.tsx           → Mentor main dashboard
│   │   ├── feedback/page.tsx            → Feedback management interface
│   │   ├── layout.tsx                   → Mentor layout wrapper
│   │   ├── leaderboard/page.tsx        → Mentor leaderboard view
│   │   ├── mentor.css                   → Mentor-specific styles
│   │   └── profile/page.tsx             → Mentor profile management
│   │
│   ├── 📁 personal/                     → Personal dashboard pages
│   │   ├── communities/page.tsx         → Community management
│   │   ├── dashboard/page.tsx           → Personal dashboard
│   │   ├── layout.tsx                   → Personal layout wrapper
│   │   ├── personal.css                 → Personal-specific styles
│   │   ├── privacy/page.tsx             → Privacy settings
│   │   ├── profile/page.tsx             → Personal profile
│   │   ├── projects/page.tsx            → Project management
│   │   ├── stats/page.tsx               → Personal statistics
│   │   ├── subscription/page.tsx        → Subscription management
│   │   └── tracker/page.tsx            → Learning tracker
│   │
│   ├── 📁 student/                      → Student dashboard pages
│   │   ├── contests/                    → Student contest pages
│   │   ├── dashboard/page.tsx           → Student main dashboard
│   │   ├── feedback/page.tsx            → Student feedback interface
│   │   ├── layout.tsx                   → Student layout wrapper
│   │   ├── leaderboard/page.tsx        → Student leaderboard view
│   │   ├── profile/page.tsx             → Student profile management
│   │   └── student.css                  → Student-specific styles
│   │
│   ├── globals.css                      → Global CSS styles
│   ├── layout.tsx                       → Root layout component
│   ├── page.tsx                         → Home page
│   └── privacy/page.tsx                → Privacy policy page
│
├── 📁 components/                       → Reusable React components
│   ├── 📁 activity/                     → Activity-related components
│   │   └── ActivityFeed.tsx             → Real-time activity feed
│   ├── 📁 analytics/                   → Analytics components
│   │   └── AnalyticsCard.tsx            → Analytics metric cards
│   ├── 📁 compliance/                   → GDPR compliance components
│   │   ├── AccountDeletionModal.tsx     → Account deletion modal
│   │   ├── CookieConsent.tsx            → Cookie consent banner
│   │   └── DataExportModal.tsx          → Data export modal
│   ├── 📁 contest/                     → Contest-related components
│   │   ├── LiveChat.tsx                → Real-time contest chat
│   │   └── LiveLeaderboard.tsx         → Real-time leaderboard
│   ├── 📁 dashboard/                   → Dashboard components
│   │   └── EnhancedDashboard.tsx       → Enhanced dashboard with real data
│   ├── 📁 layout/                      → Layout components
│   │   ├── AdminHeader.tsx             → Admin navigation header
│   │   ├── Footer.tsx                   → Site footer
│   │   ├── Header.tsx                   → Main navigation header
│   │   ├── MentorHeader.tsx             → Mentor navigation header
│   │   ├── PersonalHeader.tsx          → Personal navigation header
│   │   ├── 📁 roles/                    → Role-specific layouts
│   │   │   ├── AdminLayout.tsx         → Admin layout wrapper
│   │   │   ├── MentorLayout.tsx        → Mentor layout wrapper
│   │   │   ├── PersonalLayout.tsx      → Personal layout wrapper
│   │   │   └── StudentLayout.tsx       → Student layout wrapper
│   │   └── StudentHeader.tsx            → Student navigation header
│   ├── 📁 notifications/                → Notification components
│   │   └── NotificationDropdown.tsx     → Notification dropdown
│   ├── 📁 payment/                     → Payment components
│   │   ├── PaymentModal.tsx             → Payment processing modal
│   │   └── PricingCard.tsx              → Subscription pricing cards
│   ├── 📁 tracker/                     → Learning tracker components
│   │   └── EnhancedTracker.tsx         → Enhanced tracker with extension data
│   └── 📁 ui/                          → UI component library
│       ├── AdminAvatar.tsx             → Admin avatar component
│       ├── AdminButton.tsx             → Admin button component
│       ├── AdminCard.tsx               → Admin card component
│       ├── AdminInput.tsx              → Admin input component
│       ├── AdminModal.tsx              → Admin modal component
│       ├── AdminTable.tsx              → Admin table component
│       ├── AdminToast.tsx              → Admin toast component
│       ├── AnimatedCounter.tsx         → Animated counter component
│       ├── Button.tsx                  → Base button component
│       ├── Card.tsx                    → Base card component
│       ├── Input.tsx                   → Base input component
│       ├── LoadingStates.tsx           → Loading state components
│       ├── MentorAvatar.tsx            → Mentor avatar component
│       ├── MentorButton.tsx            → Mentor button component
│       ├── MentorCard.tsx              → Mentor card component
│       ├── MentorInput.tsx             → Mentor input component
│       ├── MentorModal.tsx             → Mentor modal component
│       ├── MentorTable.tsx             → Mentor table component
│       ├── MentorToast.tsx             → Mentor toast component
│       ├── StarRating.tsx              → Star rating component
│       └── StatusBadge.tsx              → Status badge component
│
├── 📁 lib/                             → Utility libraries
│   ├── 📁 hooks/                        → Custom React hooks
│   │   └── useSocket.ts               → Socket.IO React hook
│   ├── admin-middleware.ts             → Admin authentication middleware
│   ├── analytics.ts                    → Google Analytics integration
│   ├── api-client.ts                   → Enhanced API client
│   ├── api-utils.ts                    → API utility functions
│   ├── api.ts                          → API configuration
│   ├── auth.ts                         → Authentication utilities
│   ├── constants.ts                    → Application constants
│   ├── email-notifications.ts          → Email notification service
│   ├── email.ts                        → Email service (Nodemailer)
│   ├── extension-integration.ts        → Browser extension integration
│   ├── mentor-middleware.ts            → Mentor authentication middleware
│   ├── mentor-validation.ts            → Mentor validation schemas
│   ├── performance.ts                  → Performance monitoring utilities
│   ├── prisma.ts                       → Prisma database client
│   ├── rate-limit.ts                   → Rate limiting middleware
│   ├── razorpay.ts                     → Razorpay payment integration
│   ├── socket.ts                       → Socket.IO server setup
│   ├── student-middleware.ts           → Student authentication middleware
│   ├── student-utils.ts                 → Student utility functions
│   ├── student-validation.ts           → Student validation schemas
│   ├── subscription-middleware.ts      → Subscription validation middleware
│   ├── types.ts                        → TypeScript type definitions
│   ├── utils.ts                        → General utility functions
│   └── validation.ts                   → Input validation utilities
│
├── 📁 prisma/                          → Database schema and migrations
│   ├── admin-seed.ts                   → Admin user seeding script
│   ├── schema.prisma                   → Database schema definition
│   └── seed.ts                         → Database seeding script
│
├── 📁 public/                          → Static assets
│   ├── file.svg                        → File icon
│   ├── globe.svg                       → Globe icon
│   ├── next.svg                        → Next.js logo
│   ├── tailwind.css                    → Tailwind CSS framework
│   ├── vercel.svg                      → Vercel logo
│   └── window.svg                      → Window icon
│
├── 📄 Configuration Files
│   ├── docker-compose.yml              → Docker Compose configuration
│   ├── Dockerfile                      → Docker container configuration
│   ├── env.example                     → Environment variables template
│   ├── eslint.config.mjs              → ESLint configuration
│   ├── instrumentation.ts              → Next.js instrumentation
│   ├── jest.config.js                  → Jest testing configuration
│   ├── jest.setup.js                   → Jest test setup
│   ├── middleware.ts                   → Next.js middleware
│   ├── next.config.ts                  → Next.js configuration
│   ├── nginx.conf                      → Nginx reverse proxy configuration
│   ├── package.json                    → Dependencies and scripts
│   ├── package-lock.json               → Dependency lock file
│   ├── postcss.config.mjs              → PostCSS configuration
│   ├── tailwind.config.js              → Tailwind CSS configuration
│   └── tsconfig.json                   → TypeScript configuration
│
├── 📄 Sentry Configuration
│   ├── sentry.client.config.ts         → Sentry client-side configuration
│   ├── sentry.edge.config.ts           → Sentry Edge runtime configuration
│   └── sentry.server.config.ts         → Sentry server-side configuration
│
├── 📄 Documentation
│   ├── ADMIN_API_DOCUMENTATION.md      → Admin API documentation
│   ├── ADMIN_BACKEND_SETUP.md          → Admin backend setup guide
│   ├── BACKEND_IMPLEMENTATION.md       → Backend implementation details
│   ├── BACKEND_SETUP.md                → Backend setup instructions
│   ├── CI_CD_DOCUMENTATION.md          → CI/CD pipeline documentation
│   ├── MENTOR_API_DOCUMENTATION.md     → Mentor API documentation
│   ├── MIGRATION_REQUIREMENTS.md       → Production migration guide
│   ├── PROJECT_STATUS_REPORT.md        → Project completion status
│   ├── ROLE_FLOWS.md                   → Role-based user flows
│   ├── README.md                       → Project overview
│   └── STUDENT_API_DOCUMENTATION.md    → Student API documentation
│
└── 📄 Type Definitions
    ├── next-env.d.ts                   → Next.js type definitions
    └── node_modules/                   → Dependencies (auto-generated)
```

## 🏗️ Architecture Overview

### **Main Application (Next.js 15)**
- **`skillport-community-nextjs/`**: Complete web application
- **Frontend**: Next.js App Router pages and layouts
- **Backend**: RESTful API endpoints and database
- **Components**: Reusable React components

### **Browser Extensions**
- **`SKILL-EXTENSION/`**: Legacy browser extension
- **`SKILL-EXTENSION-NEW/`**: Updated browser extension
- **Platform Integration**: LeetCode, HackerRank, GeeksforGeeks, InterviewBit
- **Data Sync**: Real-time submission tracking

### **Development & Deployment**
- **`.github/workflows/`**: CI/CD automation (both root and app level)
- **`.vscode/`**: VS Code workspace configuration
- **Docker**: Container configuration and deployment
- **Testing**: Jest test suites and quality assurance

### **Project Structure**
- **Root Level**: Browser extensions, CI/CD, workspace settings
- **Application Level**: Next.js app with complete backend/frontend
- **Documentation**: Comprehensive guides and API documentation

## 🎯 Key Features

### **Multi-Role Architecture**
- **Admin**: System management and analytics
- **Mentor**: Contest management and student guidance
- **Student**: Learning and contest participation
- **Personal**: Individual learning tracking

### **Browser Extension Integration**
- **Legacy Extension**: `SKILL-EXTENSION/` with basic functionality
- **Updated Extension**: `SKILL-EXTENSION-NEW/` with enhanced features
- **Platform Support**: LeetCode, HackerRank, GeeksforGeeks, InterviewBit
- **Real-Time Sync**: Automatic submission tracking and data synchronization

### **Real-Time Features**
- **WebSocket Integration**: Live leaderboards and chat
- **Extension Data Flow**: Browser extension to web application
- **Notifications**: Real-time updates and alerts

### **Payment & Subscriptions**
- **Razorpay Integration**: Payment processing
- **Subscription Management**: Plan-based access control
- **Billing History**: Transaction tracking

### **Security & Compliance**
- **GDPR Compliance**: Data privacy and consent
- **Authentication**: JWT-based security
- **Rate Limiting**: API protection
- **Input Validation**: Security best practices

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅
