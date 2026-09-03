import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays, isMonday, subDays } from 'date-fns';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeObjects } from '@/app/router';
import { useDiaryStore } from '@/features/diary/store';
import { formatDayTitle } from '@/shared/lib/format';
import { renderRoutes } from '@/shared/test/render';

describe('DashboardScreen', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(new Date());
  });

  it('leads with what is left and reconciles with the seeded meals', () => {
    renderRoutes(routeObjects);
    const gauge = screen.getByRole('meter', { name: 'Calories remaining today' });
    expect(gauge).toHaveAttribute('aria-valuenow', '610');
    expect(gauge).toHaveTextContent('610');
    expect(gauge).toHaveTextContent('1,240');
    expect(gauge).toHaveTextContent('1,850');

    const protein = screen.getByRole('meter', { name: 'Protein' });
    expect(protein).toHaveAttribute('aria-valuenow', '78');
    expect(protein).toHaveAttribute('aria-valuemax', '120');

    for (const meal of ['Breakfast', 'Lunch', 'Snack']) {
      expect(screen.getByRole('region', { name: meal })).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole('region', { name: 'Snack' })).getByText('Trail mix, 55 g'),
    ).toBeInTheDocument();
    expect(screen.getByText('1,240 kcal')).toBeInTheDocument();
  });
});

describe('DiaryScreen', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(new Date());
  });

  it('shows today by default and the empty state for another day of the week', async () => {
    const user = userEvent.setup();
    const today = new Date();
    const other = isMonday(today) ? addDays(today, 1) : subDays(today, 1);
    const { router } = renderRoutes(routeObjects, { initialEntries: ['/diary'] });

    expect(screen.getByRole('region', { name: 'Breakfast' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: formatDayTitle(today) })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: formatDayTitle(other) }));
    expect(router.state.location.search).toContain('day=');
    expect(screen.getByRole('heading', { name: 'Nothing logged yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Add food' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });
});
