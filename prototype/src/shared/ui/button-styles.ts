import { cn } from '@/shared/lib/cn';
import type { IconName } from '@/shared/ui/icon-glyphs';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export interface ButtonStyleProps {
  readonly variant?: ButtonVariant | undefined;
  /** `md` is the 44pt standard button; `lg` is the 52pt CTA, one per screen. */
  readonly size?: ButtonSize | undefined;
  readonly fullWidth?: boolean | undefined;
  readonly iconLeading?: IconName | undefined;
  readonly iconTrailing?: IconName | undefined;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Solid coral with an ink label — 6.16:1, the only AA pairing on this hue.
  primary: 'bg-accent-primary text-text-primary shadow-xs active:bg-accent-primary-hover',
  secondary: 'border border-border-subtle bg-bg-surface text-accent-primary-strong shadow-xs',
  tertiary: 'bg-transparent text-accent-primary-strong',
  destructive: 'bg-feedback-danger-surface text-feedback-danger',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-control-button',
  lg: 'h-control-cta',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleProps): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-8 rounded-full px-24 whitespace-nowrap',
    'type-headline transition duration-press ease-out',
    'active:scale-98 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
  );
}
