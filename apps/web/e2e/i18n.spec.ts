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

  test('2. Should switch language to English and update UI labels dynamically', async ({ page }) => {
    // Open language dropdown
    const langBtn = page.getByRole('button', { name: 'Переключить язык' }).first();
    await expect(langBtn).toBeVisible();
    await langBtn.click({ force: true });
    await page.waitForTimeout(300);

    // Click English option
    const enOption = page.locator('button', { hasText: 'English' }).first();
    await expect(enOption).toBeVisible();
    await enOption.click({ force: true });
    await page.waitForTimeout(500);

    // Verify translated elements
    await expect(page.getByText('REVERSE SERVICE AUCTION').first()).toBeVisible();
    await expect(page.getByText('🛠 SERVICES & RENTALS').first()).toBeVisible();
    await expect(page.getByText('HOME').first()).toBeVisible();
    await expect(page.getByText('MY BIDS').first()).toBeVisible();
  });

  test('3. Should switch language to Thai and Chinese successfully', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: 'Переключить язык' }).first();

    // Switch to Thai (TH)
    await langBtn.click({ force: true });
    await page.waitForTimeout(300);

    const thOption = page.locator('button', { hasText: 'ไทย' }).first();
    await expect(thOption).toBeVisible();
    await thOption.click({ force: true });
    await page.waitForTimeout(500);

    await expect(page.getByText('การประมูลบริการย้อนกลับ').first()).toBeVisible();

    // Switch to Chinese (ZH)
    await langBtn.click({ force: true });
    await page.waitForTimeout(300);

    const zhOption = page.locator('button', { hasText: '中文' }).first();
    await expect(zhOption).toBeVisible();
    await zhOption.click({ force: true });
    await page.waitForTimeout(500);

    await expect(page.getByText('服务反向拍卖平台').first()).toBeVisible();
  });
});
