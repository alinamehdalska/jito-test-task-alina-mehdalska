import { useCallback } from 'react';
import { type To, useLocation, useNavigate } from 'react-router';

import { routes } from '@/app/routes';

/** Which of the four documented transitions a navigation should play. */
export type TransitionKind = 'push' | 'pop' | 'dissolve' | 'none';

export interface TransitionState {
  readonly transition: TransitionKind;
}

export function readTransition(state: unknown): TransitionKind | null {
  if (typeof state !== 'object' || state === null || !('transition' in state)) return null;
  const { transition } = state;
  return transition === 'push' ||
    transition === 'pop' ||
    transition === 'dissolve' ||
    transition === 'none'
    ? transition
    : null;
}

interface NavigateOptions {
  readonly replace?: boolean | undefined;
}

/** `navigate` with the transition recorded in history state, so the root layout can play it. */
export function useAppNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to: To, kind: TransitionKind = 'push', { replace = false }: NavigateOptions = {}) => {
      const state: TransitionState = { transition: kind };
      void navigate(to, { replace, state, viewTransition: kind !== 'none' });
    },
    [navigate],
  );
}

/**
 * Back carets use history rather than a fixed destination, because the product calculator is
 * reachable from three places and only history returns to the right one. A deep link has no
 * history to return to, so it falls back to the dashboard.
 */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    if (location.key === 'default') {
      const state: TransitionState = { transition: 'pop' };
      void navigate(routes.home, { replace: true, state, viewTransition: true });
      return;
    }
    void navigate(-1);
  }, [location.key, navigate]);
}
