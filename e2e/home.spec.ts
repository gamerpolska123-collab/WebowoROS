import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WebowoROS/);
    await expect(page.locator('text=Zamówienia Online')).toBeVisible();
  });

  test('should navigate to menu', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Menu');
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator('text=Menu')).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Zaloguj');
    await expect(page).toHaveURL(/\/login/);
  });

  test('PWA manifest should be valid', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toBe('Restaurant Order System');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
  });

  test('service worker should be accessible', async ({ page }) => {
    const response = await page.goto('/sw.js');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('self.addEventListener');
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /pizzeria/);

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });

  test('should show offline page', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.locator('text=Jesteś offline')).toBeVisible();
  });
});
