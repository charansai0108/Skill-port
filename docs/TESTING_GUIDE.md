# 🧪 SkillPort Testing Guide

## **Overview**
This guide provides comprehensive instructions for running and maintaining the SkillPort test suite, covering unit tests, integration tests, and end-to-end tests.

## **Test Structure**

```
tests/
├── unit/                    # Unit tests
│   ├── frontend/           # Frontend unit tests
│   ├── functions/          # Firebase Functions unit tests
│   └── extension/          # Extension unit tests
├── integration/            # Integration tests
│   ├── api/               # API integration tests
│   ├── database/          # Database integration tests
│   └── auth/              # Authentication integration tests
├── e2e/                   # End-to-end tests
│   ├── user-flows/        # User journey tests
│   └── extension-flows/   # Extension workflow tests
├── fixtures/              # Test data and mocks
└── utils/                 # Test utilities and setup
```

## **Prerequisites**

### **Required Tools**
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Playwright (`npx playwright install`)

### **Required Accounts**
- Firebase project with emulators enabled
- GitHub account (for CI/CD)

## **Local Development Setup**

### **1. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install Functions dependencies
cd functions && npm install && cd ..

# Install Extension dependencies
cd SKILL-EXTENSION && npm install && cd ..

# Install Playwright browsers
npx playwright install
```

### **2. Environment Configuration**
```bash
# Copy environment files
cp .env.example .env
cp .env.example .env.development

# Edit with your values
nano .env.development
```

### **3. Start Firebase Emulators**
```bash
# Start all emulators
npm run emulator:all

# Or start specific emulators
firebase emulators:start --only functions,firestore,hosting,storage,auth
```

## **Running Tests**

### **Unit Tests**
```bash
# Run all unit tests
npm run test:unit

# Run specific unit test suites
npm run test:unit -- --testPathPattern=frontend
npm run test:unit -- --testPathPattern=functions
npm run test:unit -- --testPathPattern=extension

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### **Integration Tests**
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test suites
npm run test:integration -- --testPathPattern=api
npm run test:integration -- --testPathPattern=database
npm run test:integration -- --testPathPattern=auth
```

### **End-to-End Tests**
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test suites
npm run test:e2e -- --grep "Authentication"
npm run test:e2e -- --grep "Community"

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug
```

### **All Tests**
```bash
# Run complete test suite
npm run test:ci

# Run with emulator
npm run emulator:test
```

## **Test Categories**

### **Unit Tests**
- **Frontend**: Component logic, service functions, utility functions
- **Functions**: API endpoints, business logic, data validation
- **Extension**: Background scripts, content scripts, message handling

### **Integration Tests**
- **API**: HTTP endpoints, request/response handling, error scenarios
- **Database**: Firestore operations, security rules, data consistency
- **Auth**: Authentication flows, token validation, role-based access

### **End-to-End Tests**
- **User Flows**: Complete user journeys from registration to dashboard
- **Extension Flows**: Browser extension functionality and data sync
- **Cross-Platform**: Multi-browser and mobile device testing

## **Test Data Management**

### **Fixtures**
Test data is managed in `tests/fixtures/test-data.js`:
- User data (admin, mentor, student, personal)
- Community data (active, inactive)
- Contest data (upcoming, active, completed)
- Submission data (evaluated, pending)
- OTP data (valid, expired, max attempts)
- Notification data (welcome, contest start, submission evaluated)

### **Mocking**
- Firebase services are mocked for unit tests
- API responses are mocked for integration tests
- Browser APIs are mocked for extension tests

## **CI/CD Integration**

### **GitHub Actions**
Tests run automatically on:
- Push to main, staging, develop branches
- Pull requests to main, staging branches

### **Test Matrix**
- **Unit Tests**: Node.js 18, 20
- **Integration Tests**: Firebase emulators
- **E2E Tests**: Chrome, Firefox, Safari, Mobile
- **Security Tests**: Dependency audit, vulnerability scan
- **Performance Tests**: Load testing, response time validation

### **Coverage Reports**
- Unit test coverage: Codecov integration
- Integration test coverage: Firebase emulator coverage
- E2E test coverage: Playwright coverage

## **Debugging Tests**

### **Unit Test Debugging**
```bash
# Run specific test with verbose output
npm run test:unit -- --verbose --testNamePattern="should create user"

# Run with debugger
npm run test:unit -- --inspect-brk

# Run with coverage and detailed output
npm run test:coverage -- --verbose
```

