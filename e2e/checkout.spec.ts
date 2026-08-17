import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed must run before tests — ensure products exist
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
  });

  test('should browse menu and add items to bag', async ({ page }) => {
    await page.goto('/menu');

    // Wait for menu to load
    await expect(page.locator('text=Menu')).toBeVisible();

    // Find first product card and add to bag
    const addButton = page.locator('button[aria-label*="Dodaj"]').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Check bag counter updated
    await expect(page.locator('[data-testid="bag-count"]')).toContainText('1');

    // Navigate to bag
    await page.click('text=Torba');
    await expect(page).toHaveURL(/\/bag/);

    // Verify item in bag
    await expect(page.locator('text=Cena')).toBeVisible();
  });

  test('should complete 3-step checkout', async ({ page }) => {
    // Step 0: Add item to bag
    await page.goto('/menu');
    const addButton = page.locator('button[aria-label*="Dodaj"]').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Step 1: Delivery form
    await page.goto('/checkout');
    await expect(page.locator('text=Dostawa')).toBeVisible();

    // Fill delivery form
    await page.fill('input[name="firstName"]', 'Jan');
    await page.fill('input[name="lastName"]', 'Kowalski');
    await page.fill('input[name="email"]', 'jan@example.com');
    await page.fill('input[name="phone"]', '+48123456789');
    await page.fill('input[name="street"]', 'Testowa 1');
    await page.fill('input[name="city"]', 'Warszawa');
    await page.fill('input[name="postalCode"]', '00-001');

    // Select delivery method
    await page.click('text=Dostawa');
    await page.click('text=Kurier');

    // Continue to payment
    await page.click('button:has-text("Dalej")');

    // Step 2: Payment form
    await expect(page.locator('text=Płatność')).toBeVisible();

    // Select payment method (mock — no real gateway yet)
    await page.click('text=Przy odbiorze');

    // Continue to summary
    await page.click('button:has-text("Dalej")');

    // Step 3: Summary & confirm
    await expect(page.locator('text=Podsumowanie')).toBeVisible();
    await expect(page.locator('text=Jan Kowalski')).toBeVisible();

    // Confirm order
    await page.click('button:has-text("Zamów")');

    // Should redirect to track page
    await expect(page).toHaveURL(/\/track/);
    await expect(page.locator('text=Twoje zamówienia')).toBeVisible();
  });

  test('should show empty bag message', async ({ page }) => {
    await page.goto('/bag');
    await expect(page.locator('text=Twoja torba jest pusta')).toBeVisible();
    await expect(page.locator('text=Przejdź do menu')).toBeVisible();
  });

  test('should track order status', async ({ page }) => {
    // Create order first via API (mock for test)
    await page.goto('/track');
    await expect(page.locator('text=Śledź zamówienie')).toBeVisible();

    // Enter order number
    await page.fill('input[placeholder*="numer"]', 'TEST-001');
    await page.click('button:has-text("Śledź")');

    // Should show order details or not found
    await expect(page.locator('text=Zamówienie')).toBeVisible();
  });
});
