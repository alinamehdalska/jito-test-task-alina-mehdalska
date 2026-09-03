import { type MacroKey, type MealSlot, type Nutrition } from '@/domain/types';

/** Atwater factors — kcal per gram — used only for the per-macro energy column. */
export const KCAL_PER_GRAM: Readonly<Record<MacroKey, number>> = { carbs: 4, protein: 4, fat: 9 };

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Label values are per 100 g; a serving is a plain proportion of them. */
export function scaleNutrition(per100g: Nutrition, grams: number): Nutrition {
  const ratio = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * ratio),
    carbs: roundTo(per100g.carbs * ratio, 1),
    protein: roundTo(per100g.protein * ratio, 1),
    fat: roundTo(per100g.fat * ratio, 1),
  };
}

export function kcalFromMacro(macro: MacroKey, grams: number): number {
  return Math.round(grams * KCAL_PER_GRAM[macro]);
}

export const EMPTY_NUTRITION: Nutrition = { kcal: 0, carbs: 0, protein: 0, fat: 0 };

export function sumNutrition(items: readonly Nutrition[]): Nutrition {
  return items.reduce<Nutrition>(
    (total, item) => ({
      kcal: total.kcal + item.kcal,
      carbs: roundTo(total.carbs + item.carbs, 1),
      protein: roundTo(total.protein + item.protein, 1),
      fat: roundTo(total.fat + item.fat, 1),
    }),
    EMPTY_NUTRITION,
  );
}

export function perServing(total: Nutrition, servings: number): Nutrition {
  const share = 1 / Math.max(1, servings);
  return {
    kcal: Math.round(total.kcal * share),
    carbs: roundTo(total.carbs * share, 1),
    protein: roundTo(total.protein * share, 1),
    fat: roundTo(total.fat * share, 1),
  };
}

export function multiplyNutrition(nutrition: Nutrition, factor: number): Nutrition {
  return {
    kcal: Math.round(nutrition.kcal * factor),
    carbs: roundTo(nutrition.carbs * factor, 1),
    protein: roundTo(nutrition.protein * factor, 1),
    fat: roundTo(nutrition.fat * factor, 1),
  };
}

/** What is left of the daily budget. Negative means over budget — amber, never red. */
export function remainingKcal(goal: Nutrition, consumed: Nutrition): number {
  return goal.kcal - consumed.kcal;
}

export function percentOfGoal(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((value / target) * 100);
}

/** Share of a serving's energy that one macro supplies, 0–100. */
export function kcalShare(nutrition: Nutrition, macro: MacroKey): number {
  if (nutrition.kcal <= 0) return 0;
  return Math.round((kcalFromMacro(macro, nutrition[macro]) / nutrition.kcal) * 100);
}

const BREAKFAST_UNTIL = 11;
const LUNCH_UNTIL = 15;
const SNACK_UNTIL = 18;

/** Which meal a log at this time belongs to; the product does not ask, it infers. */
export function mealForTime(date: Date): MealSlot {
  const hour = date.getHours();
  if (hour < BREAKFAST_UNTIL) return 'breakfast';
  if (hour < LUNCH_UNTIL) return 'lunch';
  if (hour < SNACK_UNTIL) return 'snack';
  return 'dinner';
}
