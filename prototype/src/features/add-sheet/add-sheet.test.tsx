import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeObjects } from '@/app/router';
import { useAddSheetStore } from '@/features/add-sheet/store';
import { renderRoutes } from '@/shared/test/render';

describe('AddSheet', () => {
  beforeEach(() => {
    useAddSheetStore.setState({ isOpen: false });
  });

  it('opens from the FAB, names itself, and closes on Escape', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects);
    await user.click(screen.getByRole('button', { name: 'Add to diary' }));
    const dialog = screen.getByRole('dialog', { name: 'Add to diary' });
    expect(dialog).toBeVisible();
    expect(screen.getByRole('button', { name: /Add a product/ })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to diary' })).toHaveFocus();
  });

  it('closes when the scrim is tapped', async () => {
    const user = userEvent.setup();
    renderRoutes(routeObjects);
    await user.click(screen.getByRole('button', { name: 'Add to diary' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('routes each option and dismisses itself first', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects);
    await user.click(screen.getByRole('button', { name: 'Add to diary' }));
    await user.click(screen.getByRole('button', { name: /Create a dish/ }));
    expect(router.state.location.pathname).toBe('/add/dish');
    expect(useAddSheetStore.getState().isOpen).toBe(false);
  });
});
