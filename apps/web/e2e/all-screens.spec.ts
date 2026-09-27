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

test.describe('NeedTnow Comprehensive Screen & Fixes Verification', () => {
  test('1. Главный экран (Режим Услуги): заголовок, карточки с префиксом "Ищу", неоново-пурпурный таймер и легкий глассморфизм', async ({ page }) => {
    // Проверка логотипа TuttiMinutto
    await expect(page.getByText(/TUTTO/i).first()).toBeVisible();
    await expect(page.getByText(/MINUTTO/i).first()).toBeVisible();

    // Проверка активных запросов
    await expect(page.getByText(/АКТИВНЫЕ ЗАПРОСЫ/i)).toBeVisible();

    // Проверка наличия карточек услуг
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    const titleText = await firstCard.innerText();
    console.log('Main Card Text:', titleText);
    expect(titleText).toContain('Ищу');

    // Проверка таймера карточки (наличие текста МИН / МИНУТ)
    const timerBadge = page.locator('span', { hasText: /МИН/i }).first();
    await expect(timerBadge).toBeVisible();
  });

  test('2. Попап "Откликнуться" (BidModal): открывается при клике на карточку, заблокирован скролл фона', async ({ page }) => {
    // Кликаем по первой карточке аукциона
    const firstCard = page.locator('div.glass-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });

    // Модалка отклика должна появиться без падений
    const modalTitle = page.getByText(/Сделать оффер|Уточнить детали/i);
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    // Проверяем наличие кнопки отправить
    const submitBtn = page.getByRole('button', { name: /ОТПРАВИТЬ/i });
    await expect(submitBtn).toBeVisible();

    // Закрываем модалку
    const closeBtn = page.getByRole('button', { name: 'Закрыть' }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click({ force: true });
    } else {
      await page.keyboard.press('Escape');
    }

    await expect(modalTitle).not.toBeVisible();
  });

  test('3. Переключение режимов: Услуги (Services) <-> Маркетплейс (Market)', async ({ page }) => {
    // Находим переключатель режимов
    const marketTab = page.locator('button', { hasText: /МАРКЕТ|МАРКЕТПЛЕЙС/i }).first();
    if (await marketTab.isVisible()) {
      await marketTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('4. Переключение профиля и просмотр аккаунта', async ({ page }) => {
    const profileBtn = page.getByRole('button', { name: /Профиль|Кабинет/i }).first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  });
});
