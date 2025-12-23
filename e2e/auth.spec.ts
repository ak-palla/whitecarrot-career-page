import { test, expect } from '@playwright/test';
import { login, signup, generateTestUser, DEFAULT_TEST_USER } from './helpers/auth';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await login(page, DEFAULT_TEST_USER);

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');

      // Should see dashboard content
      await expect(page.getByText(/companies|dashboard/i)).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible();

      // Should still be on login page
      await expect(page).toHaveURL('/auth/login');
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/auth/login');

      // Try to submit without filling email
      await page.fill('input[type="password"]', 'somepassword');
      await page.click('button[type="submit"]');

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );

      expect(validationMessage).toBeTruthy();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/auth/login');

      await page.click('text=Forgot your password?');

      await expect(page).toHaveURL('/auth/forgot-password');
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/auth/login');

      await page.click('text=Sign up');

      await expect(page).toHaveURL('/auth/sign-up');
    });
  });

  test.describe('Signup', () => {
    test('should navigate to signup page from login', async ({ page }) => {
      await page.goto('/auth/login');

      await page.click('text=Sign up');

      await expect(page).toHaveURL('/auth/sign-up');
      // Verify we're on signup page by checking for "Create a new account" text
      await expect(page.getByText('Create a new account')).toBeVisible();
    });

    test('should show validation for password requirements', async ({ page }) => {
      await page.goto('/auth/sign-up');

      const testUser = generateTestUser();

      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', 'weak');

      await page.click('button[type="submit"]');

      // Should show password validation error
      // Note: This depends on your actual validation implementation
      await expect(page.getByText(/password|characters|requirements/i).first()).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page reload', async ({ page }) => {
      await login(page, DEFAULT_TEST_USER);

      // Reload the page
      await page.reload();

      // Should still be on dashboard (session persists)
      await expect(page).toHaveURL('/dashboard');
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should allow access to dashboard when authenticated', async ({ page }) => {
      await login(page, DEFAULT_TEST_USER);

      await page.goto('/dashboard');

      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(/companies|dashboard/i)).toBeVisible();
    });

    test('should redirect to login for protected routes when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
