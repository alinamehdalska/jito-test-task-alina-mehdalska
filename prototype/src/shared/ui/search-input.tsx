import { type ComponentPropsWithoutRef, type ReactNode, type Ref, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';

interface SearchInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'className' | 'id'
> {
  readonly label: string;
  /** An optional 44pt control seated at the trailing edge — the barcode scan target. */
  readonly trailing?: ReactNode;
  readonly className?: string | undefined;
  readonly ref?: Ref<HTMLInputElement> | undefined;
}

/** Figma 5:58 "Search Input": a 52pt white pill, hairline border, glass icon leading. */
export function SearchInput({ label, trailing, className, ref, ...rest }: SearchInputProps) {
  const inputId = useId();
  return (
    <div
      className={cn(
        'flex h-control-cta w-full items-center gap-12 rounded-full border border-border-subtle bg-bg-surface pl-16 shadow-xs',
        'focus-within:border-2 focus-within:border-border-focus',
        trailing ? 'pr-4' : 'pr-16',
        className,
      )}
    >
      <Icon name="magnifying-glass" className="size-20 text-text-secondary" />
      <input
        ref={ref}
        id={inputId}
        aria-label={label}
        type="search"
        className="min-w-0 flex-1 bg-transparent type-body text-text-primary outline-none placeholder:text-text-secondary"
        {...rest}
      />
      {trailing}
    </div>
  );
}
