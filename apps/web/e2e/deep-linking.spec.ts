import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.describe('Deep Linking & Virality Engine (t.me/NeedTnow_bot/app?startapp=...)', () => {
  test('1. Should auto-open BidModal when launched with ?startapp=req_req-bike deep link', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).isPlaywright = true;
    });
    await injectTelegramMock(page);
    await page.goto('/?startapp=req_req-bike');
    await page.waitForLoadState('domcontentloaded');

    // Verify BidModal automatically opened for requested item
    await expect(page.getByText('НУЖЕН БАЙК').first()).toBeVisible({ timeout: 10000 });

    // Verify "Поделиться" button is present and clickable
    const shareBtn = page.getByRole('button', { name: /Поделиться/i }).first();
    await expect(shareBtn).toBeVisible();
    await shareBtn.dispatchEvent('click');

    // Close modal
    const closeBtn = page.locator('button[aria-label="Закрыть"]').first();
    await closeBtn.dispatchEvent('click');
  });

  test('2. Should auto-open MarketBuyModal when launched with ?startapp=mkt_mkt-1 deep link', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).isPlaywright = true;
    });
    await injectTelegramMock(page);
    await page.goto('/?startapp=mkt_prod-1');
    await page.waitForLoadState('domcontentloaded');

    // Verify MarketBuyModal automatically opened
    await expect(page.getByText(/Детали лота Flash Market/i).first()).toBeVisible({ timeout: 5000 });
    
    // Verify Share to Telegram button
    const shareMarketBtn = page.getByText(/Поделиться лотом в Telegram/i).first();
    await expect(shareMarketBtn).toBeVisible();
    await shareMarketBtn.dispatchEvent('click');
  });
});
