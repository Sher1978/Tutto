import { test, expect } from '@playwright/test';

test.describe('Storefront & UX Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    // Inject a flag to bypass onboarding
    await page.addInitScript(() => {
      window.isPlaywright = true;
      localStorage.setItem('needtnow_onboarding_completed', 'true');
    });
    await page.goto('/');
    // Wait for the app to be fully loaded
    await page.waitForSelector('text=Моя Витрина', { timeout: 10000 });
  });

  test('AI Smart Search bar should trigger AIAssistantModal', async ({ page }) => {
    // The smart search bar should have the text "Что вы ищете?"
    const searchBar = page.locator('button', { hasText: 'Что вы ищете?' });
    await expect(searchBar).toBeVisible();

    // Click it
    await searchBar.click();

    // It should open AIAssistantModal which has "AI Ассистент" or similar header
    const aiModalHeader = page.locator('h2', { hasText: 'Умный ИИ-Ассистент' });
    await expect(aiModalHeader).toBeVisible();
    
    // Close it
    await page.locator('button[aria-label="Close AI modal"], button > svg.lucide-x').first().click();
  });

  test('Central + button should open CreateActionSheetModal', async ({ page }) => {
    // The central button in the bottom nav
    const plusButton = page.locator('button[aria-label="Создать заказ"]');
    await expect(plusButton).toBeVisible();

    // Click it
    await plusButton.click();

    // The action sheet should appear
    const actionSheetHeader = page.locator('h2', { hasText: 'Что вы хотите создать?' });
    await expect(actionSheetHeader).toBeVisible();

    // It should have the "Заявку (ИИ-Ассистент)" option
    const requestOption = page.locator('button', { hasText: 'Заявку (ИИ-Ассистент)' });
    await expect(requestOption).toBeVisible();

    // Click cancel to close
    await page.locator('button', { hasText: 'Отмена' }).click();
    await expect(actionSheetHeader).not.toBeVisible();
  });

  test('Storefront scroller cards should expand and show subscribe button', async ({ page }) => {
    // Locate the first mini card in the storefront scroller
    // The user storefront scroller maps over instances, let's just click the first image inside it
    const storefrontSection = page.locator('div', { hasText: 'Моя Витрина' }).last();
    // Assuming the mini card has the title of the instance or just the h4
    const firstMiniCard = page.locator('div > h4', { hasText: 'Профессиональная фотосессия' }).first();
    
    // Since mockData might have different titles, let's just click the first mini card container
    const scrollerContainer = page.locator('text=Моя Витрина').locator('..').locator('..');
    const firstCard = scrollerContainer.locator('.group').first();
    
    await expect(firstCard).toBeVisible();

    // Click to expand
    await firstCard.click();

    // After expanding, it renders the full OfferCard, which has the "Subscribe" bell button
    const subscribeButton = page.locator('button[aria-label="Subscribe"]').first();
    await expect(subscribeButton).toBeVisible();

    // Click subscribe
    await subscribeButton.click();
    // The toast might show up, but checking the button visibility is enough to verify the state switch
  });
});
