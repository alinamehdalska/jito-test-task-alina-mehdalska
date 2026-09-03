import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/icon';

interface IconButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'className'
> {
  readonly icon: IconName;
  /** The accessible name — an icon button has no visible text. */
  readonly label: string;
  readonly className?: string | undefined;
}

/** A 24pt glyph inside the 44pt target the design system requires of anything tappable. */
export function IconButton({ icon, label, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex size-control-button shrink-0 items-center justify-center rounded-full text-text-primary transition-transform duration-press ease-out active:scale-98',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
