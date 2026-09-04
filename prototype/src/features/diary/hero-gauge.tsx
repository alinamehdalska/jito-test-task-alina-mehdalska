import { useId } from 'react';

import { formatKcal } from '@/shared/lib/format';

interface HeroGaugeProps {
  readonly consumed: number;
  readonly goal: number;
}

/** Ø313 with a 13pt stroke: the arc's centre line has this radius. */
const DIAMETER = 313;
const STROKE = 13;
const RADIUS = (DIAMETER - STROKE) / 2;
const CENTRE_X = DIAMETER / 2;
const CENTRE_Y = DIAMETER / 2;
/** The path is an upper semicircle, drawn left → right so progress fills clockwise. */
const ARC_PATH = `M ${String(STROKE / 2)} ${String(CENTRE_Y)} A ${String(RADIUS)} ${String(RADIUS)} 0 0 1 ${String(DIAMETER - STROKE / 2)} ${String(CENTRE_Y)}`;
const ARC_HEIGHT = CENTRE_Y + STROKE / 2;
/** The over-budget arc: 5pt, inset 4pt inside the sweep, drawn back from the goal end. */
const OVER_STROKE = 5;
const OVER_INSET = 4;
const OVER_RADIUS = RADIUS - STROKE / 2 - OVER_INSET - OVER_STROKE / 2;
const OVER_PATH = `M ${String(CENTRE_X - OVER_RADIUS)} ${String(CENTRE_Y)} A ${String(OVER_RADIUS)} ${String(OVER_RADIUS)} 0 0 1 ${String(CENTRE_X + OVER_RADIUS)} ${String(CENTRE_Y)}`;
const FULL = 100;

/**
 * Figma 35:23 "Hero Gauge". It leads with what is LEFT — the number the user acts on —
 * and the termini carry consumed and goal. The sweep gradient runs coral → coral/600 →
 * periwinkle/600 with stops at 0 / 34 / 58 / 76 %, the 600-tints being the ones that
 * clear 3:1 (the 400s measure ~2.1). The lightest stop is decorative by design: the value
 * always stands beside it as text.
 *
 * Over budget (frame 1b) the sweep completes, a thinner amber arc inset from the goal end
 * draws the excess, and the hero reads `390 · over today's goal` — never a minus sign.
 */
export function HeroGauge({ consumed, goal }: HeroGaugeProps) {
  const gradientId = useId();
  const remaining = goal - consumed;
  const isOver = remaining < 0;
  const over = Math.max(0, -remaining);
  const progress = goal > 0 ? Math.min(1, Math.max(0, consumed / goal)) : 0;
  const overShare = goal > 0 ? Math.min(1, over / goal) * FULL : 0;

  return (
    <div
      role="meter"
      aria-label="Calories remaining today"
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-valuenow={Math.max(0, remaining)}
      aria-valuetext={
        isOver
          ? `${formatKcal(over)} kcal over the ${formatKcal(goal)} goal; ${formatKcal(consumed)} consumed`
          : `${formatKcal(remaining)} kcal left of ${formatKcal(goal)}; ${formatKcal(consumed)} consumed`
      }
      className="relative h-(--screen-gauge-h) w-(--screen-gauge-d)"
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${String(DIAMETER)} ${String(ARC_HEIGHT)}`}
        className="absolute inset-x-0 top-0 h-(--screen-gauge-arc-h) w-full"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={DIAMETER}
            y2="0"
          >
            <stop offset="0" style={{ stopColor: 'var(--plate-accent-gauge-start)' }} />
            <stop offset="0.34" style={{ stopColor: 'var(--plate-accent-gauge-mid)' }} />
            <stop offset="0.58" style={{ stopColor: 'var(--plate-accent-gauge-end)' }} />
            <stop offset="0.76" style={{ stopColor: 'var(--plate-accent-gauge-end)' }} />
          </linearGradient>
        </defs>
        <path
          d={ARC_PATH}
          fill="none"
          className="stroke-bg-sunken"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        <path
          d={ARC_PATH}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          pathLength={FULL}
          strokeDasharray={`${String(progress * FULL)} ${String(FULL)}`}
          className="gauge-sweep"
        />
        {isOver && (
          <path
            d={OVER_PATH}
            fill="none"
            className="stroke-feedback-warning gauge-sweep"
            strokeWidth={OVER_STROKE}
            strokeLinecap="round"
            pathLength={FULL}
            strokeDasharray={`${String(overShare)} ${String(FULL)}`}
            strokeDashoffset={overShare - FULL}
          />
        )}
      </svg>
      <div className="absolute inset-x-0 top-0 flex h-(--screen-gauge-arc-h) flex-col items-center justify-end gap-4 pb-(--screen-gauge-text-bottom)">
        <span className="type-display-calorie text-text-primary">
          {formatKcal(isOver ? over : remaining)}
        </span>
        <span className="type-caption-1 text-text-secondary">
          {isOver ? 'over today’s goal' : 'kcal left'}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between">
        <span className="flex flex-col gap-2">
          <span className="type-headline text-text-primary">{formatKcal(consumed)}</span>
          <span className="type-caption-2 text-text-secondary">Consumed</span>
        </span>
        <span className="flex flex-col items-end gap-2">
          <span className="type-headline text-text-primary">{formatKcal(goal)}</span>
          <span className="type-caption-2 text-text-secondary">Goal</span>
        </span>
      </div>
    </div>
  );
}
