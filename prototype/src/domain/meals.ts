import type { MealSlot } from '@/domain/types';

export const MEAL_LABEL: Readonly<Record<MealSlot, string>> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};
