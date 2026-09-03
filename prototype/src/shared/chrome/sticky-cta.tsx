import type { ReactNode } from 'react';

import { BottomFade, type FadeContext } from '@/shared/chrome/bottom-fade';

interface StickyCtaProps {
  /** Detail screens fade to the white surface; calculators sit on the aurora. */
  readonly fade?: FadeContext | undefined;
  readonly children: ReactNode;
}

/**
 * The pinned CTA row: 96pt tall, so a 52pt CTA at its top edge ends at y=808 — 44pt clear of
 * the home-indicator zone (composition rule 4). Push contexts carry this instead of a tab bar.
 */
export function StickyCta({ fade = 'detail', children }: StickyCtaProps) {
  return (
    <>
      <BottomFade context={fade} />
      <div className="absolute inset-x-0 bottom-(--screen-bottom-inset) flex h-(--screen-cta-h) items-start gap-12 px-20">
        {children}
      </div>
    </>
  );
}
