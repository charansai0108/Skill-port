/**
 * Global Setup for Playwright Tests
 * Sets up test environment and data
 */

const { chromium } = require('@playwright/test');
const testData = require('../fixtures/test-data');

async function globalSetup(config) {
  console.log('🚀 Setting up global test environment...');

  // Start browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3003');

    // Wait for the application to load
    await page.waitForLoadState('networkidle');

    // Set up test data in Firestore (via emulator)
    await setupTestData(page);

    // Set up authentication state
    await setupAuthentication(page);

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page) {
  console.log('📊 Setting up test data...');

  // Inject test data into the page
  await page.evaluate((data) => {
    window.__TEST_DATA__ = data;
  }, testData);

  // Create test users
  await page.evaluate(async () => {
    const { testData } = window.__TEST_DATA__;
    
    // Create users
    for (const [role, userData] of Object.entries(testData.users)) {
      try {
        await fetch('http://localhost:5001/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(userData)
        });
      } catch (error) {
        console.log(`User ${role} might already exist:`, error.message);
      }
    }

    // Create communities
    for (const [type, communityData] of Object.entries(testData.communities)) {
      try {
        await fetch('http://localhost:5001/api/communities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(communityData)
        });
      } catch (error) {
        console.log(`Community ${type} might already exist:`, error.message);
      }
    }

    // Create contests
    for (const [status, contestData] of Object.entries(testData.contests)) {
      try {
        await fetch('http://localhost:5001/api/contests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(contestData)
        });
      } catch (error) {
        console.log(`Contest ${status} might already exist:`, error.message);
      }
    }
  });

  console.log('✅ Test data setup completed');
}

async function setupAuthentication(page) {
  console.log('🔐 Setting up authentication...');

  // Set up authentication state
  await page.evaluate(() => {
    // Mock authentication state
    window.__AUTH_STATE__ = {
      isAuthenticated: true,
      user: {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'personal'
      }
    };

    // Mock auth manager
    window.authManager = {
      getCurrentUser: () => window.__AUTH_STATE__.user,
      isLoggedIn: () => window.__AUTH_STATE__.isAuthenticated,
      getUserId: () => window.__AUTH_STATE__.user.uid,
      getUserRole: () => window.__AUTH_STATE__.user.role
    };
  });

  console.log('✅ Authentication setup completed');
}

module.exports = globalSetup;
