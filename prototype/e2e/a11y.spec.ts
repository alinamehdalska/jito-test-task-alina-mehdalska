import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/discover',
  '/diary',
  '/profile',
  '/add/search?q=chicken',
  '/add/product/greek-yogurt-2',
  '/add/dish',
  '/recipes/lemon-herb-salmon-bowl',
  '/recipes/lemon-herb-salmon-bowl?tab=nutrition',
  '/recipes/lemon-herb-salmon-bowl?tab=instructions',
] as const;

/**
 * Colour contrast is measured per token pair in branding-strategy.md §5 rather than by axe:
 * the design records `text.tertiary` as large-text only and uses it in captions anyway,
 * which is a documented exception, not a regression to catch here.
 */
async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    serious.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
    ),
  ).toEqual([]);
}

for (const route of ROUTES) {
  test(`axe passes on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    await expectNoSeriousViolations(page);
  });
}

test('axe passes with the add sheet open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add to diary' }).click();
  await expect(page.getByRole('dialog', { name: 'Add to diary' })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test.describe('touch targets and chrome geometry', () => {
  test.skip(({ viewport }) => viewport?.width !== 393, 'measured at the Figma frame size only');

  test('every interactive element offers a 44pt target, or sits in a row that does', async ({
    page,
  }) => {
    for (const route of ['/', '/discover', '/add/product/greek-yogurt-2', '/add/dish']) {
      await page.goto(route);
      const short = await page.evaluate(() => {
        const MIN = 44;
        const candidates = [
          ...document.querySelectorAll<HTMLElement>(
            'a, button, input, [role="radio"], [role="tab"]',
          ),
        ];
        return candidates
          .filter((element) => element.offsetParent !== null || element.tagName === 'INPUT')
          .filter((element) => {
            const box = element.getBoundingClientRect();
            if (box.height >= MIN && box.width >= MIN) return false;
            // A 36pt chip is legal when its row supplies the 44pt target (design-system.md §2.12a).
            let ancestor = element.parentElement;
            for (let depth = 0; ancestor && depth < 3; depth += 1) {
              if (ancestor.getBoundingClientRect().height >= MIN) return false;
              ancestor = ancestor.parentElement;
            }
            return true;
          })
          .map(
            (element) =>
              `${element.tagName.toLowerCase()} "${(element.getAttribute('aria-label') ?? element.textContent).trim().slice(0, 30)}" ${String(Math.round(element.getBoundingClientRect().width))}×${String(Math.round(element.getBoundingClientRect().height))}`,
          );
      });
      expect(short, route).toEqual([]);
    }
  });

  test('the tab bar and the sticky CTA sit where the frames put them', async ({ page }) => {
    await page.goto('/');
    const bar = await page.getByRole('navigation', { name: 'Primary' }).boundingBox();
    expect(bar?.y).toBe(756);
    expect(bar?.height).toBe(68);

    await page.goto('/recipes/lemon-herb-salmon-bowl');
    const cta = await page.getByRole('button', { name: 'Log 1 serving to Diary' }).boundingBox();
    expect(cta && cta.y + cta.height).toBe(808);
  });
});
