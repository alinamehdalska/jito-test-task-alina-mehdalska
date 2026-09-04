import type { ReactNode } from 'react';

/** Section label in small caps — "RECENT", "SERVING SIZE", "AMOUNT". Names a field once. */
export function SectionLabel({
  children,
  trailing,
}: {
  readonly children: ReactNode;
  readonly trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="type-caption-1 text-text-secondary uppercase">{children}</span>
      {trailing}
    </div>
  );
}
