import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Создание заявки (Quick Request Flow)', () => {
  test('Должен пройти полный цикл создания заявки', async ({ page }) => {
    // 1. Находим центральную кнопку (FAB) с иконкой плюса и кликаем
    const fabButton = page.locator('button', { has: page.locator('svg.lucide-plus') }).first();
    await expect(fabButton).toBeVisible();
    await fabButton.click({ force: true });

    // 2. Открывается ИИ-Ассистент, нажимаем кнопку "Skip" (Пропустить к ручному вводу)
    const skipButton = page.getByText('Skip ➔').first();
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    await skipButton.click({ force: true });

    // 3. Проверяем, что открылась модалка формы ручного ввода
    await expect(page.getByText('Создать заказ')).toBeVisible({ timeout: 5000 });

    // 3. Заполняем форму
    const titleInput = page.locator('input[placeholder*="Например: Нужна аренда"]').first();
    await titleInput.fill('Автотест: Нужен фотограф на Бали');
    
    // 4. Публикуем заявку
    await titleInput.press('Enter');

    // 5. Модалка должна закрыться
    await expect(page.getByText('Создать заказ')).not.toBeVisible({ timeout: 5000 });
  });
});
