# Testing Guide - Restructured Architecture

## 📋 Overview

This document provides a comprehensive testing guide for the restructured SkillPort Community monorepo architecture, covering unit tests, integration tests, and end-to-end tests.

## 🎯 Testing Strategy

### **Testing Pyramid**
```
        /\
       /  \
      / E2E \     ← End-to-End Tests (Few, High Value)
     /______\
    /        \
   /Integration\ ← Integration Tests (Some, Medium Value)
  /____________\
 /              \
/   Unit Tests   \ ← Unit Tests (Many, Low Value)
/________________\
```

### **Test Types**
- **Unit Tests**: Individual components and functions
- **Integration Tests**: API endpoints and database interactions
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability and penetration testing

## 🏗️ Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component unit tests
│   ├── pages/              # Page unit tests
│   ├── utils/               # Utility function tests
│   └── hooks/              # Custom hook tests
├── integration/            # Integration tests
│   ├── api/                # API integration tests
│   ├── database/          # Database integration tests
│   ├── auth/               # Authentication integration tests
│   └── payment/            # Payment integration tests
└── e2e/                    # End-to-end tests
    ├── admin/              # Admin workflow tests
    ├── mentor/             # Mentor workflow tests
    ├── student/            # Student workflow tests
    └── extension/           # Extension integration tests
```

## 🧪 Unit Testing

### **Setup**

1. **Install Dependencies**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   npm install --save-dev @types/jest ts-jest
   ```

