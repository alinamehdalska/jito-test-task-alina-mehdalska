import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { routeObjects } from '@/app/router';
import { renderRoutes } from '@/shared/test/render';

describe('TabBar', () => {
  it('marks the current destination with aria-current, not colour alone', () => {
    renderRoutes(routeObjects, { initialEntries: ['/discover'] });
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Discover' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('switches root destinations', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routeObjects);
    await user.click(screen.getByRole('link', { name: 'Diary' }));
    expect(router.state.location.pathname).toBe('/diary');
    expect(screen.getByRole('heading', { level: 1, name: 'Diary' })).toBeInTheDocument();
  });

  it('exposes the central action as a dialog opener', () => {
    renderRoutes(routeObjects);
    expect(screen.getByRole('button', { name: 'Add to diary' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });
});
