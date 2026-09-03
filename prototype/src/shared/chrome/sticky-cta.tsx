import type { ReactNode } from 'react';

import { BottomFade, type FadeContext } from '@/shared/chrome/bottom-fade';

interface StickyCtaProps {
  /** Detail screens fade to the white surface; calculators sit on the aurora. */
  readonly fade?: FadeContext | undefined;
  /** A total block pinned above the button, as the calculators do. */
  readonly header?: ReactNode;
  readonly children: ReactNode;
}

/**
 * The pinned CTA row: 96pt tall, so a 52pt CTA at its top edge ends at y=808 — 44pt clear of
 * the home-indicator zone (composition rule 4). Push contexts carry this instead of a tab bar.
 */
export function StickyCta({ fade = 'detail', header, children }: StickyCtaProps) {
  return (
    <>
      <BottomFade context={fade} />
      <div className="absolute inset-x-0 bottom-(--screen-bottom-inset) flex flex-col gap-12 px-20 pb-(--screen-cta-bottom)">
        {header}
        <div className="flex h-control-cta items-start gap-12">{children}</div>
      </div>
    </>
  );
}
