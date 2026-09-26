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

    // 2. Проверяем, что отобразилась лента товаров Маркета и строка поиска
    await expect(page.getByText(/ГОРЯЩИЕ ТОВАРЫ/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/Поиск по названию или описанию/i)).toBeVisible();

    // 3. Тестируем живой поиск товара
    const searchInput = page.getByPlaceholder(/Поиск по названию или описанию/i);
    await searchInput.fill('Yamaha');
    await expect(page.getByText(/Yamaha/i).first()).toBeVisible();
  });
});
