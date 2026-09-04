import type { ReactNode } from 'react';

import { AuroraBackdrop } from '@/shared/chrome/aurora-backdrop';
import { HomeIndicator } from '@/shared/chrome/home-indicator';
import { StatusBar } from '@/shared/chrome/status-bar';
import { cn } from '@/shared/lib/cn';

type Backdrop = 'aurora' | 'surface';
type BottomInset = 'nav' | 'cta' | 'cta-product' | 'cta-dish' | 'cta-recipe' | 'none';

interface ScreenProps {
  /** Every screen sits on the aurora except Recipe Details, which is a white surface. */
  readonly backdrop?: Backdrop | undefined;
  /** How much room the content leaves for whatever floats over its bottom edge. */
  readonly bottomInset?: BottomInset | undefined;
  /** Fixed chrome — tab bar, sticky CTA, fades — rendered as siblings of the scroll region. */
  readonly chrome?: ReactNode;
  /** Off for screens that draw under the status bar themselves (the recipe hero). */
  readonly topInset?: boolean | undefined;
  readonly children: ReactNode;
}

const INSET_CLASSES: Record<BottomInset, string> = {
  nav: 'pb-96',
  cta: 'pb-(--screen-inset-cta)',
  'cta-product': 'pb-(--screen-inset-cta-product)',
  'cta-dish': 'pb-(--screen-inset-cta-dish)',
  'cta-recipe': 'pb-(--screen-inset-cta-recipe)',
  none: 'pb-48',
};

/**
 * One phone screen: a backdrop, a scroll region that carries the view-transition name, and
 * absolutely positioned chrome on top. Nothing here uses `position: fixed`, so the same
 * markup works inside the desktop device frame and full-bleed on a phone.
 */
export function Screen({
  backdrop = 'aurora',
  bottomInset = 'none',
  chrome,
  children,
}: ScreenProps) {
  return (
    <div
      className={cn(
        'relative size-full overflow-hidden',
        backdrop === 'surface' ? 'bg-bg-surface' : 'bg-bg-canvas',
      )}
    >
      {backdrop === 'aurora' && <AuroraBackdrop />}
      <main
        className={cn(
          'absolute inset-0 scrollbar-none overflow-x-hidden overflow-y-auto overscroll-contain pt-(--screen-top-inset)',
          INSET_CLASSES[bottomInset],
        )}
        style={{ viewTransitionName: 'screen' }}
      >
        {children}
      </main>
      {chrome}
      <StatusBar />
      <HomeIndicator />
    </div>
  );
}
