import { expect, test } from '@playwright/test';

/** User Story 1 — calories for a product, and for a whole dish, both ending in the diary. */
test.describe('US1 · Log a meal', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-03T12:00:00'));
  });

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
    await expect(page.getByRole('radio', { name: '1 pot · 170 g' })).toBeChecked();
    await page.getByRole('radio', { name: '100 g' }).click();
    await page.getByRole('button', { name: 'Log 73 kcal to Diary' }).click();

    await expect(page).toHaveURL('/');
    const toast = page.getByRole('status');
    await expect(toast).toContainText('Added to Lunch today');
    await expect(toast).toContainText('Greek Yogurt, 2% · 73 kcal');
    await expect(gauge).toHaveAttribute('aria-valuenow', '537');

    await toast.getByRole('button', { name: 'Undo' }).click();
    await expect(gauge).toHaveAttribute('aria-valuenow', '610');
  });

  test('logs into the meal the pull-down names', async ({ page }) => {
    await page.goto('/add/product/greek-yogurt-2');
    await page.getByRole('button', { name: /Log to Lunch · Today/ }).click();
    const picker = page.getByRole('dialog', { name: 'Log to' });
    await picker.getByRole('radio', { name: 'Dinner' }).click();
    await picker.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('button', { name: /Log to Dinner · Today/ })).toBeVisible();
    await page.getByRole('button', { name: 'Log 124 kcal to Diary' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('region', { name: 'Dinner' })).toContainText('Greek Yogurt, 2%');
  });

  test('saves one serving of a dish', async ({ page }) => {
    await page.goto('/add/dish');
    await expect(page.getByText('488 kcal · 2 servings')).toBeVisible();
    await page.getByRole('button', { name: 'Remove Mixed vegetables, steamed' }).click();
    await expect(page.getByText('448 kcal · 2 servings')).toBeVisible();
    await page.getByRole('button', { name: 'Log 224 kcal to Diary' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('status')).toContainText('Chicken Quinoa Bowl · 224 kcal');
    await expect(page.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '386',
    );
  });

  test('edits a logged entry, and deletes it with an undo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Edit Greek yogurt bowl' }).click();
    const sheet = page.getByRole('dialog', { name: 'Edit entry' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('radio', { name: 'Lunch' }).click();
    await sheet.getByRole('button', { name: 'Save changes' }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('region', { name: 'Lunch' })).toContainText('Greek yogurt bowl');

    await page.getByRole('button', { name: 'Edit Greek yogurt bowl' }).click();
    await sheet.getByRole('button', { name: 'Delete entry' }).click();
    const toast = page.getByRole('status');
    await expect(toast).toContainText('Removed from diary');
    await expect(page.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '930',
    );
    await toast.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '610',
    );
  });

  test('over budget reads as a number in amber, never a minus sign', async ({ page }) => {
    await page.goto('/recipes/chickpea-shakshuka');
    await page.getByRole('button', { name: 'Increase Servings to log' }).click();
    await page.getByRole('button', { name: 'Increase Servings to log' }).click();
    await page.getByRole('button', { name: 'Log 2 servings to Diary' }).click();
    await expect(page).toHaveURL('/');
    const gauge = page.getByRole('meter', { name: 'Calories remaining today' });
    await expect(gauge).toHaveAttribute('aria-valuetext', /430 kcal over the 1,850 goal/);
    await expect(gauge).toContainText('over today’s goal');
    await expect(gauge).not.toContainText('-430');
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
