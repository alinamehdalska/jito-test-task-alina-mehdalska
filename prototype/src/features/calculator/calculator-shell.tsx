import type { ReactNode } from 'react';

import { routes } from '@/app/routes';
import { SegmentedControl } from '@/shared/ui/segmented-control';

const SEGMENTS = [
  { label: 'Product', to: routes.product },
  { label: 'Dish', to: routes.dish },
] as const;

/** The mode switch both calculators share (frames 2 and 3): Product ⇄ Dish. */
export function CalculatorModeSwitch() {
  return <SegmentedControl label="What to add" segments={SEGMENTS} />;
}

/** Section label in the calculators' small caps voice — "RECENT", "SERVING SIZE", "DISH NAME". */
export function SectionLabel({
  children,
  trailing,
}: {
  readonly children: ReactNode;
  readonly trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="type-caption-1 text-text-tertiary uppercase">{children}</span>
      {trailing}
    </div>
  );
}
