import { expect, test } from '@playwright/test';

/** User Story 1 — calories for a product, and for a whole dish, both ending in the diary. */
test.describe('US1 · Log a meal', () => {
  test('adds a product serving from the sheet, then undoes it', async ({ page }) => {
    await page.goto('/');
    const gauge = page.getByRole('meter', { name: 'Calories remaining today' });
    await expect(gauge).toHaveAttribute('aria-valuenow', '610');

    await page.getByRole('button', { name: 'Add to diary' }).click();
    const sheet = page.getByRole('dialog', { name: 'Add to diary' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: /Add a product/ }).click();

    await expect(page).toHaveURL(/\/add\/search/);
    await page.getByRole('searchbox', { name: 'Search foods and brands' }).fill('greek');
    await page.getByRole('button', { name: /Greek Yogurt, 2%/ }).click();

    await expect(page).toHaveURL(/\/add\/product\/greek-yogurt-2/);
    await page.getByRole('radio', { name: '150 g' }).click();
    await page.getByRole('button', { name: 'Add 110 kcal to Diary' }).click();

    await expect(page).toHaveURL('/');
    const toast = page.getByRole('status');
    await expect(toast).toContainText('Greek Yogurt, 2% · 110 kcal');
    await expect(gauge).toHaveAttribute('aria-valuenow', '500');

    await toast.getByRole('button', { name: 'Undo' }).click();
    await expect(gauge).toHaveAttribute('aria-valuenow', '610');
  });

  test('saves one serving of a dish', async ({ page }) => {
    await page.goto('/add/dish');
    await expect(page.getByText('488 kcal · 2 servings')).toBeVisible();
    await page.getByRole('button', { name: 'Remove Mixed vegetables, steamed' }).click();
    await expect(page.getByText('448 kcal · 2 servings')).toBeVisible();
    await page.getByRole('button', { name: 'Save dish to Diary' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('status')).toContainText('Chicken Quinoa Bowl · 224 kcal');
    await expect(page.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '386',
    );
  });

  test('the sheet closes on Escape and returns focus to the button that opened it', async ({
    page,
  }) => {
    await page.goto('/diary');
    const opener = page.getByRole('button', { name: 'Add to diary' });
    await opener.click();
    await expect(page.getByRole('dialog', { name: 'Add to diary' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(opener).toBeFocused();
  });
});
