import { thumbFor } from '@/data/photos';
import { MEAL_LABEL } from '@/domain/meals';
import type { DiaryEntry } from '@/domain/types';
import { useEditEntryStore } from '@/features/diary/edit-entry-store';
import type { MealGroup } from '@/features/diary/selectors';
import { formatKcal, formatTime } from '@/shared/lib/format';

/** One logged item. Tapping it opens the edit sheet — a diary is only as good as its corrections. */
function MealEntryRow({ entry }: { readonly entry: DiaryEntry }) {
  const openEdit = useEditEntryStore((state) => state.open);
  const { nutrition } = entry;
  const thumb = thumbFor(entry.photo);
  return (
    <li>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Edit ${entry.name}`}
        onClick={() => {
          openEdit(entry.id);
        }}
        className="flex w-full items-center gap-12 py-12 text-left transition-colors duration-press active:bg-bg-raised"
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            width={44}
            height={44}
            className="size-control-button shrink-0 rounded-12 object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="size-control-button shrink-0 rounded-12 bg-bg-sunken"
          />
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="truncate type-subhead-emphasized text-text-primary">{entry.name}</span>
          <span className="type-caption-1 text-text-secondary">
            {formatTime(new Date(entry.loggedAt))} · P {Math.round(nutrition.protein)} · C{' '}
            {Math.round(nutrition.carbs)} · F {Math.round(nutrition.fat)}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="type-subhead-emphasized text-text-primary">
            {formatKcal(nutrition.kcal)}
          </span>
          <span className="type-caption-2 text-text-secondary">kcal</span>
        </span>
      </button>
    </li>
  );
}

/** Figma 182:511 "breakfast-stack": one grouped card per meal, rows separated by hairlines. */
export function MealGroupCard({ group }: { readonly group: MealGroup }) {
  return (
    <section
      aria-label={MEAL_LABEL[group.meal]}
      className="flex w-full flex-col rounded-20 bg-bg-surface px-16 pt-4 pb-8 shadow-xs"
    >
      <header className="flex items-center justify-between pt-8 pb-12 type-caption-1">
        <span className="text-text-secondary uppercase">{MEAL_LABEL[group.meal]}</span>
        <span className="text-text-secondary">{formatKcal(group.kcal)} kcal</span>
      </header>
      <ul className="divide-y divide-border-subtle border-t border-border-subtle">
        {group.entries.map((entry) => (
          <MealEntryRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