2. **Jest Configuration**
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapping: {
       '^@skillport/ui$': '<rootDir>/packages/ui',
       '^@skillport/utils$': '<rootDir>/packages/utils',
       '^@skillport/types$': '<rootDir>/packages/types',
       '^@skillport/hooks$': '<rootDir>/packages/hooks',
     },
     testMatch: [
       '<rootDir>/tests/unit/**/*.test.ts',
       '<rootDir>/tests/unit/**/*.test.tsx',
     ],
   };
   ```

3. **Test Setup**
   ```javascript
   // jest.setup.js
   import '@testing-library/jest-dom';
   
   // Mock Next.js router
   jest.mock('next/router', () => ({
     useRouter() {
       return {
         route: '/',
         pathname: '/',
         query: {},
         asPath: '/',
         push: jest.fn(),
         pop: jest.fn(),
         reload: jest.fn(),
         back: jest.fn(),
         prefetch: jest.fn(),
         beforePopState: jest.fn(),
         events: {
           on: jest.fn(),
           off: jest.fn(),
           emit: jest.fn(),
         },
       };
     },
   }));
   ```

### **Component Testing**

1. **Button Component Test**
   ```typescript
   // tests/unit/components/Button.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { Button } from '@skillport/ui';
   
   describe('Button Component', () => {
     it('renders with correct text', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByText('Click me')).toBeInTheDocument();
     });
   
     it('calls onClick when clicked', () => {
       const handleClick = jest.fn();
       render(<Button onClick={handleClick}>Click me</Button>);
       
       fireEvent.click(screen.getByText('Click me'));
       expect(handleClick).toHaveBeenCalledTimes(1);
     });
   
     it('applies correct variant styles', () => {
       render(<Button variant="primary">Primary</Button>);
       expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');
     });
   });
   ```

2. **Card Component Test**
   ```typescript
   // tests/unit/components/Card.test.tsx
   import { render, screen } from '@testing-library/react';
   import { Card } from '@skillport/ui';
   
   describe('Card Component', () => {
     it('renders children correctly', () => {
       render(
         <Card>
           <h2>Card Title</h2>
           <p>Card content</p>
         </Card>
       );
       
       expect(screen.getByText('Card Title')).toBeInTheDocument();
       expect(screen.getByText('Card content')).toBeInTheDocument();
     });
   
     it('applies custom className', () => {
       render(<Card className="custom-class">Content</Card>);
       expect(screen.getByText('Content')).toHaveClass('custom-class');
     });
   });
   ```

### **Hook Testing**

1. **useSocket Hook Test**
   ```typescript
   // tests/unit/hooks/useSocket.test.ts
   import { renderHook, act } from '@testing-library/react';
   import { useSocket } from '@skillport/hooks';
   
   // Mock Socket.IO
   jest.mock('socket.io-client', () => ({
     io: jest.fn(() => ({
       on: jest.fn(),
       emit: jest.fn(),
       disconnect: jest.fn(),
     })),
   }));
   
   describe('useSocket Hook', () => {
     it('connects to socket on mount', () => {
       const { result } = renderHook(() => useSocket());
       
       expect(result.current.connected).toBe(true);
     });
   
     it('disconnects on unmount', () => {
       const { result, unmount } = renderHook(() => useSocket());
       
       unmount();
       expect(result.current.connected).toBe(false);
     });
   });
   ```

### **Utility Function Testing**

1. **Utility Functions Test**
   ```typescript
   // tests/unit/utils/utils.test.ts
   import { cn, formatDate, calculateScore } from '@skillport/utils';
   
   describe('Utility Functions', () => {
     describe('cn function', () => {
       it('merges class names correctly', () => {
         expect(cn('class1', 'class2')).toBe('class1 class2');
       });
   
       it('handles conditional classes', () => {
         expect(cn('class1', { 'class2': true, 'class3': false }))
           .toBe('class1 class2');
       });
     });
   
     describe('formatDate function', () => {
       it('formats date correctly', () => {
         const date = new Date('2024-12-20T10:00:00Z');
         expect(formatDate(date)).toBe('Dec 20, 2024');
       });
     });
   
     describe('calculateScore function', () => {
       it('calculates score correctly', () => {
         const submissions = [
           { status: 'Accepted', score: 100 },
           { status: 'Accepted', score: 80 },
           { status: 'Wrong Answer', score: 0 },
         ];
         expect(calculateScore(submissions)).toBe(180);
       });
     });
   });
   ```

## 🔗 Integration Testing

### **API Testing**

1. **Authentication API Test**
   ```typescript
   // tests/integration/api/auth.test.ts
   import request from 'supertest';
   import { app } from '@/backend/index';
   
   describe('Authentication API', () => {
     describe('POST /api/auth/register', () => {
       it('registers a new user successfully', async () => {
         const userData = {
           name: 'Test User',
           email: 'test@example.com',
           password: 'password123',
           role: 'student'
         };
   
         const response = await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(201);
   
         expect(response.body.success).toBe(true);
         expect(response.body.user.email).toBe(userData.email);
       });
   
       it('returns error for invalid email', async () => {
         const userData = {
           name: 'Test User',
           email: 'invalid-email',
           password: 'password123',
           role: 'student'
         };
   
         const response = await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(400);
   
         expect(response.body.success).toBe(false);
         expect(response.body.error).toContain('email');
       });
     });
   
     describe('POST /api/auth/login', () => {
       it('logs in user successfully', async () => {
         const loginData = {
           email: 'test@example.com',
           password: 'password123'
         };
   
         const response = await request(app)
           .post('/api/auth/login')
           .send(loginData)
           .expect(200);
   
         expect(response.body.success).toBe(true);
         expect(response.body.token).toBeDefined();
       });
   
       it('returns error for invalid credentials', async () => {
         const loginData = {
           email: 'test@example.com',
           password: 'wrongpassword'
         };
   
         const response = await request(app)
           .post('/api/auth/login')
           .send(loginData)
           .expect(401);
   
         expect(response.body.success).toBe(false);
         expect(response.body.error).toContain('Invalid credentials');
       });
     });
   });
   ```

2. **Contest API Test**
   ```typescript
   // tests/integration/api/contests.test.ts
   import request from 'supertest';
   import { app } from '@/backend/index';
   
   describe('Contest API', () => {
     let authToken: string;
   
     beforeEach(async () => {
       // Login and get auth token
       const response = await request(app)
         .post('/api/auth/login')
         .send({ email: 'admin@example.com', password: 'admin123' });
       
       authToken = response.body.token;
     });
   
     describe('GET /api/contests', () => {
       it('returns list of contests', async () => {
         const response = await request(app)
           .get('/api/contests')
           .set('Authorization', `Bearer ${authToken}`)
           .expect(200);
   
         expect(response.body.success).toBe(true);
         expect(Array.isArray(response.body.contests)).toBe(true);
       });
     });
   
     describe('POST /api/contests', () => {
       it('creates a new contest', async () => {
         const contestData = {
           title: 'Test Contest',
           description: 'Test Description',
           startDate: '2024-12-25T00:00:00Z',
           endDate: '2024-12-26T23:59:59Z',
           problems: ['Problem 1', 'Problem 2']
         };
   
         const response = await request(app)
           .post('/api/contests')
           .set('Authorization', `Bearer ${authToken}`)
           .send(contestData)
           .expect(201);
   
         expect(response.body.success).toBe(true);
         expect(response.body.contest.title).toBe(contestData.title);
       });
     });
   });
   ```

### **Database Integration Testing**

1. **Database Connection Test**
   ```typescript
   // tests/integration/database/connection.test.ts
   import { PrismaClient } from '@prisma/client';
   
   describe('Database Connection', () => {
     let prisma: PrismaClient;
   
     beforeAll(async () => {
       prisma = new PrismaClient();
     });
   
     afterAll(async () => {
       await prisma.$disconnect();
     });
   
     it('connects to database successfully', async () => {
       await expect(prisma.$connect()).resolves.not.toThrow();
     });
   
     it('can perform basic database operations', async () => {
       const user = await prisma.user.create({
         data: {
           name: 'Test User',
           email: 'test@example.com',
           password: 'hashedpassword',
           role: 'student'
         }
       });
   
       expect(user).toBeDefined();
       expect(user.email).toBe('test@example.com');
   
       await prisma.user.delete({ where: { id: user.id } });
     });
   });
   ```

## 🎭 End-to-End Testing

### **Setup with Playwright**

1. **Install Dependencies**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Playwright Configuration**
   ```typescript
   // playwright.config.ts
   import { defineConfig, devices } from '@playwright/test';
   
   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] },
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] },
       },
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

