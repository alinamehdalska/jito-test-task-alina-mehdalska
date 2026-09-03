import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/icon';

interface ChipProps extends Omit<ComponentPropsWithoutRef<'button'>, 'className'> {
  readonly selected?: boolean | undefined;
  readonly iconLeading?: IconName | undefined;
  readonly className?: string | undefined;
}

/**
 * The 36pt chip (Figma 7:37 / 69:165): white with a hairline at rest, coral-muted with an
 * accent-strong label when selected (5.10:1). Its row supplies the 44pt target.
 */
export function Chip({
  selected = false,
  iconLeading,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-control-chip shrink-0 items-center gap-8 rounded-full px-12 type-caption-1 whitespace-nowrap transition-colors duration-state',
        selected
          ? 'bg-accent-primary-muted type-caption-1-emphasized text-accent-primary-strong'
          : 'border border-border-subtle bg-bg-surface text-text-secondary',
        className,
      )}
      {...rest}
    >
      {iconLeading && <Icon name={iconLeading} className="size-16" />}
      {children}
    </button>
  );
}
