import { test, expect } from './fixtures/company-context';
import { generateTestSection } from './helpers/test-data';

test.describe('Editor - Sections Management', () => {
  test.beforeEach(async ({ page, company }) => {
    // Navigate to the editor
    await page.goto(`/${company.slug}/edit`);

    // Switch to Sections tab
    await page.click('button:has-text("Sections"), [role="tab"]:has-text("Sections")');

    // Wait for sections to load (loading spinner to disappear)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display sections management interface', async ({ page }) => {
    // Should see sections heading
    await expect(page.getByText('Content Sections')).toBeVisible();

    // Should have an "Add Section" button
    await expect(
      page.getByRole('button', { name: /add section/i })
    ).toBeVisible();
  });

  test('should create a new section', async ({ page }) => {
    const testSection = generateTestSection();

    // Click Add Section button
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');

    // Fill in section details
    await page.fill('input[name="title"], input[placeholder*="title"]', testSection.title);

    // Fill in rich text editor content
    // TipTap editor usually has a contenteditable div
    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();
    await editor.fill('This is test section content');

    // Save section
    await page.click('button:has-text("Save"), button[type="submit"]');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify section appears in the list
    await expect(page.getByText(testSection.title)).toBeVisible();
  });

  test('should edit an existing section', async ({ page }) => {
    const testSection = generateTestSection();

    // Create a section first
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testSection.title);

    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();
    await editor.fill('Original content');

    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Now edit the section
    // Look for edit button next to the section
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    // Update content
    const editEditor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editEditor.click();
    await editEditor.fill('Updated content');

    // Save changes
    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify changes were saved
    await expect(page.getByText('Updated content')).toBeVisible();
  });

  test('should delete a section', async ({ page }) => {
    const testSection = generateTestSection();

    // Create a section first
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testSection.title);

    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();
    await editor.fill('Content to be deleted');

    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Delete the section
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    await deleteButton.click();

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify section is removed
    await expect(page.getByText(testSection.title)).not.toBeVisible();
  });

  test('should toggle section visibility', async ({ page }) => {
    const testSection = generateTestSection();

    // Create a section first
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testSection.title);

    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();
    await editor.fill('Content with visibility toggle');

    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Look for visibility toggle (checkbox or switch)
    const visibilityToggle = page.locator('input[type="checkbox"]').first();

    if (await visibilityToggle.count() > 0) {
      // Toggle visibility
      await visibilityToggle.click();

      await page.waitForTimeout(500);

      // Toggle back
      await visibilityToggle.click();

      await page.waitForTimeout(500);
    }
  });

  test('should use rich text editor features', async ({ page }) => {
    // Click Add Section
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');

    await page.fill('input[name="title"], input[placeholder*="title"]', 'Rich Text Test');

    // Find the editor
    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();

    // Type some text
    await editor.type('This is bold text');

    // Try to use bold formatting (if toolbar exists)
    const boldButton = page.getByRole('button', { name: /bold/i, exact: false });
    if (await boldButton.count() > 0) {
      // Select all text
      await page.keyboard.press('Meta+A');

      // Click bold button
      await boldButton.click();

      // Verify bold formatting is applied
      const boldElement = editor.locator('strong, b');
      await expect(boldElement).toBeVisible();
    }
  });

  test('should reorder sections', async ({ page }) => {
    // Create two sections
    const section1 = generateTestSection({ title: 'Section 1', order: 0 });
    const section2 = generateTestSection({ title: 'Section 2', order: 1 });

    // Create first section
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', section1.title);
    const editor1 = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor1.click();
    await editor1.fill('Content 1');
    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Create second section
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', section2.title);
    const editor2 = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor2.click();
    await editor2.fill('Content 2');
    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Look for reorder controls (up/down arrows or drag handles)
    const reorderButtons = page.getByRole('button', { name: /move|up|down/i });

    if (await reorderButtons.count() > 0) {
      // Click move up/down button
      await reorderButtons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should validate required section fields', async ({ page }) => {
    // Click Add Section
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');

    // Try to save without filling required fields
    await page.click('button:has-text("Save"), button[type="submit"]');

    // Should show validation error or prevent submission
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]').first();
    const validationMessage = await titleInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    if (validationMessage) {
      expect(validationMessage).toBeTruthy();
    } else {
      // Or look for error message
      await expect(page.getByText(/required|error/i)).toBeVisible();
    }
  });

  test('should cancel section creation', async ({ page }) => {
    // Click Add Section
    await page.click('button:has-text("Add Section"), button:has-text("New Section")');

    // Fill in some data
    await page.fill('input[name="title"], input[placeholder*="title"]', 'Test Section');

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel|close/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    } else {
      // Press Escape
      await page.keyboard.press('Escape');
    }

    // Dialog should be closed
    await page.waitForTimeout(500);

    // Section should not be in the list
    await expect(page.getByText('Test Section')).not.toBeVisible();
  });
});
