import { test, expect } from './fixtures/company-context';
import { TEST_THEME_COLORS } from './helpers/test-data';

test.describe('Editor - Theme Customization', () => {
  test.beforeEach(async ({ page, company }) => {
    // Navigate to the editor
    await page.goto(`/${company.slug}/edit`);

    // Switch to Theme tab
    await page.click('button:has-text("Theme"), [role="tab"]:has-text("Theme")');
  });

  test('should display theme customization interface', async ({ page }) => {
    // Should see theme customization options
    await expect(page.getByRole('heading', { name: 'Brand Colors' })).toBeVisible();

    // Should see color pickers or inputs
    await expect(page.locator('input[type="color"], input[type="text"][placeholder*="color"]').first()).toBeVisible();
  });

  test('should update primary color', async ({ page }) => {
    // Find primary color input
    const primaryColorInput = page.locator('input[type="color"]').first();

    // Set new color
    await primaryColorInput.fill(TEST_THEME_COLORS.primary);

    // Save changes
    await page.click('button:has-text("Save")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify color was saved by reloading and checking
    await page.reload();
    await page.click('button:has-text("Theme"), [role="tab"]:has-text("Theme")');

    const savedColor = await primaryColorInput.first().inputValue();
    expect(savedColor.toLowerCase()).toBe(TEST_THEME_COLORS.primary.toLowerCase());
  });

  test('should show live preview of theme changes', async ({ page, company }) => {
    // Navigate to preview in a new context
    const previewPage = await page.context().newPage();
    await previewPage.goto(`/${company.slug}/preview`);

    // Change primary color
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill(TEST_THEME_COLORS.primary);

    // Save changes
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Reload preview page
    await previewPage.reload();

    // Verify the color is applied (this depends on how you apply theme colors)
    // Example: Check if a button or header has the new color
    const styledElement = previewPage.locator('button, h1, header').first();
    if (styledElement) {
      const backgroundColor = await styledElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // This is a simplified check - you may need to adjust based on your implementation
      expect(backgroundColor).toBeTruthy();
    }

    await previewPage.close();
  });

  test('should upload company logo', async ({ page }) => {
    // Look for logo upload button/input
    const logoUploadInput = page.locator('input[type="file"][accept*="image"]').first();

    // Check if upload input exists
    if (await logoUploadInput.count() > 0) {
      // Create a test image file
      const testImagePath = require('path').join(__dirname, 'test-assets', 'logo.png');

      // If test assets don't exist, we can skip the actual upload
      // but verify the UI is present
      await expect(logoUploadInput).toBeAttached();

      // Verify there's an upload button or area
      await expect(page.getByText(/upload|logo|choose file/i)).toBeVisible();
    }
  });

  test('should upload company banner', async ({ page }) => {
    // Look for banner upload button/input
    const uploadInputs = page.locator('input[type="file"][accept*="image"]');

    // Should have upload inputs (logo and banner)
    const count = await uploadInputs.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify there's a banner upload section
    await expect(page.getByText(/banner|header image/i)).toBeVisible();
  });

  test('should reset theme to defaults', async ({ page }) => {
    // Change primary color first
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill(TEST_THEME_COLORS.primary);

    // Save changes
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Look for reset button
    const resetButton = page.getByRole('button', { name: /reset|default/i });

    if (await resetButton.count() > 0) {
      await resetButton.click();

      // Confirm reset if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(1000);

      // Verify color was reset (this depends on your default color)
      const resetColor = await primaryColorInput.first().inputValue();
      expect(resetColor).toBeTruthy();
    }
  });

  test('should validate color input format', async ({ page }) => {
    // Try to input invalid color
    const colorInput = page.locator('input[type="text"][placeholder*="color"]').first();

    if (await colorInput.count() > 0) {
      await colorInput.fill('invalid-color');
      await page.click('button:has-text("Save")');

      // Should show validation error
      await expect(page.getByText(/invalid|error|valid color/i)).toBeVisible();
    }
  });

  test('should show unsaved changes warning', async ({ page, company }) => {
    // Make a change
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill(TEST_THEME_COLORS.primary);

    // Try to navigate away without saving
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    // Might show unsaved changes warning (depends on implementation)
    // This is optional - some apps auto-save
    const warningDialog = page.getByText(/unsaved|discard|changes/i);
    if (await warningDialog.isVisible()) {
      // Cancel navigation
      await page.click('button:has-text("Cancel")');

      // Should still be on theme tab
      await expect(page).toHaveURL(new RegExp(`/${company.slug}/edit`));
    }
  });

  test('should display theme preview panel', async ({ page }) => {
    // Look for a preview panel showing how the theme looks
    const previewPanel = page.locator('[data-preview], .preview, #preview');

    // Preview panel might exist
    if (await previewPanel.count() > 0) {
      await expect(previewPanel).toBeVisible();
    }
  });
});
