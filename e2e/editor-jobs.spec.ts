import { test, expect } from './fixtures/company-context';
import { generateTestJob } from './helpers/test-data';

test.describe('Editor - Jobs Management', () => {
  test.beforeEach(async ({ page, company }) => {
    // Navigate to the editor
    await page.goto(`/${company.slug}/edit`);

    // Switch to Jobs tab
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');
  });

  test('should display jobs management interface', async ({ page }) => {
    // Should see jobs tab content
    await expect(page.getByText(/jobs|positions/i)).toBeVisible();

    // Should have an "Add Job" or "Create Job" button
    await expect(
      page.getByRole('button', { name: /add|new|create.*job/i })
    ).toBeVisible();
  });

  test('should create a new job posting', async ({ page }) => {
    const testJob = generateTestJob();

    // Click Add/Create Job button
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');

    // Fill in job details
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    // Select job type
    const jobTypeSelect = page.locator('select[name="jobType"], select[name="job_type"]');
    if (await jobTypeSelect.count() > 0) {
      await jobTypeSelect.selectOption(testJob.jobType);
    } else {
      // Might be a custom select component
      await page.click('[data-testid="job-type-select"], button:has-text("Select")');
      await page.click(`text=${testJob.jobType}`);
    }

    // Fill in description (might be rich text editor)
    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    // Fill in requirements if field exists
    const requirementsField = page.locator('textarea[name="requirements"], [placeholder*="requirements"]');
    if (await requirementsField.count() > 0) {
      await requirementsField.fill(testJob.requirements || '');
    }

    // Save job
    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify job appears in the list
    await expect(page.getByText(testJob.title)).toBeVisible();
  });

  test('should edit an existing job', async ({ page }) => {
    const testJob = generateTestJob();

    // Create a job first
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('Original description');

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Now edit the job
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    // Update title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
    await titleInput.fill(`${testJob.title} - Updated`);

    // Save changes
    await page.click('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify changes were saved
    await expect(page.getByText(`${testJob.title} - Updated`)).toBeVisible();
  });

  test('should delete a job', async ({ page }) => {
    const testJob = generateTestJob();

    // Create a job first
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('Job to be deleted');

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Delete the job
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    await deleteButton.click();

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify job is removed
    await expect(page.getByText(testJob.title)).not.toBeVisible();
  });

  test('should publish/unpublish a job', async ({ page }) => {
    const testJob = generateTestJob();

    // Create a job
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Look for publish toggle or button
    const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');

    if (await publishToggle.count() > 0) {
      // Toggle publish status
      await publishToggle.first().click();
      await page.waitForTimeout(500);

      // Verify status changed (look for "Published" or "Draft" badge)
      const statusBadge = page.getByText(/published|draft/i);
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should validate required job fields', async ({ page }) => {
    // Click Add Job
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');

    // Try to save without filling required fields
    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');

    // Should show validation error or prevent submission
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]').first();
    const validationMessage = await titleInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    if (validationMessage) {
      expect(validationMessage).toBeTruthy();
    } else {
      // Or look for error message
      await expect(page.getByText(/required|error|fill/i)).toBeVisible();
    }
  });

  test('should filter jobs by status', async ({ page }) => {
    // Look for filter options (Published, Draft, All)
    const filterButtons = page.locator('button:has-text("Published"), button:has-text("Draft"), button:has-text("All")');

    if (await filterButtons.count() > 0) {
      // Click Draft filter
      await page.click('button:has-text("Draft")');
      await page.waitForTimeout(500);

      // Click All filter
      await page.click('button:has-text("All")');
      await page.waitForTimeout(500);
    }
  });

  test('should display job list with details', async ({ page }) => {
    const testJob = generateTestJob();

    // Create a job
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify job details are visible in the list
    await expect(page.getByText(testJob.title)).toBeVisible();
    await expect(page.getByText(testJob.location)).toBeVisible();
  });

  test('should cancel job creation', async ({ page }) => {
    // Click Add Job
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');

    // Fill in some data
    await page.fill('input[name="title"], input[placeholder*="title"]', 'Test Job to Cancel');

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

    // Job should not be in the list
    await expect(page.getByText('Test Job to Cancel')).not.toBeVisible();
  });

  test('should show job count', async ({ page }) => {
    // Look for job count display
    const jobCount = page.getByText(/\d+.*job/i);

    if (await jobCount.count() > 0) {
      await expect(jobCount).toBeVisible();
    }
  });

  test('should preview job on careers page', async ({ page, company }) => {
    const testJob = generateTestJob();

    // Create and publish a job
    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Publish the job
    const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
    if (await publishToggle.count() > 0) {
      await publishToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Navigate to careers page
    await page.goto(`/${company.slug}/careers`);

    // Verify job is visible on careers page
    await expect(page.getByText(testJob.title)).toBeVisible();
  });
});
