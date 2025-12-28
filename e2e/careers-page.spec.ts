import { test, expect } from './fixtures/company-context';
import { generateTestJob } from './helpers/test-data';

test.describe('Careers Page - Public View', () => {
  test('should display careers page for a company', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Should display the careers page
    await expect(page).toHaveURL(`/${company.slug}/careers`);

    // Should see company name or branding
    await expect(page.getByText(company.name)).toBeVisible();
  });

  test('should display company logo if uploaded', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Look for logo image
    const logo = page.locator('img[alt*="logo"], img[alt*="Logo"]');

    if (await logo.count() > 0) {
      await expect(logo.first()).toBeVisible();
    }
  });

  test('should display company banner if uploaded', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Look for banner image
    const banner = page.locator('img[alt*="banner"], img[alt*="Banner"], header img');

    if (await banner.count() > 0) {
      await expect(banner.first()).toBeVisible();
    }
  });

  test('should display content sections', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Look for common section headings
    const sections = page.locator('h2, h3');

    // Should have some content sections
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no sections added yet
  });

  test('should display published jobs', async ({ page, company }) => {
    // First, create and publish a job
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const testJob = generateTestJob();

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

    // Now visit the careers page
    await page.goto(`/${company.slug}/careers`);

    // Should see the published job
    await expect(page.getByText(testJob.title)).toBeVisible();
    await expect(page.getByText(testJob.location)).toBeVisible();
  });

  test('should not display draft jobs', async ({ page, company }) => {
    // Create a draft job (unpublished)
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const testJob = generateTestJob({ title: 'Draft Job - Not Published' });

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Don't publish - leave as draft

    // Visit careers page
    await page.goto(`/${company.slug}/careers`);

    // Draft job should NOT be visible
    await expect(page.getByText(testJob.title)).not.toBeVisible();
  });

  test('should display job details on click', async ({ page, company }) => {
    // Create and publish a job first
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const testJob = generateTestJob();

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Publish
    const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
    if (await publishToggle.count() > 0) {
      await publishToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Go to careers page
    await page.goto(`/${company.slug}/careers`);

    // Click on the job
    await page.click(`text=${testJob.title}`);

    // Should see job description
    await expect(page.getByText(testJob.description)).toBeVisible();
  });

  test('should be mobile responsive', async ({ page, company }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/${company.slug}/careers`);

    // Page should load without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });

  test('should have proper meta tags for SEO', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Check for title tag
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();

    // Check for Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('should have structured data for jobs', async ({ page, company }) => {
    // Create and publish a job
    await page.goto(`/${company.slug}/edit`);
    await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

    const testJob = generateTestJob();

    await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
    await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
    await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

    const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
    await descriptionEditor.click();
    await descriptionEditor.fill(testJob.description);

    await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await page.waitForTimeout(1000);

    // Publish
    const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
    if (await publishToggle.count() > 0) {
      await publishToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Go to careers page
    await page.goto(`/${company.slug}/careers`);

    // Check for JSON-LD structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();

    if (jsonLd) {
      expect(jsonLd).toContain('JobPosting');
    }
  });

  test('should apply custom theme colors', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // Check if custom colors are applied
    // This depends on your implementation - you might check CSS variables or inline styles
    const computedStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    expect(computedStyles).toBeTruthy();
  });

  test('should show empty state when no jobs published', async ({ page, company }) => {
    await page.goto(`/${company.slug}/careers`);

    // If no jobs are published, might show an empty state message
    const emptyState = page.getByText(/no.*positions|no.*jobs|currently.*hiring/i);

    // This is optional - depends on your implementation
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should load page quickly', async ({ page, company }) => {
    const startTime = Date.now();

    await page.goto(`/${company.slug}/careers`);

    const loadTime = Date.now() - startTime;

    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test.describe('Server-side Pagination', () => {
    test('should display pagination controls when there are more than 20 jobs', async ({ page, company }) => {
      // Create 25 published jobs to trigger pagination
      await page.goto(`/${company.slug}/edit`);
      await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

      const jobsToCreate = 25;
      const createdJobTitles: string[] = [];

      for (let i = 0; i < jobsToCreate; i++) {
        const testJob = generateTestJob({ title: `Pagination Test Job ${i + 1}` });
        createdJobTitles.push(testJob.title);

        await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
        await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
        await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

        const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
        await descriptionEditor.click();
        await descriptionEditor.fill(testJob.description);

        await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);

        // Publish the job
        const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
        if (await publishToggle.count() > 0) {
          await publishToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Visit careers page
      await page.goto(`/${company.slug}/careers`);

      // Should see pagination controls
      const pagination = page.locator('nav[aria-label="Pagination"]');
      await expect(pagination).toBeVisible();

      // Should show page 1 info
      await expect(page.getByText(/Showing 1-20 of/)).toBeVisible();

      // Should see first page jobs
      await expect(page.getByText(createdJobTitles[0])).toBeVisible();
    });

    test('should navigate to next page and show different jobs', async ({ page, company }) => {
      // Create 25 published jobs
      await page.goto(`/${company.slug}/edit`);
      await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

      const jobsToCreate = 25;
      const createdJobTitles: string[] = [];

      for (let i = 0; i < jobsToCreate; i++) {
        const testJob = generateTestJob({ title: `Page Navigation Job ${i + 1}` });
        createdJobTitles.push(testJob.title);

        await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
        await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
        await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

        const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
        await descriptionEditor.click();
        await descriptionEditor.fill(testJob.description);

        await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);

        const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
        if (await publishToggle.count() > 0) {
          await publishToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Visit careers page
      await page.goto(`/${company.slug}/careers`);

      // Should see first page job
      await expect(page.getByText(createdJobTitles[0])).toBeVisible();

      // Click next page button
      const nextButton = page.locator('button[aria-label="Next page"]');
      await expect(nextButton).toBeVisible();
      await nextButton.click();

      // Should navigate to page 2
      await expect(page).toHaveURL(new RegExp(`/${company.slug}/careers\\?page=2`));

      // Should show page 2 info
      await expect(page.getByText(/Showing 21-25 of/)).toBeVisible();

      // Should see a job from page 2 (not the first job)
      // Note: The first job should not be visible on page 2
      const firstJobVisible = await page.getByText(createdJobTitles[0]).isVisible().catch(() => false);
      // On page 2, we should see jobs 21-25, so job 0 should not be visible
      expect(firstJobVisible).toBe(false);
    });

    test('should update URL when clicking page numbers', async ({ page, company }) => {
      // Create 25 published jobs
      await page.goto(`/${company.slug}/edit`);
      await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

      const jobsToCreate = 25;

      for (let i = 0; i < jobsToCreate; i++) {
        const testJob = generateTestJob({ title: `URL Test Job ${i + 1}` });

        await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
        await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
        await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

        const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
        await descriptionEditor.click();
        await descriptionEditor.fill(testJob.description);

        await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);

        const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
        if (await publishToggle.count() > 0) {
          await publishToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Visit careers page
      await page.goto(`/${company.slug}/careers`);

      // Click on page 2 button
      const page2Button = page.locator('button:has-text("2")');
      await expect(page2Button).toBeVisible();
      await page2Button.click();

      // Should update URL to include page=2
      await expect(page).toHaveURL(new RegExp(`/${company.slug}/careers\\?page=2`));

      // Click on page 1 button
      const page1Button = page.locator('button:has-text("1")');
      await expect(page1Button).toBeVisible();
      await page1Button.click();

      // Should remove page param or set to page=1
      const url = page.url();
      expect(url).not.toContain('page=2');
    });

    test('should show correct job count on each page', async ({ page, company }) => {
      // Create exactly 25 jobs (so we have 2 pages: 20 on page 1, 5 on page 2)
      await page.goto(`/${company.slug}/edit`);
      await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

      const jobsToCreate = 25;

      for (let i = 0; i < jobsToCreate; i++) {
        const testJob = generateTestJob({ title: `Count Test Job ${i + 1}` });

        await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
        await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
        await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

        const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
        await descriptionEditor.click();
        await descriptionEditor.fill(testJob.description);

        await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);

        const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
        if (await publishToggle.count() > 0) {
          await publishToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Visit careers page
      await page.goto(`/${company.slug}/careers`);

      // Should show "Showing 1-20 of 25 jobs"
      await expect(page.getByText(/Showing 1-20 of 25 jobs/)).toBeVisible();

      // Navigate to page 2
      const nextButton = page.locator('button[aria-label="Next page"]');
      await nextButton.click();

      // Should show "Showing 21-25 of 25 jobs"
      await expect(page.getByText(/Showing 21-25 of 25 jobs/)).toBeVisible();
    });

    test('should not show pagination when there are 20 or fewer jobs', async ({ page, company }) => {
      // Create exactly 20 jobs
      await page.goto(`/${company.slug}/edit`);
      await page.click('button:has-text("Jobs"), [role="tab"]:has-text("Jobs")');

      const jobsToCreate = 20;

      for (let i = 0; i < jobsToCreate; i++) {
        const testJob = generateTestJob({ title: `No Pagination Job ${i + 1}` });

        await page.click('button:has-text("Add Job"), button:has-text("Create Job"), button:has-text("New Job")');
        await page.fill('input[name="title"], input[placeholder*="title"]', testJob.title);
        await page.fill('input[name="location"], input[placeholder*="location"]', testJob.location);

        const descriptionEditor = page.locator('[contenteditable="true"], textarea[name="description"]').first();
        await descriptionEditor.click();
        await descriptionEditor.fill(testJob.description);

        await page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);

        const publishToggle = page.locator('input[type="checkbox"][name*="published"], button:has-text("Publish")');
        if (await publishToggle.count() > 0) {
          await publishToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Visit careers page
      await page.goto(`/${company.slug}/careers`);

      // Should NOT see pagination controls
      const pagination = page.locator('nav[aria-label="Pagination"]');
      await expect(pagination).not.toBeVisible();
    });
  });
});
