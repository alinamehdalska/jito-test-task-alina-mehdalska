import { expect, test } from '@playwright/test';

/** User Story 2 — a recipe that suits what is left today, logged from its details. */
test.describe('US2 · Find a recipe that fits', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-03T12:00:00'));
  });

  test('recommends against the remaining budget and logs a serving', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByText('610 kcal left')).toBeVisible();
    const cards = page.getByRole('list', { name: 'Recipes' }).getByRole('link');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toHaveAccessibleName(/Fits · 130 to spare/);
    await expect(cards.nth(2)).toHaveAccessibleName(/High protein/);
    await expect(cards.nth(3)).toHaveAccessibleName(/Just fits · 90 to spare/);

    await cards.first().click();
    await expect(page).toHaveURL(/\/recipes\/lemon-herb-salmon-bowl/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Lemon Herb Salmon Bowl' }),
    ).toBeVisible();
    await expect(page.getByText('130 kcal to spare after this serving.')).toBeVisible();

    await page.getByRole('tab', { name: 'Nutrition' }).click();
    await expect(page.getByText('Cholesterol')).toBeVisible();
    await expect(page.getByText('130 kcal to spare after this serving.')).toBeVisible();
    await page.getByRole('tab', { name: 'Instructions' }).click();
    await expect(page.getByText('Cook the rice')).toBeVisible();

    await page.getByRole('button', { name: 'Log 1 serving to Diary' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('status')).toContainText('Lemon Herb Salmon Bowl · 480 kcal');
    await expect(page.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '130',
    );

    // With 130 kcal left nothing fits tonight, so the tab plans tomorrow rather than emptying.
    await page.getByRole('link', { name: 'Discover' }).click();
    await expect(page.getByText('130 kcal left')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Planning tomorrow' })).toBeVisible();
    await expect(cards).toHaveCount(4);
    await expect(cards.first()).toHaveAccessibleName(/Miso Rice & Egg Bowl.*Fits tomorrow/);
  });

  test('filters narrow the grid', async ({ page }) => {
    await page.goto('/discover');
    await page.getByRole('button', { name: 'Vegetarian' }).click();
    await expect(page.getByRole('list', { name: 'Recipes' }).getByRole('link')).toHaveCount(2);
    await page.getByRole('button', { name: 'Low carb' }).click();
    await expect(page.getByRole('heading', { name: 'Nothing fits those filters' })).toBeVisible();
  });
});
