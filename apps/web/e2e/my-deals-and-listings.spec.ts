import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('My Deals & Listings Management View', () => {
  test('Должен отображать разделы Мои Заявки, Мои Лоты и Мои Отклики с возможностью перехода в чат сделки', async ({ page }) => {
    // 1. Кликаем на таб "ОТКЛИКИ" в нижнем баре
    const myBidsTabBtn = page.getByRole('button', { name: /ОТКЛИКИ|МОЁ/i }).first();
    await expect(myBidsTabBtn).toBeVisible({ timeout: 5000 });
    await myBidsTabBtn.click({ force: true });

    // 2. Проверяем наличие заголовка управления и суб-табов
    await expect(page.getByText(/Управление и Мои записи/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/📋 Мои Заявки/i)).toBeVisible();
    await expect(page.getByText(/🔥 Мои Лоты/i)).toBeVisible();
    await expect(page.getByText(/⭐ Мои Отклики/i)).toBeVisible();

    // 3. Переключаемся на суб-таб "⭐ Мои Отклики"
    const myBidsSubTab = page.getByText(/⭐ Мои Отклики/i);
    await myBidsSubTab.click({ force: true });

    // 4. Проверяем отклик исполнителя
    await expect(page.getByText(/PRO Отклик/i).first()).toBeVisible({ timeout: 5000 });

    // 5. Кликаем "Перейти в чат сделки"
    const openChatBtn = page.getByRole('button', { name: /Перейти в чат сделки/i }).first();
    await expect(openChatBtn).toBeVisible();
    await openChatBtn.click({ force: true });

    // 6. Открывается окно чата сделки (Deal Room)
    await expect(page.getByText(/В процессе/i).first()).toBeVisible({ timeout: 5000 });
  });
});
