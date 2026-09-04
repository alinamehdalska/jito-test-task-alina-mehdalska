import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routeObjects } from '@/app/router';
import { SEARCH_LATENCY_MS } from '@/features/calculator/search-screen';
import { useCalculatorStore } from '@/features/calculator/store';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { renderRoutes } from '@/shared/test/render';

describe('ProductScreen', () => {
  beforeEach(() => {
    // Logging stamps the real clock, so the seed must sit on the real day.
    useDiaryStore.getState().reset(new Date());
    useToastStore.setState({ current: null });
  });

  it('opens on the label serving and recomputes from presets and a typed amount', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects, { initialEntries: ['/add/product/greek-yogurt-2'] });
    expect(screen.getByRole('radio', { name: '1 pot · 170 g' })).toBeChecked();
    expect(screen.getByText('for 170 g · 1 pot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log 124 kcal to Diary' })).toBeInTheDocument();
    expect(screen.getByText('17.0 g')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: '100 g' }));
    expect(screen.getByRole('button', { name: 'Log 73 kcal to Diary' })).toBeInTheDocument();

    const amount = screen.getByRole('textbox', { name: 'Amount in grams' });
    await user.clear(amount);
    await user.type(amount, '150{Enter}');
    expect(screen.getByRole('button', { name: 'Log 110 kcal to Diary' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
    expect(screen.getByText('15.0 g')).toBeInTheDocument();
  });

  it('logs the serving, shows the toast and returns to Today', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/add/product/greek-yogurt-2'],
    });
    await user.click(screen.getByRole('button', { name: 'Increase Amount in grams' }));
    await user.click(screen.getByRole('button', { name: 'Log 131 kcal to Diary' }));

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('status')).toHaveTextContent('Greek Yogurt, 2% · 131 kcal');
    expect(screen.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '479',
    );

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '610',
    );
  });
});

describe('DishScreen', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(new Date());
    useCalculatorStore.setState(useCalculatorStore.getInitialState());
  });

  it('shows the seeded dish maths and keeps it live', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects, { initialEntries: ['/add/dish'] });
    expect(screen.getByText('488 kcal · 2 servings')).toBeInTheDocument();
    expect(screen.getByText('244')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Mixed vegetables, steamed' }));
    expect(screen.getByText('448 kcal · 2 servings')).toBeInTheDocument();
    expect(screen.getByText('224')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Increase Servings' }));
    expect(screen.getByText('448 kcal · 3 servings')).toBeInTheDocument();
    expect(screen.getByText('149')).toBeInTheDocument();
  });

  it('saves one serving to the diary', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects, { initialEntries: ['/add/dish'] });
    await user.click(screen.getByRole('button', { name: 'Log 244 kcal to Diary' }));
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('status')).toHaveTextContent('Chicken Quinoa Bowl · 244 kcal');
    expect(useCalculatorStore.getState().dish.ingredients).toEqual([]);
  });
});

describe('SearchScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useDiaryStore.getState().reset(new Date(2026, 8, 3, 12, 0));
    useCalculatorStore.setState(useCalculatorStore.getInitialState());
    useToastStore.setState({ current: null });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows skeletons while searching, then the matches', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { router } = renderRoutes(routeObjects, { initialEntries: ['/add/search'] });
    const input = screen.getByRole('searchbox', { name: 'Search foods and brands' });
    expect(input).toHaveFocus();

    await user.type(input, 'chicken bre');
    expect(screen.getByText('Searching…')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Results' })).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SEARCH_LATENCY_MS);
    });
    expect(screen.getByText('2 results')).toBeInTheDocument();
    const results = screen.getByRole('list', { name: 'Results' });
    await user.click(within(results).getByRole('button', { name: /Chicken breast, cooked/ }));
    expect(router.state.location.pathname).toBe('/add/product/chicken-breast-cooked');
  });

  it('offers the two recoveries when nothing matches', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { router } = renderRoutes(routeObjects, { initialEntries: ['/add/search'] });
    await user.type(screen.getByRole('searchbox', { name: 'Search foods and brands' }), 'kefir');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SEARCH_LATENCY_MS);
    });
    expect(screen.getByText('0 results')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nothing matches “kefir”' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scan a barcode' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create a food' }));
    expect(router.state.location.pathname).toBe('/add/product');
  });

  it('adds an ingredient to the dish draft and goes back', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { router } = renderRoutes(routeObjects, {
      initialEntries: ['/add/dish', '/add/search?mode=ingredient'],
    });
    await user.type(screen.getByRole('searchbox', { name: 'Search foods and brands' }), 'avocado');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SEARCH_LATENCY_MS);
    });
    await user.click(screen.getByRole('button', { name: /Avocado/ }));
    expect(router.state.location.pathname).toBe('/add/dish');
    expect(
      useCalculatorStore.getState().dish.ingredients.find((item) => item.productId === 'avocado')
        ?.grams,
    ).toBe(150);
  });
});
