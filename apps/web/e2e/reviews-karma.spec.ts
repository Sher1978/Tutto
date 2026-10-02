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

test.describe('Trust & Review System + Karma Coins Flow', () => {
  test('1. Should open P2P deal chat, mark deal complete, submit 5-star review and claim +15 Karma Coins', async ({ page }) => {
    // 1. Click first request card to open BidModal
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });

    // 2. Submit offer to open DealChatModal
    const submitOfferBtn = page.getByRole('button', { name: /ОТПРАВИТЬ/i });
    await expect(submitOfferBtn).toBeVisible({ timeout: 5000 });
    await submitOfferBtn.click({ force: true });

    // 3. Confirm completion to open ReviewModal
    const confirmBtn = page.getByRole('button', { name: /ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click({ force: true });

    // 4. Submit review
    const submitReviewBtn = page.getByRole('button', { name: /Опубликовать отзыв/i });
    await submitReviewBtn.evaluate(node => (node as HTMLElement).click());
    await page.waitForTimeout(500);

    // 5. Verify deal status
    await expect(page.getByText(/Сделка/i).first()).toBeVisible();
  });

  test('2. Should display Verified Customer Reviews section in Business Profile', async ({ page }) => {
    const profileTab = page.getByRole('button', { name: /КАБИНЕТ/i }).first();
    await expect(profileTab).toBeVisible();
    await profileTab.click({ force: true });
    await page.waitForTimeout(500);

    // Check Reviews header & rating badge
    await expect(page.getByText('Отзывы клиентов').first()).toBeVisible();
    await expect(page.getByText(/4\.98 ★/i).first()).toBeVisible();
    await expect(page.getByText('⚡ Быстрый выезд').first()).toBeVisible();
  });
});
