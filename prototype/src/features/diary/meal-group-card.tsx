import { PHOTOS } from '@/data/photos';
import type { DiaryEntry, MealSlot } from '@/domain/types';
import type { MealGroup } from '@/features/diary/selectors';
import { formatKcal, formatTime } from '@/shared/lib/format';

const MEAL_LABEL: Readonly<Record<MealSlot, string>> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

function MealEntryRow({ entry }: { readonly entry: DiaryEntry }) {
  const { nutrition } = entry;
  const thumb = entry.photo ? PHOTOS[entry.photo].thumb : undefined;
  return (
    <li className="flex items-center gap-12 py-12">
      {thumb ? (
        <img
          src={thumb}
          alt=""
          width={44}
          height={44}
          className="size-control-button shrink-0 rounded-12 object-cover"
        />
      ) : (
        <span aria-hidden="true" className="size-control-button shrink-0 rounded-12 bg-bg-sunken" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-4">
        <span className="truncate type-subhead-emphasized text-text-primary">{entry.name}</span>
        <span className="type-caption-1 text-text-tertiary">
          {formatTime(new Date(entry.loggedAt))} · P {Math.round(nutrition.protein)} · C{' '}
          {Math.round(nutrition.carbs)} · F {Math.round(nutrition.fat)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="type-subhead-emphasized text-text-primary">
          {formatKcal(nutrition.kcal)}
        </span>
        <span className="type-caption-2 text-text-tertiary">kcal</span>
      </span>
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
        <span className="text-text-tertiary uppercase">{MEAL_LABEL[group.meal]}</span>
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
