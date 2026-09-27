import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Token Wallet & Telegram Stars / TON Payment Flow', () => {
  test('Должен открывать кошелек, активировать промокод и оплачивать инвойс Telegram Stars', async ({ page }) => {
    // 1. Открыть кошелек по клику на плашку токенов в Navbar
    const walletBtn = page.getByRole('button', { name: /\d+/ }).first();
    await expect(walletBtn).toBeVisible();
    await walletBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 2. Проверить заголовок "Мой Кошелёк TUTTO" и доступные способы оплаты
    await expect(page.getByText(/Мой Кошелёк TUTTO/i)).toBeVisible();
    await expect(page.getByText(/Stars ⭐/i).first()).toBeVisible();
    await expect(page.getByText(/TON 💎/i).first()).toBeVisible();

    // 3. Переключиться на вкладку "Промокод"
    const promoTab = page.getByRole('button', { name: /Промокод/i }).first();
    await promoTab.click({ force: true });
    await page.waitForTimeout(300);

    // 4. Ввести промокод TEST1000
    const promoInput = page.getByPlaceholder(/TEST1000/i);
    await expect(promoInput).toBeVisible();
    await promoInput.fill('TEST1000');

    const activateBtn = page.getByRole('button', { name: /Активировать/i });
    await activateBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Проверить появление сообщения о начислении
    await expect(page.getByText(/Промокод TEST1000 активирован/i)).toBeVisible();

    // 5. Переключиться на вкладку Stars ⭐ и сформировать инвойс
    const starsTab = page.getByRole('button', { name: /Stars ⭐/i }).first();
    await starsTab.click({ force: true });
    await page.waitForTimeout(300);

    const buyStarsBtn = page.getByRole('button', { name: /50 Stars/i }).first();
    await expect(buyStarsBtn).toBeVisible();
    await buyStarsBtn.click({ force: true });
    await page.waitForTimeout(300);

    // 6. Подтвердить инвойс на оплату
    await expect(page.getByText(/Инвойс на оплату/i)).toBeVisible();
    const confirmPayBtn = page.getByRole('button', { name: /Подтвердить и Оплатить/i });
    await confirmPayBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // 7. Проверить успешное зачисление в истории транзакций
    await expect(page.getByText(/Зачислено \+50 токенов/i)).toBeVisible();

    // 8. Закрыть кошелек
    const closeBtn = page.getByRole('button', { name: 'Закрыть' }).first();
    await closeBtn.click({ force: true });
    await page.waitForTimeout(300);
  });
});
