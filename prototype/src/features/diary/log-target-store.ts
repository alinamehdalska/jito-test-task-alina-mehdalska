import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { create } from 'zustand';

import { MEAL_LABEL } from '@/domain/meals';
import { mealForTime } from '@/domain/nutrition';
import type { MealSlot } from '@/domain/types';
import { formatDayShort } from '@/shared/lib/format';

export const DAY_KEY_FORMAT = 'yyyy-MM-dd';

interface LogTargetState {
  /** `null` means "whatever the clock says" — the smart default, changeable in one tap. */
  readonly meal: MealSlot | null;
  /** A `yyyy-MM-dd` key, or `null` for today. The diary sets it when another day is open. */
  readonly day: string | null;
  readonly isPickerOpen: boolean;
  readonly setMeal: (meal: MealSlot | null) => void;
  readonly setDay: (day: string | null) => void;
  readonly openPicker: () => void;
  readonly closePicker: () => void;
  readonly reset: () => void;
}

/**
 * Every log action names its meal and day before it commits (design-system.md composition
 * rule 10). This is that choice, shared by the calculators, the search and the recipe screens.
 */
export const useLogTargetStore = create<LogTargetState>()((set) => ({
  meal: null,
  day: null,
  isPickerOpen: false,
  setMeal: (meal) => {
    set({ meal });
  },
  setDay: (day) => {
    set({ day });
  },
  openPicker: () => {
    set({ isPickerOpen: true });
  },
  closePicker: () => {
    set({ isPickerOpen: false });
  },
  reset: () => {
    set({ meal: null, day: null, isPickerOpen: false });
  },
}));

export interface LogTarget {
  readonly meal: MealSlot;
  readonly day: Date;
}

export function dayKey(date: Date): string {
  return format(date, DAY_KEY_FORMAT);
}

/** The concrete meal and day a log lands in, given the choice and the clock. */
export function resolveLogTarget(
  choice: Pick<LogTargetState, 'meal' | 'day'>,
  now: Date,
): LogTarget {
  const parsed = choice.day ? parseISO(choice.day) : now;
  return {
    meal: choice.meal ?? mealForTime(now),
    day: isValid(parsed) ? parsed : now,
  };
}

/** `Today` · `Yesterday` · `Wed 2 Sep`. */
export function describeDay(day: Date, today: Date): string {
  const behind = differenceInCalendarDays(today, day);
  if (behind === 0) return 'Today';
  if (behind === 1) return 'Yesterday';
  return formatDayShort(day);
}

/** `Breakfast · Today` — what the pull-down reads. */
export function describeLogTarget(target: LogTarget, today: Date): string {
  return `${MEAL_LABEL[target.meal]} · ${describeDay(target.day, today)}`;
}
