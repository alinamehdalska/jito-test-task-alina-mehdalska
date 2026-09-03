import { routes } from '@/app/routes';
import { DailyBudgetCard } from '@/features/diary/daily-budget-card';
import { MealGroupCard } from '@/features/diary/meal-group-card';
import { consumedForDay, entriesForDay, groupByMeal } from '@/features/diary/selectors';
import { useDiaryStore } from '@/features/diary/store';
import { useToday } from '@/features/diary/use-today';
import { formatDayTitle, formatKcal } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { ButtonLink } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

const PUSH = { transition: 'push' } as const;

/**
 * Frame 1, "Dashboard". Answers four questions in reading order: how many calories are
 * left, how many consumed, what have I eaten, and what do I do next.
 */
export function DashboardScreen() {
  const today = useToday();
  const goal = useDiaryStore((state) => state.goal);
  const entries = useDiaryStore((state) => state.entries);
  const todaysEntries = entriesForDay(entries, today);
  const consumed = consumedForDay(entries, today);
  const groups = groupByMeal(todaysEntries);

  return (
    <div className="flex flex-col gap-20 px-20 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="type-large-title text-text-primary">Today</h1>
          <p className="type-subhead text-text-secondary">{formatDayTitle(today)}</p>
        </div>
        <Avatar initials="AM" name="Alina" />
      </header>

      <DailyBudgetCard consumed={consumed} goal={goal} />

      <div className="flex items-center gap-12">
        <ButtonLink
          to={routes.product}
          size="lg"
          fullWidth
          viewTransition
          state={PUSH}
          className="flex-1"
        >
          + Add food
        </ButtonLink>
        <ButtonLink
          to={routes.product}
          size="lg"
          variant="secondary"
          viewTransition
          state={PUSH}
          aria-label="Scan a barcode"
          className="w-control-fab shrink-0 px-0 text-accent-primary"
        >
          <Icon name="scan" />
        </ButtonLink>
      </div>

      <section aria-labelledby="todays-meals" className="flex flex-col gap-20">
        <div className="flex items-baseline justify-between">
          <h2 id="todays-meals" className="type-title-3 text-text-primary">
            Today&apos;s meals
          </h2>
          <span className="type-subhead text-text-secondary">{formatKcal(consumed.kcal)} kcal</span>
        </div>
        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <MealGroupCard key={group.meal} group={group} />
          ))}
        </div>
      </section>
    </div>
  );
}
