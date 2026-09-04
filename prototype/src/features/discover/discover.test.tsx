import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routeObjects } from '@/app/router';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { renderRoutes } from '@/shared/test/render';

const NOON = new Date(2026, 8, 3, 12, 0);

/** Discover reads the clock: noon keeps it in "today" mode whatever time the suite runs. */
function pinClock(at: Date) {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(at);
  useDiaryStore.getState().reset(at);
}

describe('DiscoveryScreen', () => {
  beforeEach(() => {
    pinClock(NOON);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('explains every card against what is left today, fits first', () => {
    renderRoutes(routeObjects, { initialEntries: ['/discover'] });
    expect(screen.getByText('610 kcal left')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fits my calories' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const cards = within(screen.getByRole('list', { name: 'Recipes' })).getAllByRole('link');
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
      'Lemon Herb Salmon Bowl, 480 kcal, 15 min, Fits · 130 to spare',
      'Miso Rice & Egg Bowl, 395 kcal, 20 min, Fits · 215 to spare',
      'Seared Tuna Niçoise, 445 kcal, 18 min, High protein',
      'Chickpea Shakshuka, 520 kcal, 25 min, Just fits · 90 to spare',
    ]);
  });

  it('plans tomorrow instead of opening empty once nothing fits tonight', () => {
    act(() => {
      useDiaryStore.getState().log({
        name: 'Lemon Herb Salmon Bowl',
        meal: 'lunch',
        loggedAt: NOON.toISOString(),
        amount: { value: 1, unit: 'serving' },
        nutrition: { kcal: 480, protein: 34, carbs: 42, fat: 18 },
        source: 'recipe',
      });
    });
    renderRoutes(routeObjects, { initialEntries: ['/discover'] });
    expect(screen.getByRole('heading', { name: 'Planning tomorrow' })).toBeInTheDocument();
    expect(screen.getByText('130 kcal left')).toBeInTheDocument();
    const cards = within(screen.getByRole('list', { name: 'Recipes' })).getAllByRole('link');
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
      'Miso Rice & Egg Bowl, 395 kcal, 20 min, Fits tomorrow',
      'Seared Tuna Niçoise, 445 kcal, 18 min, Fits tomorrow',
      'Lemon Herb Salmon Bowl, 480 kcal, 15 min, Fits tomorrow',
      'Chickpea Shakshuka, 520 kcal, 25 min, Fits tomorrow',
    ]);
  });

  it('filters by attribute and by name', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderRoutes(routeObjects, { initialEntries: ['/discover'] });
    await user.click(screen.getByRole('button', { name: 'Vegetarian' }));
    expect(within(screen.getByRole('list', { name: 'Recipes' })).getAllByRole('link')).toHaveLength(
      2,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'miso');
    expect(within(screen.getByRole('list', { name: 'Recipes' })).getAllByRole('link')).toHaveLength(
      1,
    );

    await user.click(screen.getByRole('button', { name: 'Low carb' }));
    expect(screen.getByRole('heading', { name: 'Nothing fits those filters' })).toBeInTheDocument();
  });
});

describe('RecipeDetailsScreen', () => {
  beforeEach(() => {
    pinClock(NOON);
    useToastStore.setState({ current: null });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('switches sections without leaving the recipe or losing the summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/recipes/lemon-herb-salmon-bowl'],
    });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lemon Herb Salmon Bowl' }),
    ).toBeInTheDocument();
    expect(screen.getByText('130 kcal to spare after this serving.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ingredients' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Salmon fillet')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Nutrition' }));
    expect(router.state.location.search).toBe('?tab=nutrition');
    expect(screen.getByText('Cholesterol')).toBeInTheDocument();
    expect(screen.getByText('130 kcal to spare after this serving.')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Instructions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Cook the rice')).toBeInTheDocument();
  });

  it('logs the chosen number of servings, in halves, to the chosen meal', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/recipes/lemon-herb-salmon-bowl'],
    });
    await user.click(screen.getByRole('button', { name: 'Decrease Servings to log' }));
    expect(screen.getByRole('button', { name: 'Log ½ serving to Diary' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Increase Servings to log' }));
    await user.click(screen.getByRole('button', { name: 'Increase Servings to log' }));

    await user.click(screen.getByRole('button', { name: /Log to Lunch · Today/ }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Log to' })).getByRole('radio', { name: 'Dinner' }),
    );
    await user.click(screen.getByRole('button', { name: 'Done' }));

    await user.click(screen.getByRole('button', { name: 'Log 1½ servings to Diary' }));
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('status')).toHaveTextContent('Added to Dinner today');
    expect(screen.getByRole('status')).toHaveTextContent('Lemon Herb Salmon Bowl · 720 kcal');
    expect(
      within(screen.getByRole('region', { name: 'Dinner' })).getByText('Lemon Herb Salmon Bowl'),
    ).toBeInTheDocument();
  });
});
