import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.beforeEach(async ({ page }) => {
  await injectTelegramMock(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

test.describe('Explore & Search Interface', () => {
  test('Должен открывать раздел ПОИСК, фильтровать по хабам, районам и поисковому запросу', async ({ page }) => {
    // 1. Переключиться в режим Flash Market для отображения навигации Поиска
    const marketPill = page.getByRole('button', { name: /FLASH MARKET|БАРАХОЛКА/i }).first();
    await expect(marketPill).toBeVisible();
    await marketPill.click({ force: true });
    await page.waitForTimeout(300);

    // 2. Перейти на вкладку ПОИСК в BottomNav
    const searchNavBtn = page.getByRole('button', { name: /ПОИСК/i }).first();
    await expect(searchNavBtn).toBeVisible();
    await searchNavBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 3. Проверить отображение поисковой строки и элементов гео-выбора
    const searchInput = page.getByPlaceholder(/Поиск скутера, виллы, обмена/i);
    await expect(searchInput).toBeVisible();
    await expect(page.getByText(/Регион \(Хаб\)/i)).toBeVisible();
    await expect(page.getByText(/Шаблоны в 1 клик/i)).toBeVisible();

    // 4. Проверить фильтрацию по хабу Бали
    const baliHubBtn = page.getByRole('button', { name: /Бали/i }).first();
    await expect(baliHubBtn).toBeVisible();
    await baliHubBtn.click({ force: true });
    await page.waitForTimeout(300);

    // Проверить появление района Canggu
    await expect(page.getByRole('button', { name: /Canggu/i }).first()).toBeVisible();

    // 5. Проверить живой поиск по слову "байк"
    await searchInput.fill('байк');
    await page.waitForTimeout(300);
    await expect(page.getByText(/Найдено предложений/i)).toBeVisible();

    // 6. Проверить сброс фильтров
    const resetBtn = page.getByRole('button', { name: /Сбросить все/i }).first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click({ force: true });
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveValue('');

    // 7. Проверить переключение типов (⚡ Заявки / 🔥 Маркет)
    const auctionsTab = page.getByRole('button', { name: /⚡ Заявки/i }).first();
    await auctionsTab.click({ force: true });
    await page.waitForTimeout(300);
  });
});
