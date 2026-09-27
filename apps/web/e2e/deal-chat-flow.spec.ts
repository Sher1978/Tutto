import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('P2P Deal Chat Flow (Binance P2P Gamified Model)', () => {
  test('Должен пройти полный цикл P2P-сделки: Отклик -> Подтверждение работы -> Отзыв (+15 Coins)', async ({ page }) => {
    // 1. Кликаем на первою карточку для открытия модалки отклика
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });

    // 2. Нажимаем кнопку "ОТПРАВИТЬ ОФФЕР"
    const submitOfferBtn = page.getByRole('button', { name: /ОТПРАВИТЬ/i });
    await expect(submitOfferBtn).toBeVisible({ timeout: 5000 });
    await submitOfferBtn.click({ force: true });

    // 3. Открывается окно чата сделки (Deal Room)
    const chatStatus = page.getByText(/В процессе/i).first();
    await expect(chatStatus).toBeVisible({ timeout: 5000 });

    // 4. Проверяем плашку безопасности без эскроу
    await expect(page.getByText(/Безопасность Sherlock Deals/i)).toBeVisible();

    // 5. Тестируем переключатель ролей (Бизнес / Исполнитель)
    const roleToggleBtn = page.locator('button', { hasText: /Роль:/i }).first();
    await expect(roleToggleBtn).toBeVisible();
    await roleToggleBtn.click({ force: true }); // Switch to Provider role

    // 6. Исполнитель нажимает "Услуга оказана"
    const providerDoneBtn = page.getByRole('button', { name: /УСЛУГА ОКАЗАНА/i });
    await expect(providerDoneBtn).toBeVisible();
    await providerDoneBtn.click({ force: true });

    // Status updates to awaiting confirmation
    await expect(page.getByText(/Ждёт подтверждения/i).first()).toBeVisible();

    // 7. Переключаемся обратно на Клиента
    await roleToggleBtn.click({ force: true });

    // 8. Клиент нажимает "ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ (+15 Coins)"
    const clientConfirmBtn = page.getByRole('button', { name: /ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ/i });
    await expect(clientConfirmBtn).toBeVisible();
    await clientConfirmBtn.click({ force: true });

    // 9. Открывается окно отзыва
    await expect(page.getByText(/Оставить отзыв Исполнителю/i)).toBeVisible();
    await expect(page.getByText(/\+15 Coins/i).first()).toBeVisible();

    // 10. Публикуем отзыв
    const submitReviewBtn = page.getByRole('button', { name: /Опубликовать отзыв/i });
    await expect(submitReviewBtn).toBeVisible({ timeout: 5000 });
    await submitReviewBtn.click({ force: true });

    // 11. Сделка успешно закрыта
    await expect(page.getByText(/Сделка закрыта/i).first()).toBeVisible({ timeout: 5000 });
  });
});
