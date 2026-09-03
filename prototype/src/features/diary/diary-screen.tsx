import { format, isValid, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router';

import { useAddSheetStore } from '@/features/add-sheet/store';
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
 * shows the empty state, which is how a real tracker looks on day one.
 */
export function DiaryScreen() {
  const today = useToday();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = readDay(searchParams.get(DAY_PARAM), today);
  const entries = useDiaryStore((state) => state.entries);
  const openSheet = useAddSheetStore((state) => state.open);

  const dayEntries = entriesForDay(entries, selected);
  const groups = groupByMeal(dayEntries);
  const consumed = consumedForDay(entries, selected);

  const selectDay = (day: Date) => {
    setSearchParams({ [DAY_PARAM]: format(day, DAY_FORMAT) }, { replace: true });
  };

  return (
    <div className="flex min-h-full flex-col gap-20 px-20 pt-4">
      <header className="flex flex-col gap-2">
        <h1 className="type-large-title text-text-primary">Diary</h1>
        <p className="type-subhead text-text-secondary">{formatDayTitle(selected)}</p>
      </header>

      <WeekStrip today={today} selected={selected} onSelect={selectDay} />

      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState
            icon="bowl-food"
            title="Nothing logged yet"
            body="Log a meal and the day starts filling in."
            action={
              <Button size="md" onClick={openSheet} aria-haspopup="dialog">
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
        </section>
      )}
    </div>
  );
}
