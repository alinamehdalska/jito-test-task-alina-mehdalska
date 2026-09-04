import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeObjects } from '@/app/router';
import { useEditEntryStore } from '@/features/diary/edit-entry-store';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { renderRoutes } from '@/shared/test/render';

describe('EditEntrySheet', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(new Date());
    useEditEntryStore.setState({ entryId: null });
    useToastStore.setState({ current: null });
  });

  it('opens from a meal row, rescales the amount and moves the entry to another meal', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects);
    await user.click(screen.getByRole('button', { name: 'Edit Greek yogurt bowl' }));
    const sheet = screen.getByRole('dialog', { name: 'Edit entry' });
    expect(sheet).toBeVisible();
    expect(within(sheet).getByRole('radio', { name: 'Breakfast' })).toBeChecked();
    expect(within(sheet).getByLabelText('Time')).toHaveValue('08:30');

    // 250 g → 500 g doubles the 320 kcal, and the card shows it before Save is pressed.
    const amount = within(sheet).getByRole('textbox', { name: 'Amount in grams' });
    await user.clear(amount);
    await user.type(amount, '500{Enter}');
    expect(within(sheet).getByText('640 kcal')).toBeInTheDocument();

    await user.click(within(sheet).getByRole('radio', { name: 'Lunch' }));
    await user.click(within(sheet).getByRole('button', { name: 'Save changes' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(screen.queryByRole('region', { name: 'Breakfast' })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Lunch' })).getByText('Greek yogurt bowl'),
    ).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '290',
    );
  });

  it('deletes with an undo, and the undo puts the entry back', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects);
    await user.click(screen.getByRole('button', { name: 'Edit Trail mix, 55 g' }));
    await user.click(screen.getByRole('button', { name: 'Delete entry' }));
    expect(screen.queryByRole('region', { name: 'Snack' })).not.toBeInTheDocument();
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Removed from diary');
    expect(toast).toHaveTextContent('Trail mix, 55 g · 380 kcal');
    expect(screen.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '990',
    );

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('region', { name: 'Snack' })).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Calories remaining today' })).toHaveAttribute(
      'aria-valuenow',
      '610',
    );
  });
});
