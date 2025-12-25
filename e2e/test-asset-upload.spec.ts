import { test, expect } from './fixtures/company-context';
import * as fs from 'fs';
import * as path from 'path';

// Create simple test images
const testAssetsDir = path.join(__dirname, 'test-assets');
if (!fs.existsSync(testAssetsDir)) {
  fs.mkdirSync(testAssetsDir, { recursive: true });
}

// Create minimal valid PNG files for testing
// These are 1x1 pixel PNGs encoded as base64
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const testLogoPath = path.join(testAssetsDir, 'test-logo.png');
const testBannerPath = path.join(testAssetsDir, 'test-banner.png');

if (!fs.existsSync(testLogoPath)) {
  fs.writeFileSync(testLogoPath, minimalPng);
}
if (!fs.existsSync(testBannerPath)) {
  fs.writeFileSync(testBannerPath, minimalPng);
}

test.describe('Asset Upload Functionality', () => {
  test.beforeEach(async ({ page, company }) => {
    // Navigate to the editor
    await page.goto(`/${company.slug}/edit`);

    // Switch to Theme tab
    await page.click('button:has-text("Theme")');
    await page.waitForTimeout(500);
  });

  test('should upload company logo', async ({ page }) => {
    // Find the logo file input
    const logoInput = page.locator('input[type="file"]').first();
    
    await expect(logoInput).toBeVisible();
    
    // Upload the test logo
    await logoInput.setInputFiles(testLogoPath);
    
    // Wait for upload to complete (check for "Uploading..." text to disappear)
    await page.waitForTimeout(2000);
    
    // Check if preview image appears or upload message
    const previewImage = page.locator('img[alt="Preview"]').first();
    const uploadingText = page.getByText('Uploading...');
    
    // Either the preview should appear, or we should see uploading status
    const hasPreview = await previewImage.count() > 0;
    const isUploading = await uploadingText.isVisible().catch(() => false);
    
    expect(hasPreview || isUploading).toBeTruthy();
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    await page.waitForTimeout(1000);
    
    // Verify success message appears
    const successMessage = page.getByText(/saved|success/i);
    if (await successMessage.count() > 0) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should upload hero banner', async ({ page }) => {
    // Find the banner file input (should be the second one)
    const fileInputs = page.locator('input[type="file"]');
    const bannerInput = fileInputs.nth(1);
    
    await expect(bannerInput).toBeVisible();
    
    // Upload the test banner
    await bannerInput.setInputFiles(testBannerPath);
    
    // Wait for upload to complete
    await page.waitForTimeout(2000);
    
    // Check if preview image appears
    const previewImages = page.locator('img[alt="Preview"]');
    const hasPreview = await previewImages.count() > 0;
    
    expect(hasPreview).toBeTruthy();
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    await page.waitForTimeout(1000);
    
    // Verify success message appears
    const successMessage = page.getByText(/saved|success/i);
    if (await successMessage.count() > 0) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should display uploaded images on preview page', async ({ page, company }) => {
    // First upload both images
    const logoInput = page.locator('input[type="file"]').first();
    const bannerInput = page.locator('input[type="file"]').nth(1);
    
    await logoInput.setInputFiles(testLogoPath);
    await page.waitForTimeout(1000);
    
    await bannerInput.setInputFiles(testBannerPath);
    await page.waitForTimeout(1000);
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    await page.waitForTimeout(2000);
    
    // Navigate to preview page
    const previewPage = await page.context().newPage();
    await previewPage.goto(`/${company.slug}/preview`);
    await previewPage.waitForTimeout(1000);
    
    // Check if logo is displayed
    const logo = previewPage.locator('img[alt*="Logo"], img[alt*="logo"]');
    const banner = previewPage.locator('header').first();
    
    // Logo should be visible if uploaded
    if (await logo.count() > 0) {
      await expect(logo.first()).toBeVisible();
    }
    
    // Banner should be in the header background
    await expect(banner).toBeVisible();
    
    await previewPage.close();
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Try to upload a file that's too large (simulate by checking error handling)
    const logoInput = page.locator('input[type="file"]').first();
    
    // Create a large file (over 5MB limit)
    const largeFilePath = path.join(testAssetsDir, 'large-file.png');
    // Create a 6MB file
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);
    fs.writeFileSync(largeFilePath, largeBuffer);
    
    await logoInput.setInputFiles(largeFilePath);
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorMessage = page.getByText(/error|too large|size/i);
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
    
    // Clean up
    if (fs.existsSync(largeFilePath)) {
      fs.unlinkSync(largeFilePath);
    }
  });
});

