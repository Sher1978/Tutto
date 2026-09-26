import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('TMA Dual-Mode & Market Interface', () => {
  test('Должен отображать шапку и переключаться между Услуги и Маркетом', async ({ page }) => {
    // 1. Клик по переключателю Flash Market в PillSwitcher
    const marketPill = page.getByRole('button', { name: /FLASH MARKET/i }).first();
    await expect(marketPill).toBeVisible();
    await marketPill.click({ force: true });
    await page.waitForTimeout(500);

    // 2. Проверяем, что отобразилась лента товаров Маркета
    await expect(page.getByText(/ГОРЯЩИЕ ТОВАРЫ/i).first()).toBeVisible({ timeout: 5000 });
  });
});