### **Admin Workflow Tests**

1. **Admin Login Test**
   ```typescript
   // tests/e2e/admin/login.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Admin Login', () => {
     test('admin can login successfully', async ({ page }) => {
       await page.goto('/auth/login');
       
       await page.fill('[data-testid="email-input"]', 'admin@example.com');
       await page.fill('[data-testid="password-input"]', 'admin123');
       await page.click('[data-testid="login-button"]');
       
       await expect(page).toHaveURL('/admin/dashboard');
       await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();
     });
   
     test('admin sees dashboard after login', async ({ page }) => {
       // Login first
       await page.goto('/auth/login');
       await page.fill('[data-testid="email-input"]', 'admin@example.com');
       await page.fill('[data-testid="password-input"]', 'admin123');
       await page.click('[data-testid="login-button"]');
       
       // Check dashboard elements
       await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
       await expect(page.locator('[data-testid="total-contests"]')).toBeVisible();
       await expect(page.locator('[data-testid="total-mentors"]')).toBeVisible();
     });
   });
   ```

2. **User Management Test**
   ```typescript
   // tests/e2e/admin/user-management.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('User Management', () => {
     test.beforeEach(async ({ page }) => {
       // Login as admin
       await page.goto('/auth/login');
       await page.fill('[data-testid="email-input"]', 'admin@example.com');
       await page.fill('[data-testid="password-input"]', 'admin123');
       await page.click('[data-testid="login-button"]');
     });
   
     test('admin can view users list', async ({ page }) => {
       await page.goto('/admin/users');
       
       await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
       await expect(page.locator('[data-testid="user-row"]')).toHaveCount.greaterThan(0);
     });
   
     test('admin can create new user', async ({ page }) => {
       await page.goto('/admin/users');
       
       await page.click('[data-testid="add-user-button"]');
       await page.fill('[data-testid="user-name-input"]', 'New User');
       await page.fill('[data-testid="user-email-input"]', 'newuser@example.com');
       await page.selectOption('[data-testid="user-role-select"]', 'student');
       await page.click('[data-testid="save-user-button"]');
       
       await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
     });
   });
   ```

### **Student Workflow Tests**

