import { MACRO_ORDER, type Nutrition } from '@/domain/types';
import { HeroGauge } from '@/features/diary/hero-gauge';
import { MacroStat } from '@/features/diary/macro-stat';

interface DailyBudgetCardProps {
  readonly consumed: Nutrition;
  readonly goal: Nutrition;
}

/** Figma 8:2 "Calorie Card / daily-budget": the gauge above a hairline and the three macro bars. */
export function DailyBudgetCard({ consumed, goal }: DailyBudgetCardProps) {
  return (
    <section
      aria-label="Daily budget"
      className="flex w-full flex-col items-center gap-16 rounded-20 bg-bg-surface p-20 shadow-xs"
    >
      <HeroGauge consumed={consumed.kcal} goal={goal.kcal} />
      <hr className="w-full border-0 border-t border-border-subtle" />
      <div className="flex w-full flex-col gap-16">
        {MACRO_ORDER.map((macro) => (
          <MacroStat key={macro} macro={macro} consumed={consumed[macro]} target={goal[macro]} />
        ))}
      </div>
    </section>
  );
}
