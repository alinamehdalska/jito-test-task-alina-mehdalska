import { NavLink } from 'react-router';

import { cn } from '@/shared/lib/cn';

interface Segment {
  readonly label: string;
  readonly to: string;
}

interface SegmentedControlProps {
  readonly label: string;
  readonly segments: readonly Segment[];
}

/**
 * Figma 69:130 "product-row": a sunken pill holding two routes. The segments are links, so
 * switching Product ⇄ Dish is a replace-navigation with no transition, and `aria-current`
 * carries the state alongside the raised white segment.
 */
export function SegmentedControl({ label, segments }: SegmentedControlProps) {
  return (
    <nav
      aria-label={label}
      className="flex h-40 w-full items-center gap-4 rounded-full bg-bg-sunken px-2"
    >
      {segments.map((segment) => (
        <NavLink
          key={segment.to}
          to={segment.to}
          replace
          className={({ isActive }) =>
            cn(
              'flex h-control-chip flex-1 items-center justify-center rounded-full transition-colors duration-state',
              isActive
                ? 'bg-bg-surface type-subhead-emphasized text-text-primary shadow-xs'
                : 'type-subhead text-text-secondary',
            )
          }
        >
          {segment.label}
        </NavLink>
      ))}
    </nav>
  );
}
