import type { Reason } from '@/domain/match';
import { cn } from '@/shared/lib/cn';

/**
 * Figma 65:59 "Reason Chip". A dot and a label — the tone is carried by both fill and
 * words, never by colour alone. Positive is reserved for the calorie/macro fit.
 */
export function ReasonChip({ reason }: { readonly reason: Reason }) {
  const positive = reason.tone === 'positive';
  return (
    <span
      className={cn(
        'inline-flex h-24 items-center gap-4 rounded-8 px-8 type-caption-2 whitespace-nowrap',
        positive
          ? 'bg-feedback-success-surface text-feedback-success'
          : 'bg-bg-sunken text-text-secondary',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-4 rounded-full',
          positive ? 'bg-feedback-success' : 'bg-text-secondary',
        )}
      />
      {reason.label}
    </span>
  );
}
