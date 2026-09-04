import { routes } from '@/app/routes';
import { SegmentedControl } from '@/shared/ui/segmented-control';

export { SectionLabel } from '@/shared/ui/section-label';

const SEGMENTS = [
  { label: 'Product', to: routes.product },
  { label: 'Dish', to: routes.dish },
] as const;

/** The mode switch both calculators share (frames 2 and 3): Product ⇄ Dish. */
export function CalculatorModeSwitch() {
  return <SegmentedControl label="What to add" segments={SEGMENTS} />;
}