1. **Student Registration Test**
   ```typescript
   // tests/e2e/student/registration.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Student Registration', () => {
     test('student can register successfully', async ({ page }) => {
       await page.goto('/auth/register');
       
       await page.fill('[data-testid="name-input"]', 'John Doe');
       await page.fill('[data-testid="email-input"]', 'john@example.com');
       await page.fill('[data-testid="password-input"]', 'password123');
       await page.selectOption('[data-testid="role-select"]', 'student');
       await page.click('[data-testid="register-button"]');
       
       await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
       await expect(page.locator('[data-testid="verification-email"]')).toBeVisible();
     });
   
     test('student receives verification email', async ({ page }) => {
       // Registration process
       await page.goto('/auth/register');
       await page.fill('[data-testid="name-input"]', 'Jane Doe');
       await page.fill('[data-testid="email-input"]', 'jane@example.com');
       await page.fill('[data-testid="password-input"]', 'password123');
       await page.selectOption('[data-testid="role-select"]', 'student');
       await page.click('[data-testid="register-button"]');
       
       // Check for email verification message
       await expect(page.locator('[data-testid="check-email-message"]')).toBeVisible();
     });
   });
   ```

2. **Contest Participation Test**
   ```typescript
   // tests/e2e/student/contest-participation.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Contest Participation', () => {
     test.beforeEach(async ({ page }) => {
       // Login as student
       await page.goto('/auth/login');
       await page.fill('[data-testid="email-input"]', 'student@example.com');
       await page.fill('[data-testid="password-input"]', 'student123');
       await page.click('[data-testid="login-button"]');
     });
   
     test('student can view contests', async ({ page }) => {
       await page.goto('/student/contests');
       
       await expect(page.locator('[data-testid="contests-list"]')).toBeVisible();
       await expect(page.locator('[data-testid="contest-card"]')).toHaveCount.greaterThan(0);
     });
   
     test('student can register for contest', async ({ page }) => {
       await page.goto('/student/contests');
       
       await page.click('[data-testid="contest-card"]:first-child');
       await page.click('[data-testid="register-button"]');
       
       await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
       await expect(page.locator('[data-testid="participant-status"]')).toContainText('Registered');
     });
   });
   ```

### **Extension Integration Tests**

1. **Extension Installation Test**
   ```typescript
   // tests/e2e/extension/installation.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Extension Installation', () => {
     test('extension can be installed', async ({ page, context }) => {
       // Load extension
       await context.addInitScript(() => {
         // Mock extension APIs
         window.chrome = {
           runtime: {
             sendMessage: jest.fn(),
             onMessage: {
               addListener: jest.fn(),
             },
           },
         };
       });
   
       await page.goto('https://leetcode.com/problems/two-sum/');
       
       // Check if extension is loaded
       await expect(page.locator('[data-testid="skillport-extension"]')).toBeVisible();
     });
   });
   ```

## 🚀 Running Tests

### **Test Commands**

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Button"
```

### **CI/CD Integration**

```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📊 Test Coverage

### **Coverage Goals**
- **Unit Tests**: >90% coverage
- **Integration Tests**: >80% coverage
- **E2E Tests**: Critical user flows covered

### **Coverage Reports**
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🔧 Debugging Tests

### **Debug Unit Tests**
```bash
# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug with VS Code
# Set breakpoints in test files
# Press F5 to start debugging
```

### **Debug E2E Tests**
```bash
# Run tests in headed mode
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/e2e/admin/login.spec.ts --debug
```

## 📋 Test Checklist

### **Before Writing Tests**
- [ ] Understand the component/function behavior
- [ ] Identify edge cases and error conditions
- [ ] Plan test scenarios
- [ ] Set up test data and mocks

### **While Writing Tests**
- [ ] Write descriptive test names
- [ ] Test happy path scenarios
- [ ] Test error conditions
- [ ] Test edge cases
- [ ] Use appropriate assertions
- [ ] Clean up test data

### **After Writing Tests**
- [ ] Run tests to ensure they pass
- [ ] Check test coverage
- [ ] Review test quality
- [ ] Update documentation if needed

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Testing Guide Complete ✅  
**Coverage**: Unit, Integration, E2E Tests
