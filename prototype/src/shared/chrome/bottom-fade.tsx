import { cn } from '@/shared/lib/cn';

export type FadeContext = 'nav' | 'discovery' | 'detail' | 'product' | 'dish';

/**
 * Scroll fade under floating chrome (design-system.md composition rule 5). Each context is a
 * measured pair: how tall the fade is and where it reaches full canvas alpha, which must be
 * BY the chrome's top edge — Nav 121 solid@756 · Discovery 191 solid@737 · Detail 212 solid@700
 * (Detail grew 52 for the "Log to" row above the recipe stepper). The calculators pin a
 * total block above their CTA, so their fades are as tall as their content insets and go
 * solid 32pt down — at the pod's top edge, which a 121pt nav fade left 50pt short on a
 * 375 × 812 phone.
 */
const FADE_CLASSES: Record<FadeContext, string> = {
  nav: 'h-(--screen-fade-nav) from-transparent to-bg-canvas to-21%',
  discovery: 'h-(--screen-fade-discovery) from-transparent from-27% to-bg-canvas to-40%',
  detail: 'h-(--screen-fade-detail) from-transparent to-bg-surface to-29%',
  product: 'h-(--screen-inset-cta-product) from-transparent to-bg-canvas to-18%',
  dish: 'h-(--screen-inset-cta-dish) from-transparent to-bg-canvas to-13%',
};

export function BottomFade({ context }: { readonly context: FadeContext }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-b',
        FADE_CLASSES[context],
      )}
    />
  );
}
