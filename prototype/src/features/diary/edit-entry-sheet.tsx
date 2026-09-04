import { format, set } from 'date-fns';
import { useState } from 'react';

import { PHOTOS } from '@/data/photos';
import { MEAL_LABEL } from '@/domain/meals';
import { multiplyNutrition } from '@/domain/nutrition';
import { type DiaryEntry, MEAL_ORDER, type MealSlot } from '@/domain/types';
import { useEditEntryStore } from '@/features/diary/edit-entry-store';
import { describeDay } from '@/features/diary/log-target-store';
import { useDiaryStore } from '@/features/diary/store';
import { useToday } from '@/features/diary/use-today';
import { useToastStore } from '@/features/toast/store';
import { formatKcal, formatServings, formatTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { SectionLabel } from '@/shared/ui/section-label';
import { SheetDialog } from '@/shared/ui/sheet-dialog';
import { Stepper } from '@/shared/ui/stepper';

const GRAMS = { step: 10, min: 10, max: 2000 } as const;
const SERVINGS = { step: 0.5, min: 0.5, max: 8 } as const;
const TIME_FORMAT = 'HH:mm';

function readTime(value: string): { hours: number; minutes: number } {
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
  return { hours, minutes };
}

function EntryCard({ entry, kcal }: { readonly entry: DiaryEntry; readonly kcal: number }) {
  const thumb = entry.photo ? PHOTOS[entry.photo].thumb : undefined;
  const { nutrition } = entry;
  return (
    <div className="flex items-center gap-12 rounded-16 bg-bg-raised px-16 py-12">
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
        <span className="type-caption-1 text-text-secondary">
          {formatTime(new Date(entry.loggedAt))} · P {Math.round(nutrition.protein)} · C{' '}
          {Math.round(nutrition.carbs)} · F {Math.round(nutrition.fat)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="type-subhead-emphasized text-text-primary">{formatKcal(kcal)}</span>
        <span className="type-caption-2 text-text-secondary">kcal</span>
      </span>
    </div>
  );
}

function EditForm({
  entry,
  onClose,
}: {
  readonly entry: DiaryEntry;
  readonly onClose: () => void;
}) {
  const today = useToday();
  const update = useDiaryStore((state) => state.update);
  const remove = useDiaryStore((state) => state.remove);
  const restore = useDiaryStore((state) => state.restore);
  const showToast = useToastStore((state) => state.show);
  const loggedAt = new Date(entry.loggedAt);
  const [amount, setAmount] = useState(entry.amount.value);
  const [meal, setMeal] = useState<MealSlot>(entry.meal);
  const [time, setTime] = useState(format(loggedAt, TIME_FORMAT));
  const isGrams = entry.amount.unit === 'g';
  const nutrition = multiplyNutrition(entry.nutrition, amount / entry.amount.value);

  const save = () => {
    update(entry.id, {
      amount: { ...entry.amount, value: amount },
      nutrition,
      meal,
      loggedAt: set(loggedAt, { ...readTime(time), seconds: 0, milliseconds: 0 }).toISOString(),
    });
    onClose();
  };

  // feedback.danger's one job: deleting a log entry. Reversible, like logging is.
  const del = () => {
    remove(entry.id);
    onClose();
    showToast({
      title: 'Removed from diary',
      detail: `${entry.name} · ${formatKcal(entry.nutrition.kcal)} kcal`,
      onUndo: () => {
        restore(entry);
      },
    });
  };

  return (
    <>
      <EntryCard entry={entry} kcal={nutrition.kcal} />

      <div className="flex flex-col gap-8">
        <SectionLabel>Amount</SectionLabel>
        <div className="flex min-h-control-cta items-center justify-between rounded-16 bg-bg-raised py-4 pr-12 pl-16">
          <span className="type-subhead text-text-secondary">
            {formatKcal(nutrition.kcal)} kcal
          </span>
          <Stepper
            label={isGrams ? 'Amount in grams' : 'Servings'}
            value={amount}
            onChange={setAmount}
            step={isGrams ? GRAMS.step : SERVINGS.step}
            min={isGrams ? GRAMS.min : SERVINGS.min}
            max={isGrams ? GRAMS.max : SERVINGS.max}
            unit={isGrams ? 'g' : undefined}
            editable={isGrams}
            formatValue={isGrams ? String : formatServings}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SectionLabel>Meal</SectionLabel>
        <div
          role="radiogroup"
          aria-label="Meal"
          className="flex min-h-control-button flex-wrap items-center gap-8"
        >
          {MEAL_ORDER.map((option) => (
            <Chip
              key={option}
              role="radio"
              aria-checked={meal === option}
              selected={meal === option}
              onClick={() => {
                setMeal(option);
              }}
            >
              {MEAL_LABEL[option]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SectionLabel>Time</SectionLabel>
        <div className="flex min-h-control-cta items-center justify-between rounded-16 bg-bg-raised py-4 pr-12 pl-16">
          <span className="flex items-baseline gap-4 type-headline text-text-primary">
            <span>{describeDay(loggedAt, today)},</span>
            <input
              type="time"
              aria-label="Time"
              value={time}
              onChange={(event) => {
                setTime(event.target.value);
              }}
              className="bg-transparent type-headline text-text-primary outline-none"
            />
          </span>
          <Icon name="caret-right" className="size-20 text-text-secondary" />
        </div>
      </div>

      <Button size="lg" fullWidth onClick={save}>
        Save changes
      </Button>
      <Button size="lg" fullWidth variant="destructive" onClick={del}>
        Delete entry
      </Button>
    </>
  );
}

/**
 * Frame 9, "Edit entry" — the diary's correction surface. Logging is fast and forgiving on
 * purpose, so the second most frequent action is fixing what just went in: wrong portion,
 * wrong meal, wrong time, logged twice. Opened from any meal row.
 */
export function EditEntrySheet() {
  const entryId = useEditEntryStore((state) => state.entryId);
  const close = useEditEntryStore((state) => state.close);
  const entry = useDiaryStore((state) => state.entries.find((item) => item.id === entryId));
  return (
    <SheetDialog isOpen={entry !== undefined} onClose={close} title="Edit entry" className="gap-16">
      {entry && <EditForm key={entry.id} entry={entry} onClose={close} />}
    </SheetDialog>
  );
}
