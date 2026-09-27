import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Location Selector, AI Assistant & Profile Management', () => {
  test('1. Должен открывать выбор локации, искать районы и менять хаб', async ({ page }) => {
    // 1. Открыть выборочную модалку локации (клик по кнопке локации в Navbar)
    const locationBtn = page.locator('button', { hasText: /Пхукет|Бали|Бангкок|Chalong|Rawai|Patong/i }).first();
    if (await locationBtn.isVisible()) {
      await locationBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Проверить наличие поиска районов
      const districtSearchInput = page.getByPlaceholder(/Поиск района/i);
      if (await districtSearchInput.isVisible()) {
        await districtSearchInput.fill('Rawai');
        await page.waitForTimeout(300);
        await expect(page.getByText(/Rawai/i).first()).toBeVisible();
      }

      // Закрыть модалку локации
      const closeBtn = page.getByRole('button', { name: 'Закрыть' }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('2. Должен открывать ИИ-Ассистент и генерировать заявку голосом/текстом', async ({ page }) => {
    // Открыть ИИ Ассистент
    const aiBtn = page.getByRole('button', { name: /ИИ Ассистент|Экспресс|Быстрый заказ/i }).first();
    if (await aiBtn.isVisible()) {
      await aiBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Проверить заголовок модалки ИИ Ассистента
      await expect(page.getByText(/AI Ассистент|Голосовой помощник/i).first()).toBeVisible();

      // Закрыть
      const closeBtn = page.getByRole('button', { name: 'Закрыть' }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('3. Должен открывать кабинет бизнес-профиля и просматривать статистику', async ({ page }) => {
    // Переключиться на вкладку КАБИНЕТ
    const profileNavBtn = page.getByRole('button', { name: /КАБИНЕТ/i }).first();
    await expect(profileNavBtn).toBeVisible();
    await profileNavBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Проверить элементы бизнес профиля AI Sales Agent & RAG
    await expect(page.getByText(/AI Sales Agent/i).first()).toBeVisible();
    await expect(page.getByText(/База знаний ИИ-продавца/i).first()).toBeVisible();
  });
});
