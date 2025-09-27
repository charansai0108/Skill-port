# Migration Requirements - Restructured Architecture

## 📋 Overview

This document outlines the complete migration process from the legacy structure to the new monorepo architecture for SkillPort Community.

## 🎯 Migration Goals

- **Restructure**: Move from flat structure to organized monorepo
- **Separate Concerns**: Clear separation between frontend, backend, and shared code
- **Update Imports**: Fix all import paths and connections
- **Maintain Functionality**: Ensure all features work after migration
- **Documentation**: Update all documentation to reflect new structure

## 📁 New Architecture

```
skillport-community/
├── apps/
│   ├── web/                    # Next.js application
│   ├── mobile/                 # Future mobile app
│   └── extension/              # Browser extension
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── utils/                  # Shared utilities
│   ├── types/                  # Shared types
│   └── hooks/                  # Shared hooks
├── backend/
│   ├── api/                    # API routes
│   ├── services/               # Business logic
│   ├── models/                 # Database models
│   ├── middleware/             # Auth & validation
│   ├── jobs/                   # Scheduled jobs
│   ├── sockets/                # WebSocket handlers
│   ├── prisma/                 # Database schema
│   ├── config/                 # Configuration
│   └── utils/                  # Backend utilities
├── docs/                       # Documentation
├── scripts/                    # Development scripts
├── tests/                      # Test suites
└── public/                     # Static assets
```

## 🔄 Migration Steps

### **Phase 1: Directory Structure Setup**

1. **Create New Directories**
   ```bash
   mkdir -p apps/web apps/mobile apps/extension
   mkdir -p packages/ui packages/utils packages/types packages/hooks
   mkdir -p backend/api backend/services backend/models backend/middleware
   mkdir -p backend/jobs backend/sockets backend/prisma backend/config backend/utils
   mkdir -p docs scripts tests/unit tests/integration tests/e2e
   ```

2. **Move Applications**
   ```bash
   # Move Next.js app to apps/web/
   cp -r skillport-community-nextjs/* apps/web/
   
   # Move extension to apps/extension/
   cp -r SKILL-EXTENSION-NEW/* apps/extension/
   ```

3. **Move Shared Code**
   ```bash
   # Move components to packages/ui/
   cp -r apps/web/components/* packages/ui/
   
   # Move utilities to packages/utils/
   cp -r apps/web/lib/utils.ts packages/utils/
   
   # Move types to packages/types/
   cp -r apps/web/lib/types.ts packages/types/
   
   # Move hooks to packages/hooks/
   cp -r apps/web/lib/hooks/* packages/hooks/
   ```

4. **Move Backend Code**
   ```bash
   # Move API routes to backend/api/
   cp -r apps/web/app/api/* backend/api/
   
   # Move Prisma to backend/prisma/
   cp -r apps/web/prisma/* backend/prisma/
   
   # Move utilities to backend/utils/
   cp -r apps/web/lib/*.ts backend/utils/
   
   # Move middleware to backend/middleware/
   cp -r apps/web/lib/*middleware*.ts backend/middleware/
   ```

### **Phase 2: Package Configuration**

1. **Root package.json**
   ```json
   {
     "name": "skillport-community",
     "version": "2.0.0",
     "workspaces": ["apps/*", "packages/*", "backend"],
     "scripts": {
       "dev": "npm run dev --workspace=apps/web",
       "build": "npm run build --workspace=apps/web",
       "test": "npm run test --workspace=apps/web"
     }
   }
   ```

2. **Package Dependencies**
   - **apps/web**: Next.js, React, Tailwind CSS
   - **packages/ui**: React, Lucide React, Tailwind
   - **packages/utils**: Utility functions
   - **packages/types**: Prisma client types
   - **packages/hooks**: React, Socket.IO client
   - **backend**: Express, Prisma, Socket.IO, Razorpay

### **Phase 3: Import Path Updates**

1. **Frontend Imports**
   ```typescript
   // Old imports
   import { Button } from '@/components/ui/Button'
   import { useSocket } from '@/lib/hooks/useSocket'
   
   // New imports
   import { Button } from '@skillport/ui'
   import { useSocket } from '@skillport/hooks'
   ```

2. **Backend Imports**
   ```typescript
   // Old imports
   import { prisma } from '@/lib/prisma'
   import { authMiddleware } from '@/lib/auth'
   
   // New imports
   import { prisma } from '@/backend/prisma'
   import { authMiddleware } from '@/backend/middleware/auth'
   ```

3. **API Route Updates**
   ```typescript
   // Update API routes to use backend services
   import { ContestService } from '@/backend/services/contest.service'
   import { AuthService } from '@/backend/services/auth.service'
   ```

