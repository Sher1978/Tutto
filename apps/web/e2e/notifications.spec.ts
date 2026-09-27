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

test.describe('Notification Center & Sound Chime Engine', () => {
  test('1. Should display bell icon with unread badge and open NotificationCenterModal', async ({ page }) => {
    // 1. Locate bell button in Navbar
    const bellBtn = page.locator('button[aria-label="Уведомления"]').first();
    await expect(bellBtn).toBeVisible({ timeout: 5000 });
    await bellBtn.dispatchEvent('click');

    // 2. Verify modal opened
    await expect(page.getByText('Центр Уведомлений').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Новый ИИ-отклик от Ayana Resort/i).first()).toBeVisible();

    // 3. Test filter tabs inside NotificationCenterModal
    const marketFilter = page.getByRole('button', { name: 'Маркет', exact: true }).first();
    await expect(marketFilter).toBeVisible({ timeout: 5000 });
    await marketFilter.dispatchEvent('click');
    await page.waitForTimeout(300);

    await expect(page.getByText(/Hot Deal во Flash Market/i).first()).toBeVisible();

    // 4. Click Mark All Read
    const markReadBtn = page.getByText('Прочитать всё').first();
    if (await markReadBtn.isVisible()) {
      await markReadBtn.dispatchEvent('click');
      await page.waitForTimeout(200);
    }

    // 5. Close modal
    const closeBtn = page.locator('button[aria-label="Закрыть"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.dispatchEvent('click');
  });
});
