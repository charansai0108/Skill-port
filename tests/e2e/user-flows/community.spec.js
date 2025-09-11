/**
 * E2E Tests for Community Management Flow
 * Tests complete community lifecycle
 */

const { test, expect } = require('@playwright/test');
const testData = require('../../fixtures/test-data');

test.describe('Community Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated admin user
    await page.evaluate(() => {
      window.__AUTH_STATE__ = {
        isAuthenticated: true,
        user: { ...testData.users.admin, role: 'community-admin' }
      };
    });

    // Navigate to community page
    await page.goto('/pages/community.html');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new community', async ({ page }) => {
    // Click create community button
    await page.click('button:has-text("Create Community")');

    // Fill community form
    await page.fill('input[name="name"]', 'Test Community');
    await page.fill('input[name="code"]', 'TEST001');
    await page.fill('textarea[name="description"]', 'A test community for development');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Community created successfully')).toBeVisible();

    // Should redirect to community details
    await expect(page).toHaveURL(/.*community.*TEST001/);
  });

  test('should join an existing community', async ({ page }) => {
    // Mock student user
    await page.evaluate(() => {
      window.__AUTH_STATE__ = {
        isAuthenticated: true,
        user: { ...testData.users.student, role: 'student' }
      };
    });

    // Navigate to community page
    await page.goto('/pages/community.html');

    // Click join community button
    await page.click('button:has-text("Join Community")');

    // Enter community code
    await page.fill('input[name="communityCode"]', 'TEST001');

    // Submit join request
    await page.click('button:has-text("Join")');

    // Should show success message
    await expect(page.locator('text=Successfully joined community')).toBeVisible();
  });

  test('should view community details', async ({ page }) => {
    // Click on existing community
    await page.click('text=Test Community');

    // Should show community details
    await expect(page.locator('text=Test Community')).toBeVisible();
    await expect(page.locator('text=TEST001')).toBeVisible();
    await expect(page.locator('text=A test community for development')).toBeVisible();

    // Should show member count
    await expect(page.locator('text=Members:')).toBeVisible();
  });

  test('should manage community members', async ({ page }) => {
    // Navigate to community management
    await page.click('text=Test Community');
    await page.click('button:has-text("Manage Members")');

    // Should show member list
    await expect(page.locator('text=Member Management')).toBeVisible();
    await expect(page.locator('text=Admin User')).toBeVisible();

    // Promote member to mentor
    await page.click('button:has-text("Promote to Mentor")');

    // Should show success message
    await expect(page.locator('text=Member promoted successfully')).toBeVisible();
  });

  test('should create community contest', async ({ page }) => {
    // Navigate to community
    await page.click('text=Test Community');

    // Click create contest
    await page.click('button:has-text("Create Contest")');

    // Fill contest form
    await page.fill('input[name="title"]', 'Community Contest');
    await page.fill('textarea[name="description"]', 'A contest for community members');
    await page.selectOption('select[name="difficulty"]', 'medium');
    
    // Set dates
    await page.fill('input[name="startDate"]', '2024-12-01');
    await page.fill('input[name="endDate"]', '2024-12-31');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Contest created successfully')).toBeVisible();
  });

  test('should view community leaderboard', async ({ page }) => {
    // Navigate to community
    await page.click('text=Test Community');

    // Click leaderboard tab
    await page.click('text=Leaderboard');

    // Should show leaderboard
    await expect(page.locator('text=Community Leaderboard')).toBeVisible();
    await expect(page.locator('text=Rank')).toBeVisible();
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Score')).toBeVisible();
  });

  test('should handle community settings', async ({ page }) => {
    // Navigate to community settings
    await page.click('text=Test Community');
    await page.click('button:has-text("Settings")');

    // Update community settings
    await page.fill('textarea[name="description"]', 'Updated community description');
    await page.check('input[name="allowStudentRegistration"]');

    // Save settings
    await page.click('button:has-text("Save Settings")');

    // Should show success message
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();
  });

  test('should handle member removal', async ({ page }) => {
    // Navigate to member management
    await page.click('text=Test Community');
    await page.click('button:has-text("Manage Members")');

    // Remove a member
    await page.click('button:has-text("Remove Member")');

    // Confirm removal
    await page.click('button:has-text("Confirm")');

    // Should show success message
    await expect(page.locator('text=Member removed successfully')).toBeVisible();
  });

  test('should handle community deletion', async ({ page }) => {
    // Navigate to community settings
    await page.click('text=Test Community');
    await page.click('button:has-text("Settings")');

    // Click delete community
    await page.click('button:has-text("Delete Community")');

    // Confirm deletion
    await page.fill('input[name="confirmText"]', 'DELETE');
    await page.click('button:has-text("Delete")');

    // Should redirect to community list
    await expect(page).toHaveURL(/.*community/);
    await expect(page.locator('text=Community deleted successfully')).toBeVisible();
  });

  test('should handle community search', async ({ page }) => {
    // Search for community
    await page.fill('input[name="search"]', 'Test');

    // Should show filtered results
    await expect(page.locator('text=Test Community')).toBeVisible();
  });

  test('should handle community filtering', async ({ page }) => {
    // Filter by status
    await page.selectOption('select[name="status"]', 'active');

    // Should show only active communities
    await expect(page.locator('text=Test Community')).toBeVisible();
  });

  test('should handle community pagination', async ({ page }) => {
    // Mock multiple communities
    await page.evaluate(() => {
      // Add more test communities
      for (let i = 1; i <= 15; i++) {
        const community = document.createElement('div');
        community.className = 'community-card';
        community.innerHTML = `
          <h3>Community ${i}</h3>
          <p>Code: COMM${i.toString().padStart(3, '0')}</p>
        `;
        document.querySelector('.community-list').appendChild(community);
      }
    });

    // Should show pagination
    await expect(page.locator('text=Next')).toBeVisible();

    // Click next page
    await page.click('button:has-text("Next")');

    // Should show next page
    await expect(page.locator('text=Community 11')).toBeVisible();
  });

  test('should handle community invitation', async ({ page }) => {
    // Navigate to community
    await page.click('text=Test Community');

    // Click invite members
    await page.click('button:has-text("Invite Members")');

    // Enter email
    await page.fill('input[name="email"]', 'newuser@example.com');

    // Send invitation
    await page.click('button:has-text("Send Invitation")');

    // Should show success message
    await expect(page.locator('text=Invitation sent successfully')).toBeVisible();
  });

  test('should handle community analytics', async ({ page }) => {
    // Navigate to community
    await page.click('text=Test Community');

    // Click analytics tab
    await page.click('text=Analytics');

    // Should show analytics
    await expect(page.locator('text=Community Analytics')).toBeVisible();
    await expect(page.locator('text=Member Growth')).toBeVisible();
    await expect(page.locator('text=Activity Overview')).toBeVisible();
  });
});
