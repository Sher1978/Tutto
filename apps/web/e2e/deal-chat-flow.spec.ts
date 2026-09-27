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

test.describe('P2P Deal Chat Flow (Binance P2P Gamified Model)', () => {
  test('Должен пройти полный цикл P2P-сделки: Отклик -> Подтверждение работы -> Отзыв (+15 Coins)', async ({ page }) => {
    // 1. Кликаем на первую карточку для открытия модалки отклика
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });

    // 2. Нажимаем кнопку "ОТПРАВИТЬ ОФФЕР"
    const submitOfferBtn = page.getByRole('button', { name: /ОТПРАВИТЬ/i });
    await expect(submitOfferBtn).toBeVisible({ timeout: 5000 });
    await submitOfferBtn.click({ force: true });

    // 3. Открывается окно чата сделки (Deal Room)
    await expect(page.getByText(/В процессе/i).first()).toBeVisible({ timeout: 5000 });

    // 4. Клиент нажимает "ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ (+15 Coins)"
    const clientConfirmBtn = page.getByRole('button', { name: /ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ/i });
    await expect(clientConfirmBtn).toBeVisible({ timeout: 5000 });
    await clientConfirmBtn.click({ force: true });

    // 5. Открывается окно отзыва
    await expect(page.getByText(/Оценка качества сделки/i).first()).toBeVisible();
    await expect(page.getByText(/\+15 TUTTO Coins/i).first()).toBeVisible();

    // 6. Публикуем отзыв
    const submitReviewBtn = page.getByRole('button', { name: /Опубликовать отзыв/i });
    await expect(submitReviewBtn).toBeVisible({ timeout: 5000 });
    await submitReviewBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 7. Сделка успешно закрыта
    await expect(page.getByText(/Сделка/i).first()).toBeVisible();
  });
});
