/**
 * E2E Tests for Authentication Flow
 * Tests complete user authentication journey
 */

const { test, expect } = require('@playwright/test');
const testData = require('../../fixtures/test-data');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete user registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.selectOption('select[name="role"]', 'personal');
    await page.selectOption('select[name="experience"]', 'beginner');

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to OTP verification
    await expect(page).toHaveURL(/.*verify-otp/);
    await expect(page.locator('text=OTP Verification')).toBeVisible();

    // Enter OTP (mock OTP for testing)
    await page.fill('input[name="otp"]', '123456');

    // Verify OTP
    await page.click('button:has-text("Verify OTP")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome, Test User')).toBeVisible();
  });

  test('should handle invalid OTP', async ({ page }) => {
    // Navigate to OTP verification page
    await page.goto('/pages/auth/verify-otp.html');

    // Enter invalid OTP
    await page.fill('input[name="otp"]', '000000');

    // Verify OTP
    await page.click('button:has-text("Verify OTP")');

    // Should show error message
    await expect(page.locator('text=Invalid OTP')).toBeVisible();
  });

  test('should resend OTP', async ({ page }) => {
    // Navigate to OTP verification page
    await page.goto('/pages/auth/verify-otp.html');

    // Click resend OTP
    await page.click('button:has-text("Resend OTP")');

    // Should show success message
    await expect(page.locator('text=OTP sent successfully')).toBeVisible();
  });

  test('should complete login flow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/pages/auth/login.html');

    // Fill invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit login
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should complete Google sign-in flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/pages/auth/login.html');

    // Mock Google sign-in
    await page.route('**/auth/google', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: testData.users.student
        })
      });
    });

    // Click Google sign-in button
    await page.click('button:has-text("Sign in with Google")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome, Student User')).toBeVisible();
  });

  test('should complete Facebook sign-in flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/pages/auth/login.html');

    // Mock Facebook sign-in
    await page.route('**/auth/facebook', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: testData.users.mentor
        })
      });
    });

    // Click Facebook sign-in button
    await page.click('button:has-text("Sign in with Facebook")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome, Mentor User')).toBeVisible();
  });

  test('should complete sign-out flow', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => {
      window.__AUTH_STATE__ = {
        isAuthenticated: true,
        user: testData.users.student
      };
    });

    // Navigate to dashboard
    await page.goto('/pages/personal/student-dashboard.html');

    // Click sign-out button
    await page.click('button:has-text("Sign Out")');

    // Should redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/pages/auth/forgot-password.html');

    // Fill email
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit password reset
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Mock expired session
    await page.evaluate(() => {
      window.__AUTH_STATE__ = {
        isAuthenticated: false,
        user: null
      };
    });

    // Navigate to protected page
    await page.goto('/pages/personal/student-dashboard.html');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('text=Please sign in')).toBeVisible();
  });

  test('should handle role-based access control', async ({ page }) => {
    // Mock student user
    await page.evaluate(() => {
      window.__AUTH_STATE__ = {
        isAuthenticated: true,
        user: { ...testData.users.student, role: 'student' }
      };
    });

    // Navigate to admin page
    await page.goto('/pages/admin/admin-dashboard.html');

    // Should show access denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('should handle concurrent login attempts', async ({ page, context }) => {
    // Create multiple browser contexts
    const contexts = await Promise.all([
      context.browser().newContext(),
      context.browser().newContext(),
      context.browser().newContext()
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    // Navigate all pages to login
    await Promise.all(pages.map(p => p.goto('/pages/auth/login.html')));

    // Fill login form on all pages
    await Promise.all(pages.map(p => {
      p.fill('input[name="email"]', 'test@example.com');
      p.fill('input[name="password"]', 'password123');
    }));

    // Submit login on all pages
    await Promise.all(pages.map(p => p.click('button[type="submit"]')));

    // All should redirect to dashboard
    await Promise.all(pages.map(p => 
      expect(p).toHaveURL(/.*dashboard/)
    ));

    // Clean up
    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});
