import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeObjects } from '@/app/router';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { renderRoutes } from '@/shared/test/render';

describe('DiscoveryScreen', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(new Date(2026, 8, 3, 12, 0));
  });

  it('explains every card against what is left today', () => {
    renderRoutes(routeObjects, { initialEntries: ['/discover'] });
    expect(screen.getByText('610 kcal left')).toBeInTheDocument();
    const cards = within(screen.getByRole('list', { name: 'Recipes' })).getAllByRole('link');
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
      'Lemon Herb Salmon Bowl, 480 kcal, 15 min, Fits your calories',
      'Miso Rice & Egg Bowl, 395 kcal, 20 min, Fits your calories',
      'Chickpea Shakshuka, 520 kcal, 25 min, Tight fit',
      'Seared Tuna Niçoise, 445 kcal, 18 min, High protein',
    ]);
  });

  it('filters by attribute and by name', async () => {
    const user = userEvent.setup();
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
    useDiaryStore.getState().reset(new Date(2026, 8, 3, 12, 0));
    useToastStore.setState({ current: null });
  });

  it('switches sections without leaving the recipe', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/recipes/lemon-herb-salmon-bowl'],
    });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lemon Herb Salmon Bowl' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('One serving sits inside the 610 kcal you have left.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ingredients' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Salmon fillet')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Nutrition' }));
    expect(router.state.location.search).toBe('?tab=nutrition');
    expect(screen.getByText('Cholesterol')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Instructions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Cook the rice')).toBeInTheDocument();
  });

  it('logs the chosen number of servings', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/recipes/lemon-herb-salmon-bowl'],
    });
    await user.click(screen.getByRole('button', { name: 'Increase Servings to log' }));
    await user.click(screen.getByRole('button', { name: 'Log 2 servings to Diary' }));
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('status')).toHaveTextContent('Lemon Herb Salmon Bowl · 960 kcal');
  });
});
