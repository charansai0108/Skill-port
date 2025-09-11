/**
 * Global Teardown for Playwright Tests
 * Cleans up test environment and data
 */

const { chromium } = require('@playwright/test');

async function globalTeardown(config) {
  console.log('🧹 Cleaning up global test environment...');

  // Start browser for cleanup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3003');

    // Clean up test data
    await cleanupTestData(page);

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page) {
  console.log('🗑️ Cleaning up test data...');

  // Clean up test data
  await page.evaluate(async () => {
    try {
      // Delete test users
      const testUserIds = [
        'admin-user-123',
        'mentor-user-123',
        'student-user-123',
        'personal-user-123',
        'test-user-123'
      ];

      for (const userId of testUserIds) {
        try {
          await fetch(`http://localhost:5001/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
        } catch (error) {
          console.log(`User ${userId} might not exist:`, error.message);
        }
      }

      // Delete test communities
      const testCommunityIds = [
        'test-community-123',
        'inactive-community-123'
      ];

      for (const communityId of testCommunityIds) {
        try {
          await fetch(`http://localhost:5001/api/communities/${communityId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
        } catch (error) {
          console.log(`Community ${communityId} might not exist:`, error.message);
        }
      }

      // Delete test contests
      const testContestIds = [
        'upcoming-contest-123',
        'active-contest-123',
        'completed-contest-123'
      ];

      for (const contestId of testContestIds) {
        try {
          await fetch(`http://localhost:5001/api/contests/${contestId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
        } catch (error) {
          console.log(`Contest ${contestId} might not exist:`, error.message);
        }
      }

      // Delete test submissions
      const testSubmissionIds = [
        'submission-123',
        'submission-456'
      ];

      for (const submissionId of testSubmissionIds) {
        try {
          await fetch(`http://localhost:5001/api/submissions/${submissionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
        } catch (error) {
          console.log(`Submission ${submissionId} might not exist:`, error.message);
        }
      }

      // Clear test notifications
      try {
        await fetch('http://localhost:5001/api/notifications/cleanup', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });
      } catch (error) {
        console.log('Notification cleanup might not be available:', error.message);
      }

    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  console.log('✅ Test data cleanup completed');
}

module.exports = globalTeardown;
