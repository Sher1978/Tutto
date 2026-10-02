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

test.describe('Dispute Arbitration & Moderator Admin Panel', () => {
  test('1. Should open Admin Panel from profile, review dispute APL-012, and resolve in favor of client', async ({ page }) => {
    // 1. Navigate to Account tab in BottomNav (last button in nav bar)
    const accountTabBtn = page.locator('nav button').last();
    await expect(accountTabBtn).toBeVisible({ timeout: 5000 });
    await accountTabBtn.click({ force: true });
    await page.waitForTimeout(600);

    // Verify Business Profile rendered (unique RAG knowledge base text)
    await expect(page.getByText(/База знаний ИИ-продавца/i).first()).toBeVisible({ timeout: 5000 });

    // 2. Click Admin Panel DEV button
    const adminBtn = page.locator('[data-testid="admin-panel-btn"]').first();
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click({ force: true });

    // 3. Verify Admin Panel modal opened
    await expect(page.getByText('ADMIN PANEL').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Управление платформой/i).first()).toBeVisible();

    // 4. Verify open disputes list (e.g. APL-012)
    const disputeItem = page.getByText('APL-012').first();
    await expect(disputeItem).toBeVisible();

    // 5. Click dispute card to open details view
    await disputeItem.dispatchEvent('click');

    // 6. Verify detail view
    await expect(page.getByText(/Детали апелляции/i).first()).toBeVisible();
    await expect(page.getByText(/Причина апелляции/i).first()).toBeVisible();

    // 6a. Click "Чат сделки" to see the history
    const chatDealBtn = page.locator('button').filter({ hasText: 'Чат сделки' }).first();
    await expect(chatDealBtn).toBeVisible();
    await chatDealBtn.click({ force: true });
    
    // Verify Deal Chat Modal opens for admin
    await expect(page.getByText(/В процессе/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Спор по сделке DEAL-441/i).first()).toBeVisible();

    // Close Deal Chat Modal
    const closeDealBtn = page.locator('.glass-panel button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeDealBtn.click({ force: true });
    
    // Admin panel is closed when chat is opened. Open it again for the next steps
    await adminBtn.click({ force: true });
    await disputeItem.dispatchEvent('click');

    // 7. Enter resolution reason
    const textarea = page.locator('textarea[placeholder*="основание"]').first();
    await expect(textarea).toBeVisible();
    await textarea.fill('Техника не соответствовала описанию. Возврат средств клиенту.');

    // 8. Click "В пользу Клиента"
    const resolveClientBtn = page.getByRole('button', { name: /В пользу Клиента/i }).first();
    await expect(resolveClientBtn).toBeVisible();
    await resolveClientBtn.click({ force: true });
    await page.waitForTimeout(400);

    // 9. Verify returned to disputes list and APL-012 removed
    await expect(page.getByText('APL-012')).not.toBeVisible();

    // 10. Switch to Market Analytics tab
    const analyticsTab = page.getByRole('button', { name: /Аналитика Барахолки/i }).first();
    await expect(analyticsTab).toBeVisible();
    await analyticsTab.dispatchEvent('click');

    await expect(page.getByText(/Оборот \(GMV\) за 24ч/i).first()).toBeVisible();
    await expect(page.getByText('$12,450').first()).toBeVisible();

    // 11. Close Admin Panel
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.dispatchEvent('click');
  });
});
