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
});
