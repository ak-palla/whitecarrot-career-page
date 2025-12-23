import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Default test user credentials
 * Note: These should be created in your test Supabase database
 */
export const DEFAULT_TEST_USER: TestUser = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

/**
 * Login helper function
 * Navigates to login page and authenticates user
 */
export async function login(
  page: Page,
  user: TestUser = DEFAULT_TEST_USER
): Promise<void> {
  console.log('[AUTH] Navigating to /auth/login');
  await page.goto('/auth/login');

  console.log('[AUTH] Current URL after goto:', page.url());

  // Fill in the login form
  console.log('[AUTH] Filling email:', user.email);
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  console.log('[AUTH] Clicking submit button');
  // Submit the form and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log('[AUTH] After submit, current URL:', page.url());

  // Wait for page to load completely
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  console.log('[AUTH] After networkidle, current URL:', page.url());

  // If not on dashboard, wait for redirect
  if (!page.url().includes('/dashboard')) {
    console.log('[AUTH] Not on dashboard yet, waiting for redirect...');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  console.log('[AUTH] Login complete, final URL:', page.url());
}

/**
 * Signup helper function
 * Navigates to signup page and creates a new user
 */
export async function signup(
  page: Page,
  user: TestUser
): Promise<void> {
  await page.goto('/auth/sign-up');

  // Fill in the signup form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for success page or dashboard
  await page.waitForURL(/\/(dashboard|auth\/sign-up-success)/, { timeout: 10000 });
}

/**
 * Logout helper function
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to dashboard or any authenticated page
  await page.goto('/dashboard');

  // Click the logout button (adjust selector based on your UI)
  // This is a placeholder - update based on your actual logout implementation
  await page.click('[data-testid="logout-button"]').catch(() => {
    // If logout button doesn't exist with testid, try common patterns
    page.getByRole('button', { name: /logout|sign out/i }).click();
  });

  // Wait for redirect to login or home page
  await page.waitForURL(/\/(auth\/login|\/)/, { timeout: 5000 });
}

/**
 * Check if user is authenticated by checking URL or page content
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/dashboard') || url.includes('/edit');
}

/**
 * Generate a unique test user email
 * Useful for testing signup flows
 */
export function generateTestUser(prefix = 'test'): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `${prefix}-${timestamp}-${random}@example.com`,
    password: 'Test123!@#',
  };
}
