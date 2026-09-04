import { format, isSameDay, isValid, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router';

import { useAddSheetStore } from '@/features/add-sheet/store';
import { dayKey, useLogTargetStore } from '@/features/diary/log-target-store';
import { MealGroupCard } from '@/features/diary/meal-group-card';
import { consumedForDay, entriesForDay, groupByMeal } from '@/features/diary/selectors';
import { useDiaryStore } from '@/features/diary/store';
import { useToday } from '@/features/diary/use-today';
import { WeekStrip } from '@/features/diary/week-strip';
import { formatDayTitle, formatKcal } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

const DAY_PARAM = 'day';
const DAY_FORMAT = 'yyyy-MM-dd';

function readDay(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : fallback;
}

/**
 * Frame 7, "Diary". Today shows the same meals as the dashboard; any other day of the week
 * shows the empty state, which is how a real tracker looks on day one. The open day carries
 * into the log flow: "+ Add food" on Wednesday logs into Wednesday.
 */
export function DiaryScreen() {
  const today = useToday();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = readDay(searchParams.get(DAY_PARAM), today);
  const entries = useDiaryStore((state) => state.entries);
  const openSheet = useAddSheetStore((state) => state.open);
  const setTargetDay = useLogTargetStore((state) => state.setDay);

  const dayEntries = entriesForDay(entries, selected);
  const groups = groupByMeal(dayEntries);
  const consumed = consumedForDay(entries, selected);
  const loggedDays = new Set(entries.map((entry) => dayKey(new Date(entry.loggedAt))));

  const selectDay = (day: Date) => {
    setSearchParams({ [DAY_PARAM]: format(day, DAY_FORMAT) }, { replace: true });
  };
  const addFood = () => {
    setTargetDay(isSameDay(selected, today) ? null : dayKey(selected));
    openSheet();
  };

  return (
    <div className="flex min-h-full flex-col gap-20 px-20 pt-4">
      <header className="flex flex-col gap-2">
        <h1 className="type-large-title text-text-primary">Diary</h1>
        <p className="type-subhead text-text-secondary">{formatDayTitle(selected)}</p>
      </header>

      <WeekStrip today={today} selected={selected} loggedDays={loggedDays} onSelect={selectDay} />

      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState
            icon="bowl-food"
            title="Nothing logged yet"
            body="Log a meal and the day starts filling in."
            action={
              <Button size="md" onClick={addFood} aria-haspopup="dialog">
                + Add food
              </Button>
            }
          />
        </div>
      ) : (
        <section aria-label="Logged meals" className="flex flex-col gap-12">
          <div className="flex items-baseline justify-between">
            <h2 className="type-title-3 text-text-primary">Meals</h2>
            <span className="type-subhead text-text-secondary">
              {formatKcal(consumed.kcal)} kcal
            </span>
          </div>
          {groups.map((group) => (
            <MealGroupCard key={group.meal} group={group} />
          ))}
          <Button size="md" variant="secondary" onClick={addFood} aria-haspopup="dialog">
            + Add food
          </Button>
        </section>
      )}
    </div>
  );
}
