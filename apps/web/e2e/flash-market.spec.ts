import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Flash Market Creation & Purchase Flow', () => {
  test('Должен пройти полный цикл Flash Market: Переключение в Маркет -> Публикация лота -> Просмотр лота -> Бронирование в P2P-чате', async ({ page }) => {
    // 1. Переключаемся в режим Flash Market
    const marketTabBtn = page.getByRole('button', { name: /FLASH MARKET/i });
    await expect(marketTabBtn).toBeVisible({ timeout: 5000 });
    await marketTabBtn.click({ force: true });

    // 2. Нажимаем центральную кнопку добавления лота в нижнем баре
    const addLotBtn = page.getByRole('button', { name: /Добавить лот/i });
    await expect(addLotBtn).toBeVisible({ timeout: 5000 });
    await addLotBtn.click({ force: true });

    // 3. Открывается модалка "Продать во Flash Market"
    await expect(page.getByText(/Продать во Flash Market/i)).toBeVisible({ timeout: 5000 });

    // 4. Заполняем форму создания лота
    const titleInput = page.getByPlaceholder(/Например: Yamaha NMAX/i);
    await titleInput.fill('Yamaha TMAX 560cc 2024');

    const submitListingBtn = page.getByRole('button', { name: /Опубликовать лот во Flash Market/i });
    await expect(submitListingBtn).toBeVisible();
    await submitListingBtn.click({ force: true });

    // 5. Лот появляется в ленте маркета
    const newLotCard = page.getByText('Yamaha TMAX 560cc 2024').first();
    await expect(newLotCard).toBeVisible({ timeout: 5000 });

    // 6. Кликаем на созданный лот для открытия деталей покупки (MarketBuyModal)
    await newLotCard.click({ force: true });

    // 7. Проверяем детали лота
    await expect(page.getByText(/Детали лота Flash Market/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /ЗАБРОНИРОВАТЬ И НАПИСАТЬ ПРОДАВЦУ/i })).toBeVisible();

    // 8. Нажимаем забронировать и написать продавцу
    const buyActionBtn = page.getByRole('button', { name: /ЗАБРОНИРОВАТЬ И НАПИСАТЬ ПРОДАВЦУ/i });
    await buyActionBtn.click({ force: true });

    // 9. Открывается чат сделки с продавцом (Deal Room)
    await expect(page.getByText(/В процессе/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Покупка: «Yamaha TMAX 560cc 2024»/i)).toBeVisible();
  });
});
