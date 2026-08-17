import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('http://dashboard:3001/login');
    await page.fill('input[type="email"]', 'admin@weboworos.pl');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Przychód')).toBeVisible();
    await expect(page.locator('text=Zamówienia')).toBeVisible();
    await expect(page.locator('text=Użytkownicy')).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.click('text=Zamówienia');
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('text=Lista zamówień')).toBeVisible();
  });

  test('should navigate to KDS page', async ({ page }) => {
    await page.click('text=KDS');
    await expect(page).toHaveURL(/\/kds/);
    await expect(page.locator('text=Kuchnia')).toBeVisible();
  });

  test('should create and delete product', async ({ page }) => {
    await page.goto('http://dashboard:3001/products');
    await expect(page).toHaveURL(/\/products/);

    // Click add product
    await page.click('text=Dodaj produkt');

    // Fill product form
    await page.fill('input[name="name"]', 'Test Pizza E2E');
    await page.fill('textarea[name="description"]', 'Pizza stworzona przez test E2E');
    await page.fill('input[name="price"]', '29.99');
    await page.selectOption('select[name="categoryId"]', { index: 0 });

    // Save product
    await page.click('button:has-text("Zapisz")');

    // Verify product appears in list
    await expect(page.locator('text=Test Pizza E2E')).toBeVisible();

    // Delete product
    await page.click('text=Test Pizza E2E');
    await page.click('text=Usuń');
    await page.click('button:has-text("Potwierdź")');

    // Verify product removed
    await expect(page.locator('text=Test Pizza E2E')).not.toBeVisible();
  });

  test('should update order status in KDS', async ({ page }) => {
    await page.goto('http://dashboard:3001/kds');
    await expect(page.locator('text=Kuchnia')).toBeVisible();

    // Check if there are any orders
    const orders = page.locator('[data-testid="kds-card"]');
    const count = await orders.count();

    if (count > 0) {
      // Move first order to next column
      await orders.first().click();
      await page.click('text=Następny status');

      // Verify status changed
      await expect(page.locator('text=Przygotowanie')).toBeVisible();
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No orders in KDS' });
    }
  });
});
