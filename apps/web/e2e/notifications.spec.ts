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
    // 1. Locate user avatar notifications badge in Navbar
    const notifBtn = page.locator('div[title="Уведомления и профиль"]').first();
    await expect(notifBtn).toBeVisible({ timeout: 5000 });
    await notifBtn.dispatchEvent('click');

    // 2. Verify modal opened
    await expect(page.getByText('Центр Уведомлений').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Новый ИИ-отклик от Ayana Resort/i).first()).toBeVisible();

    // 3. Test filter tabs inside NotificationCenterModal
    const marketFilter = page.getByText('Маркет').first();
    await expect(marketFilter).toBeVisible({ timeout: 5000 });
    await marketFilter.dispatchEvent('click');
    await page.waitForTimeout(300);

    await expect(page.getByText(/Hot Deal во Flash Market|Горящее предложение в Барахолке/i).first()).toBeVisible();

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