### **Integration Test Debugging**
```bash
# Run with detailed logging
npm run test:integration -- --verbose

# Run specific test file
npm run test:integration -- tests/integration/api/users.test.js
```

### **E2E Test Debugging**
```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Run specific test
npm run test:e2e -- --grep "should complete user registration"

# Generate trace
npm run test:e2e -- --trace on
```

## **Test Maintenance**

### **Adding New Tests**
1. **Unit Tests**: Add to appropriate `tests/unit/` subdirectory
2. **Integration Tests**: Add to appropriate `tests/integration/` subdirectory
3. **E2E Tests**: Add to appropriate `tests/e2e/` subdirectory

### **Test Naming Convention**
- **Unit Tests**: `*.test.js`
- **Integration Tests**: `*.test.js`
- **E2E Tests**: `*.spec.js`

### **Test Structure**
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('should do something specific', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## **Performance Testing**

### **Load Testing**
```bash
# Run performance tests
npm run test:performance

# Run with specific load
npm run test:performance -- --users 100 --duration 60s
```

### **Performance Metrics**
- API response time: < 2 seconds
- Function cold start: < 5 seconds
- File upload: < 10 seconds (5MB)
- Real-time updates: < 1 second

## **Security Testing**

### **Dependency Audit**
```bash
# Run security audit
npm audit

# Run with specific level
npm audit --audit-level moderate
```

### **Vulnerability Scanning**
```bash
# Run vulnerability scan
npm run test:security

# Run with specific rules
npm run test:security -- --rules security-rules.json
```

## **Troubleshooting**

### **Common Issues**

#### **Emulator Connection Failed**
```bash
# Check emulator status
firebase emulators:list

# Restart emulators
firebase emulators:start --only functions,firestore,hosting,storage,auth
```

#### **Test Timeout**
```bash
# Increase timeout
npm run test:unit -- --testTimeout 60000

# Check for hanging promises
npm run test:unit -- --detectOpenHandles
```

#### **Playwright Browser Issues**
```bash
# Reinstall browsers
npx playwright install

# Run with specific browser
npm run test:e2e -- --project chromium
```

### **Debug Commands**
```bash
# Check test environment
npm run test:env

# Validate test configuration
npm run test:validate

# Run test diagnostics
npm run test:diagnose
```

## **Best Practices**

### **Test Writing**
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Single Responsibility**: One test per scenario
3. **Descriptive Names**: Clear test descriptions
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Setup/Teardown**: Proper test isolation

### **Test Data**
1. **Use Fixtures**: Reusable test data
2. **Mock External Services**: Don't depend on external APIs
3. **Clean State**: Reset state between tests
4. **Realistic Data**: Use realistic test data

### **Performance**
1. **Parallel Execution**: Run tests in parallel when possible
2. **Efficient Mocks**: Use efficient mocking strategies
3. **Resource Cleanup**: Clean up resources after tests
4. **Timeout Management**: Set appropriate timeouts

## **Test Reports**

### **Coverage Reports**
- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

### **E2E Reports**
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/results.xml`

### **Performance Reports**
- **HTML Report**: `performance-results/index.html`
- **JSON Report**: `performance-results/results.json`

## **Continuous Improvement**

### **Test Metrics**
- **Coverage**: Maintain > 80% code coverage
- **Performance**: Keep test execution time < 10 minutes
- **Reliability**: Maintain > 95% test pass rate
- **Maintenance**: Review and update tests monthly

### **Test Review Process**
1. **Code Review**: All test changes require review
2. **Automated Checks**: CI/CD runs all tests
3. **Performance Monitoring**: Track test execution time
4. **Coverage Monitoring**: Track coverage trends

---

## **🎉 Testing Complete!**

Your SkillPort project now has comprehensive test coverage:
- ✅ **Unit Tests**: Frontend, Functions, Extension
- ✅ **Integration Tests**: API, Database, Auth
- ✅ **E2E Tests**: User flows, Extension workflows
- ✅ **CI/CD Integration**: Automated testing pipeline
- ✅ **Performance Tests**: Load and response time validation
- ✅ **Security Tests**: Vulnerability and dependency scanning

**Run `npm run test:ci` to execute the complete test suite!**
