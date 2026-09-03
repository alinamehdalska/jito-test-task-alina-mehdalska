import { isSameDay } from 'date-fns';

import { remainingKcal, sumNutrition } from '@/domain/nutrition';
import { type DiaryEntry, MEAL_ORDER, type MealSlot, type Nutrition } from '@/domain/types';

export function entriesForDay(entries: readonly DiaryEntry[], day: Date): DiaryEntry[] {
  return entries
    .filter((entry) => isSameDay(new Date(entry.loggedAt), day))
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
}

export function consumedForDay(entries: readonly DiaryEntry[], day: Date): Nutrition {
  return sumNutrition(entriesForDay(entries, day).map((entry) => entry.nutrition));
}

export function remainingForDay(
  goal: Nutrition,
  entries: readonly DiaryEntry[],
  day: Date,
): number {
  return remainingKcal(goal, consumedForDay(entries, day));
}

export interface MealGroup {
  readonly meal: MealSlot;
  readonly entries: readonly DiaryEntry[];
  readonly kcal: number;
}

/** Meals in the order of the day, skipping the ones with nothing logged. */
export function groupByMeal(entries: readonly DiaryEntry[]): MealGroup[] {
  return MEAL_ORDER.flatMap((meal) => {
    const inMeal = entries.filter((entry) => entry.meal === meal);
    if (inMeal.length === 0) return [];
    return [
      { meal, entries: inMeal, kcal: sumNutrition(inMeal.map((entry) => entry.nutrition)).kcal },
    ];
  });
}
