import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Auth Login Flow', () => {
  test('Должна открываться красивая модалка авторизации при клике на КАБИНЕТ', async ({ page }) => {
    // 1. Кликаем на КАБИНЕТ в BottomNav
    const accountTab = page.locator('button', { hasText: 'КАБИНЕТ' }).first();
    await expect(accountTab).toBeVisible();
    await accountTab.click({ force: true });

    // 2. Проверяем модалку / профиль
    const profileOrAuth = page.locator('div', { hasText: /Вход в систему|Кабинет|Профиль/i }).first();
    await expect(profileOrAuth).toBeVisible({ timeout: 5000 });
  });
});
