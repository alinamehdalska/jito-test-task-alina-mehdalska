import { cn } from '@/shared/lib/cn';

export type FadeContext = 'nav' | 'discovery' | 'detail';

/**
 * Scroll fade under floating chrome (design-system.md composition rule 5). Each context is a
 * measured pair: how tall the fade is and where it reaches full canvas alpha, which must be
 * BY the chrome's top edge — Nav 121 solid@756 · Discovery 191 solid@737 · Detail 160 solid@752.
 */
const FADE_CLASSES: Record<FadeContext, string> = {
  nav: 'h-(--screen-fade-nav) from-transparent to-bg-canvas to-21%',
  discovery: 'h-(--screen-fade-discovery) from-transparent from-27% to-bg-canvas to-40%',
  detail: 'h-(--screen-fade-detail) from-transparent to-bg-surface to-38%',
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
