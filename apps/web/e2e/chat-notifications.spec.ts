import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page, context }) => {
  // Grant browser notification permissions for the context
  await context.grantPermissions(['notifications']);
  
  await page.addInitScript(() => {
    (window as any).isPlaywright = true;
  });
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Chat Notifications and Push', () => {
  test('Should test push notifications and unread badges for deal chats', async ({ page }) => {
    // 1. Enable Push Notifications through UI (Notification Center)
    const notifBtn = page.locator('div[title="Уведомления и профиль"]').first();
    await expect(notifBtn).toBeVisible({ timeout: 5000 });
    await notifBtn.click({ force: true });
    
    // Ensure modal opens
    await expect(page.getByText('Центр Уведомлений').first()).toBeVisible({ timeout: 5000 });
    
    const pushPermissionBtn = page.locator('button[title="Разрешить Браузерные Push-уведомления"]').first();
    await expect(pushPermissionBtn).toBeVisible({ timeout: 5000 });
    await pushPermissionBtn.click({ force: true });
    
    // Close Notification Center
    const closeBtn = page.locator('button[aria-label="Закрыть"]').first();
    await closeBtn.click();

    // 2. Open a deal chat by creating a bid
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });
    
    const submitOfferBtn = page.getByRole('button', { name: /ОТПРАВИТЬ/i });
    await expect(submitOfferBtn).toBeVisible();
    await submitOfferBtn.click({ force: true });
    
    // Wait for the Deal Chat modal to open
    await expect(page.getByText(/В процессе/i).first()).toBeVisible({ timeout: 5000 });
    
    // 3. Send a message as a client
    const chatInput = page.locator('input[placeholder="Напишите сообщение..."]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Здравствуйте, все готово?');
    await chatInput.press('Enter');

    // 4. Wait for auto-reply (simulated provider reply in 1800ms)
    // The auto reply will trigger onNewMessage which increments unreadChatCount
    await expect(page.getByText('Принято! Все условия согласованы.')).toBeVisible({ timeout: 4000 });

    // 5. Close DealChatModal to see the badge
    const closeDealBtn = page.locator('.glass-panel button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeDealBtn.click({ force: true });
    
    // 6. Verify the unread badge is updated on BottomNav (should show '1')
    // Look for the span inside nav that has class containing 'bg-[#00F2FE]' and text '1'
    const chatTabBadge = page.locator('nav span').filter({ hasText: '1' }).first();
    await expect(chatTabBadge).toBeVisible();

    // 7. Click Chat tab to reset badge
    const chatTab = page.locator('nav button').filter({ hasText: /ЧАТ/i });
    await chatTab.click({ force: true });

    // Badge should disappear
    await expect(chatTabBadge).not.toBeVisible();
  });
});
