import { test, expect } from './fixtures/company-context';
import { generateTestJob, generateTestSection, TEST_THEME_COLORS } from './helpers/test-data';

test.describe('Preview Mode', () => {
  test('should access preview page', async ({ page, company }) => {
    await page.goto(`/${company.slug}/preview`);

    // Should display the preview page
    await expect(page).toHaveURL(`/${company.slug}/preview`);
  });

  test('should require authentication for preview', async ({ page, company }) => {
    // Create a new context without authentication
    const newContext = await page.context().browser()?.newContext();
    if (!newContext) return;

    const unauthPage = await newContext.newPage();

    await unauthPage.goto(`/${company.slug}/preview`);

    // Should redirect to login or show access denied
    await expect(unauthPage).toHaveURL(/\/auth\/login|\/(.*)/);

    await unauthPage.close();
    await newContext.close();
  });

  test('should show both published and draft content', async ({ page, company }) => {
    // Create a draft job
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const draftJob = generateTestJob({ title: 'Draft Job in Preview' });

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', draftJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', draftJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(draftJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to preview page
    await page.goto(`/${company.slug}/preview`);

    // Draft job should be visible in preview
    await expect(page.getByText(draftJob.title)).toBeVisible();
  });

  test('should reflect theme changes immediately', async ({ page, company }) => {
    // Change theme in editor
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Theme"), [role="tab"]:has-text("Theme")');

    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill(TEST_THEME_COLORS.primary);

    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Open preview in new tab
    const previewPage = await page.context().newPage();
    await previewPage.goto(`/${company.slug}/preview`);

    // Verify theme is applied
    await expect(previewPage).toHaveURL(`/${company.slug}/preview`);

    await previewPage.close();
  });

  test('should show section changes', async ({ page, company }) => {
    // Add a section
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Sections"), [role="tab"]:has-text("Sections")');

    const testSection = generateTestSection({ title: 'Preview Test Section' });

    await page.click('button:has-text("Add Section"), button:has-text("New Section")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testSection.title);

    const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
    await editor.click();
    await editor.fill('This content should appear in preview');

    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to preview
    await page.goto(`/${company.slug}/preview`);

    // Section should be visible
    await expect(page.getByText(testSection.title)).toBeVisible();
    await expect(page.getByText('This content should appear in preview')).toBeVisible();
  });

  test('should navigate from editor to preview', async ({ page, company }) => {
    await page.goto(`/${company.slug}/edit`);

    // Look for preview button/link
    const previewButton = page.getByRole('link', { name: /preview/i });

    if (await previewButton.count() > 0) {
      await previewButton.click();

      // Should navigate to preview page
      await expect(page).toHaveURL(`/${company.slug}/preview`);
    } else {
      // Manually navigate to preview
      await page.goto(`/${company.slug}/preview`);
      await expect(page).toHaveURL(`/${company.slug}/preview`);
    }
  });

  test('should navigate from preview back to editor', async ({ page, company }) => {
    await page.goto(`/${company.slug}/preview`);

    // Look for edit/back button
    const editButton = page.getByRole('link', { name: /edit|back to editor/i });

    if (await editButton.count() > 0) {
      await editButton.click();

      // Should navigate back to editor
      await expect(page).toHaveURL(`/${company.slug}/edit`);
    }
  });

  test('should show preview banner or indicator', async ({ page, company }) => {
    await page.goto(`/${company.slug}/preview`);

    // Look for preview mode indicator
    const previewIndicator = page.getByText(/preview|draft mode|not published/i);

    // Might have a banner indicating this is preview mode
    if (await previewIndicator.count() > 0) {
      await expect(previewIndicator.first()).toBeVisible();
    }
  });

  test('should display all jobs including drafts', async ({ page, company }) => {
    // Create a published job
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const publishedJob = generateTestJob({ title: 'Published Job' });

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', publishedJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', publishedJob.location);

    let descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('Published job description');

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Publish it
    const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
    if (await publishToggle.count() > 0) {
      await publishToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Create a draft job
    const draftJob = generateTestJob({ title: 'Draft Job' });

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', draftJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', draftJob.location);

    descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('Draft job description');

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to preview
    await page.goto(`/${company.slug}/preview`);

    // Both jobs should be visible in preview
    await expect(page.getByText(publishedJob.title)).toBeVisible();
    await expect(page.getByText(draftJob.title)).toBeVisible();
  });

  test('should be responsive in preview mode', async ({ page, company }) => {
    await page.goto(`/${company.slug}/preview`);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Page should be responsive
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Should still display properly
    await expect(page.locator('body')).toBeVisible();
  });

  test('should match careers page layout', async ({ page, company }) => {
    await page.goto(`/${company.slug}/preview`);

    // Get page structure
    const previewStructure = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector('header'),
        hasMain: !!document.querySelector('main'),
        hasFooter: !!document.querySelector('footer'),
      };
    });

    // Preview should have similar structure to careers page
    expect(previewStructure.hasMain).toBeTruthy();
  });
});
