import { test, expect } from '@playwright/test';

test.describe('PixelGrapher E2E tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
    await page.goto('/');
  });

  test('Page loads and shows correct meta elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/PixelGrapher - GitHub Contribution Graph Art Generator/);

    // Check main headings
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('Paint your GitHub Graph');
  });

  test('Navigation buttons scroll to sections', async ({ page }) => {
    // Click "How it Works" button in header
    const howItWorksButton = page.locator('[data-testid="button-how-it-works"]');
    await expect(howItWorksButton).toBeVisible();
    await howItWorksButton.click();

    // Verify section is visible
    const howItWorksSection = page.locator('#how-it-works');
    await expect(howItWorksSection).toBeVisible();

    // Click "Templates" button in header
    const templatesButton = page.locator('[data-testid="button-templates"]');
    await expect(templatesButton).toBeVisible();
    await templatesButton.click();

    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeVisible();
  });

  test('Canvas interactive controls (Draw, Erase, Clear)', async ({ page }) => {
    // Select canvas grid cells (e.g. cell-0-0 is first day of first week)
    const cell = page.locator('[data-testid="cell-0-0"]');
    await expect(cell).toBeVisible();

    // Toggle draw mode button
    const drawButton = page.locator('[data-testid="button-draw-tool"]');
    await expect(drawButton).toBeVisible();
    await drawButton.click();

    // Click the cell to draw
    await cell.click();

    // Toggle erase mode button
    const eraseButton = page.locator('[data-testid="button-erase-tool"]');
    await expect(eraseButton).toBeVisible();
    await eraseButton.click();

    // Clear canvas button
    const clearButton = page.locator('[data-testid="button-clear-canvas"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();
  });

  test('Keyboard Shortcuts dialog can be toggled', async ({ page }) => {
    // Trigger keyboard shortcuts dialog via pressing '?'
    await page.keyboard.press('?');

    // Confirm dialog is open and shows keyboard shortcuts title
    const dialogTitle = page.getByRole('heading', { name: 'Keyboard Shortcuts' });
    await expect(dialogTitle).toBeVisible();

    // Press Escape to close it
    await page.keyboard.press('Escape');
    await expect(dialogTitle).not.toBeVisible();
  });
});
