import { test as base } from '@playwright/test';
import { login, DEFAULT_TEST_USER, type TestUser } from '../helpers/auth';
import { generateTestCompany, type TestCompany } from '../helpers/test-data';
import { getCompanyBySlug, cleanupTestCompanies } from '../helpers/db';

/**
 * Fixture that provides an authenticated user with a test company
 *
 * This fixture:
 * 1. Logs in the user
 * 2. Creates a test company
 * 3. Provides both the page and company data
 * 4. Cleans up the company after the test
 *
 * Usage:
 *   test('my test', async ({ page, company }) => {
 *     // User is logged in and company is created
 *     await page.goto(`/${company.slug}/edit`);
 *   });
 */

type CompanyContextFixtures = {
  user: TestUser;
  company: TestCompany & { id?: string };
};

export const test = base.extend<CompanyContextFixtures>({
  user: async ({}, use) => {
    await use(DEFAULT_TEST_USER);
  },

  company: async ({ page, user }, use) => {
    // Login first
    await login(page, user);

    // Generate test company data
    const testCompany = generateTestCompany();

    // Create a new company using the UI
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Fill in company details in the dialog
    await page.fill('input[name="name"], input[placeholder*="Company"]', testCompany.name);
    await page.fill('input[name="slug"], input[placeholder*="slug"]', testCompany.slug);

    // Submit the form
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for dialog to close or navigation to happen
    await page.waitForTimeout(2000);

    // Fetch the created company from database to get its ID with retry logic
    let createdCompany: any = null;
    for (let i = 0; i < 5; i++) {
      createdCompany = await getCompanyBySlug(testCompany.slug);
      if (createdCompany) break;
      await page.waitForTimeout(500);
    }

    const companyWithId = {
      ...testCompany,
      id: createdCompany?.id,
    };

    // Provide the company to the test
    await use(companyWithId);

    // Cleanup: Delete test companies after the test
    await cleanupTestCompanies();
  },
});

export { expect } from '@playwright/test';