### **Phase 4: Configuration Updates**

1. **TypeScript Configuration**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./apps/web/*"],
         "@/components/*": ["./packages/ui/*"],
         "@/lib/*": ["./packages/utils/*"],
         "@/types/*": ["./packages/types/*"],
         "@/hooks/*": ["./packages/hooks/*"],
         "@/backend/*": ["./backend/*"]
       }
     }
   }
   ```

2. **Next.js Configuration**
   ```typescript
   // Update next.config.ts for monorepo
   const nextConfig = {
     transpilePackages: ['@skillport/ui', '@skillport/utils', '@skillport/types', '@skillport/hooks']
   }
   ```

3. **Environment Variables**
   ```bash
   # Update .env files for new structure
   DATABASE_URL="postgresql://username:password@localhost:5432/skillport_community"
   JWT_SECRET="your-super-secret-jwt-key-here"
   # ... other variables
   ```

### **Phase 5: Testing & Validation**

1. **Unit Tests**
   ```bash
   npm run test:unit
   ```

2. **Integration Tests**
   ```bash
   npm run test:integration
   ```

3. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

4. **Build Validation**
   ```bash
   npm run build
   ```

## 🔧 Manual Setup Steps

### **1. Database Setup**
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp env.example .env

# Update with your values
# - DATABASE_URL
# - JWT_SECRET
# - EMAIL configuration
# - RAZORPAY keys
# - SENTRY DSN
```

### **3. Development Setup**
```bash
# Install all dependencies
npm run install:all

# Start development server
npm run dev

# Start backend services
npm run backend:dev
```

### **4. Extension Setup**
```bash
# Build extension
npm run extension:build

# Load in browser
# - Open Chrome Extensions
# - Enable Developer mode
# - Load unpacked extension from apps/extension/
```

## 📋 Migration Checklist

### **Pre-Migration**
- [ ] Backup current project
- [ ] Document current functionality
- [ ] Test all existing features
- [ ] Create migration branch

### **During Migration**
- [ ] Create new directory structure
- [ ] Move files to appropriate locations
- [ ] Update package.json files
- [ ] Update import paths
- [ ] Update configuration files
- [ ] Update documentation

### **Post-Migration**
- [ ] Run all tests
- [ ] Validate all features work
- [ ] Update CI/CD pipelines
- [ ] Update deployment scripts
- [ ] Update documentation
- [ ] Remove legacy directories

## 🚨 Common Issues & Solutions

### **Import Path Errors**
```typescript
// Problem: Cannot resolve module
// Solution: Update tsconfig.json paths
{
  "paths": {
    "@skillport/ui": ["./packages/ui"],
    "@skillport/utils": ["./packages/utils"]
  }
}
```

### **Package Resolution Issues**
```bash
# Problem: Package not found
# Solution: Install dependencies
npm install
npm run install:all
```

### **Build Errors**
```bash
# Problem: Build fails
# Solution: Check transpilePackages in next.config.ts
const nextConfig = {
  transpilePackages: ['@skillport/ui', '@skillport/utils']
}
```

### **Database Connection Issues**
```bash
# Problem: Database connection failed
# Solution: Check DATABASE_URL and run migrations
npm run db:push
npm run db:seed
```

## 📚 Documentation Updates

### **Files to Update**
- [ ] PROJECT_STRUCTURE.md
- [ ] MIGRATION_REQUIREMENTS.md
- [ ] DEPLOYMENT_CHECKLIST.md
- [ ] TESTING_GUIDE.md
- [ ] API_DOCUMENTATION.md
- [ ] ROLE_FLOWS.md

### **New Documentation**
- [ ] MONOREPO_GUIDE.md
- [ ] PACKAGE_DEVELOPMENT.md
- [ ] SHARED_COMPONENTS.md

## 🎯 Success Criteria

### **Functional Requirements**
- [ ] All user roles work correctly
- [ ] Authentication and authorization work
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Real-time features work
- [ ] Extension integration works
- [ ] Payment processing works

### **Technical Requirements**
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Performance is maintained
- [ ] Security is maintained

### **Documentation Requirements**
- [ ] All documentation is updated
- [ ] Migration guide is complete
- [ ] API documentation is current
- [ ] Role flows are documented

## 🚀 Next Steps

1. **Complete Migration**: Finish all migration steps
2. **Test Thoroughly**: Run comprehensive tests
3. **Update Documentation**: Ensure all docs are current
4. **Deploy**: Deploy to production
5. **Monitor**: Monitor for any issues
6. **Cleanup**: Remove legacy directories

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Migration in Progress 🔄
