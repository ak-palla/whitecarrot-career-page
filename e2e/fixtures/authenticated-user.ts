import { test as base, Page } from '@playwright/test';
import { login, DEFAULT_TEST_USER, type TestUser } from '../helpers/auth';
import { cleanupUserTestData } from '../helpers/db';

/**
 * Fixture that provides an authenticated user session
 *
 * Usage:
 *   test('my test', async ({ authenticatedPage, user }) => {
 *     // Page is already logged in
 *     await authenticatedPage.goto('/dashboard');
 *   });
 */

type AuthenticatedUserFixtures = {
  authenticatedPage: Page;
  user: TestUser;
};

export const test = base.extend<AuthenticatedUserFixtures>({
  user: async ({}, use) => {
    // Provide the test user
    await use(DEFAULT_TEST_USER);
  },

  authenticatedPage: async ({ page, user }, use) => {
    // Login before each test
    await login(page, user);

    // Use the authenticated page
    await use(page);

    // Cleanup after the test (optional)
    // Uncomment if you want to clean up test data after each test
    // Note: This requires the user ID, which we don't have easily accessible here
    // await cleanupUserTestData(userId);
  },
});

export { expect } from '@playwright/test';
