import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).isPlaywright = true;
  });
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('i18n Multi-Language Support (RU, EN, TH, ZH)', () => {
  test('1. Should display default Russian language UI elements', async ({ page }) => {
    await expect(page.getByText('ОБРАТНЫЙ АУКЦИОН УСЛУГ').first()).toBeVisible();
    await expect(page.getByText('🛠 УСЛУГИ И АРЕНДА').first()).toBeVisible();
    await expect(page.getByText('ГЛАВНАЯ').first()).toBeVisible();
  });

  test('2. Should open Language Switcher and switch to English (EN)', async ({ page }) => {
    // 1. Click Language Switcher pill in Navbar
    const langBtn = page.locator('button[aria-label="Переключить язык"]').first();
    await expect(langBtn).toBeVisible();
    await langBtn.dispatchEvent('click');

    // 2. Select English (EN)
    const enOption = page.getByText(/English/i).first();
    await expect(enOption).toBeVisible();
    await enOption.dispatchEvent('click');

    // 3. Verify English UI elements
    await expect(page.getByText('REVERSE SERVICE AUCTION').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('🛠 SERVICES & RENTALS').first()).toBeVisible();
    await expect(page.getByText('HOME').first()).toBeVisible();
  });
});
