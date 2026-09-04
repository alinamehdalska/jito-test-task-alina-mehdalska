import { isSameDay, subDays } from 'date-fns';

import { MEAL_LABEL } from '@/domain/meals';
import { MEAL_ORDER } from '@/domain/types';
import {
  dayKey,
  describeDay,
  describeLogTarget,
  resolveLogTarget,
  useLogTargetStore,
} from '@/features/diary/log-target-store';
import { useNow, useToday } from '@/features/diary/use-today';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { SectionLabel } from '@/shared/ui/section-label';
import { SheetDialog } from '@/shared/ui/sheet-dialog';

/**
 * The pull-down that names where a log will land — `Breakfast · Today`. Under the title on
 * form screens (frames 2, 3, 7b); a chip in a "Log to" row on the recipe screens, which have
 * no title bar. One menu, one default from the clock, two placements.
 */
export function MealPickerTrigger({ variant }: { readonly variant: 'subtitle' | 'chip' }) {
  const today = useToday();
  const now = useNow();
  const meal = useLogTargetStore((state) => state.meal);
  const day = useLogTargetStore((state) => state.day);
  const openPicker = useLogTargetStore((state) => state.openPicker);
  const label = describeLogTarget(resolveLogTarget({ meal, day }, now), today);

  const button = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Log to ${label}. Change meal or day`}
      onClick={openPicker}
      className={cn(
        'inline-flex items-center gap-4 whitespace-nowrap',
        variant === 'subtitle'
          ? 'type-footnote text-accent-primary-strong'
          : 'h-control-chip rounded-full bg-bg-surface px-16 type-subhead-emphasized text-text-primary shadow-xs',
      )}
    >
      {label}
      <Icon
        name="caret-right"
        className={cn(
          'rotate-90',
          variant === 'subtitle' ? 'size-16' : 'size-16 text-text-secondary',
        )}
      />
    </button>
  );

  if (variant === 'subtitle') return button;
  return (
    <div className="flex h-control-button items-center gap-8">
      <span className="type-subhead text-text-secondary">Log to</span>
      {button}
    </div>
  );
}

/** The menu behind the pull-down: the four meals and the day, then Done. */
export function MealPickerSheet() {
  const today = useToday();
  const now = useNow();
  const isOpen = useLogTargetStore((state) => state.isPickerOpen);
  const close = useLogTargetStore((state) => state.closePicker);
  const meal = useLogTargetStore((state) => state.meal);
  const day = useLogTargetStore((state) => state.day);
  const setMeal = useLogTargetStore((state) => state.setMeal);
  const setDay = useLogTargetStore((state) => state.setDay);
  const target = resolveLogTarget({ meal, day }, now);

  const yesterday = subDays(today, 1);
  const days = [today, yesterday];
  if (!days.some((option) => isSameDay(option, target.day))) days.push(target.day);

  return (
    <SheetDialog isOpen={isOpen} onClose={close} title="Log to" className="gap-16">
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
              aria-checked={target.meal === option}
              selected={target.meal === option}
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
        <SectionLabel>Day</SectionLabel>
        <div
          role="radiogroup"
          aria-label="Day"
          className="flex min-h-control-button flex-wrap items-center gap-8"
        >
          {days.map((option) => (
            <Chip
              key={dayKey(option)}
              role="radio"
              aria-checked={isSameDay(option, target.day)}
              selected={isSameDay(option, target.day)}
              onClick={() => {
                setDay(isSameDay(option, today) ? null : dayKey(option));
              }}
            >
              {describeDay(option, today)}
            </Chip>
          ))}
        </div>
      </div>
      <Button size="lg" fullWidth onClick={close}>
        Done
      </Button>
    </SheetDialog>
  );
}
