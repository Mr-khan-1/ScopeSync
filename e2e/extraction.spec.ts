import { test, expect } from '@playwright/test';

test('has title and can navigate', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ScopeSync/i);
});

test('shows error when extracting without API key', async ({ page }) => {
  await page.goto('/scope/new');
  await page.fill('textarea', 'I need a landing page designed with 4 sections.');
  
  const extractButton = page.locator('button', { hasText: 'Extract Structure' });
  await extractButton.click();
  
  await expect(page.locator('text=Please add your free Gemini API key')).toBeVisible();
});
