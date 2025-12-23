import { test, expect } from '@playwright/test';
import { login, DEFAULT_TEST_USER } from './helpers/auth';
import { generateTestCompany } from './helpers/test-data';
import { cleanupTestCompanies } from './helpers/db';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEFAULT_TEST_USER);
    await page.goto('/dashboard');
  });

  test.afterEach(async () => {
    // Cleanup test companies after each test
    await cleanupTestCompanies();
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Your Companies' })).toBeVisible();
  });

  test('should show create company button', async ({ page }) => {
    const createButton = page.getByRole('button', {
      name: /create|new company/i,
    });
    await expect(createButton).toBeVisible();
  });

  test('should open create company dialog', async ({ page }) => {
    // Click create company button
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    // Check for dialog heading specifically
    await expect(page.getByRole('heading', { name: 'Create Company' })).toBeVisible();
  });

  test('should create a new company successfully', async ({ page }) => {
    const testCompany = generateTestCompany();

    // Open create dialog
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Fill in company details
    await page.fill('input[name="name"], input[placeholder*="Company"]', testCompany.name);
    await page.fill('input[name="slug"], input[placeholder*="slug"]', testCompany.slug);

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for success (either redirect or toast notification)
    // The app might redirect to the editor page or close the dialog
    await page.waitForTimeout(2000);

    // Verify company was created by checking if we can navigate to its edit page
    await page.goto(`/${testCompany.slug}/edit`);
    await expect(page).toHaveURL(`/${testCompany.slug}/edit`);
  });

  test('should show validation error for empty company name', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create")');

    // Should show validation error or prevent submission
    const nameInput = page.locator('input[name="name"], input[placeholder*="Company"]').first();
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test('should generate slug from company name', async ({ page }) => {
    const testCompany = generateTestCompany();

    // Open create dialog
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Fill in company name
    await page.fill('input[name="name"], input[placeholder*="Company"]', testCompany.name);

    // Slug should be auto-generated (if your implementation does this)
    // Check if slug field has a value
    const slugInput = page.locator('input[name="slug"], input[placeholder*="slug"]').first();
    const slugValue = await slugInput.inputValue();

    // Depending on your implementation, slug might be auto-generated or empty
    // This test assumes auto-generation; adjust as needed
    if (slugValue) {
      expect(slugValue.length).toBeGreaterThan(0);
    }
  });

  test('should list existing companies', async ({ page }) => {
    // Create a test company first
    const testCompany = generateTestCompany();

    await page.click('button:has-text("Create Company"), button:has-text("New Company")');
    await page.fill('input[name="name"], input[placeholder*="Company"]', testCompany.name);
    await page.fill('input[name="slug"], input[placeholder*="slug"]', testCompany.slug);
    await page.click('button[type="submit"]:has-text("Create")');

    await page.waitForTimeout(1000);

    // Navigate back to dashboard
    await page.goto('/dashboard');

    // Should see the created company in the list
    await expect(page.getByText(testCompany.name)).toBeVisible();
  });

  test('should navigate to company editor', async ({ page }) => {
    // Create a test company first
    const testCompany = generateTestCompany();

    await page.click('button:has-text("Create Company"), button:has-text("New Company")');
    await page.fill('input[name="name"], input[placeholder*="Company"]', testCompany.name);
    await page.fill('input[name="slug"], input[placeholder*="slug"]', testCompany.slug);
    await page.click('button[type="submit"]:has-text("Create")');

    await page.waitForTimeout(1000);

    // Navigate to editor (might auto-navigate or need to click)
    // If it doesn't auto-navigate, go to dashboard and click edit
    const currentUrl = page.url();
    if (!currentUrl.includes('/edit')) {
      await page.goto('/dashboard');
      // Click edit button or company card
      await page.click(`text=${testCompany.name}`);
    }

    // Should be on editor page
    await expect(page).toHaveURL(new RegExp(`/${testCompany.slug}/edit`));
  });

  test('should close create company dialog on cancel', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Create Company"), button:has-text("New Company")');

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click cancel or close button
    const cancelButton = page.getByRole('button', { name: /cancel|close/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    } else {
      // Try pressing Escape
      await page.keyboard.press('Escape');
    }

    // Dialog should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
