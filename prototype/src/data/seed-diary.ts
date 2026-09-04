import { set } from 'date-fns';

import type { DiaryEntry, Goal } from '@/domain/types';

/** The dashboard frame's budget: 1,850 kcal · C 220 · P 120 · F 65. */
export const SEED_GOAL: Goal = { kcal: 1850, carbs: 220, protein: 120, fat: 65 };

interface SeedMeal {
  readonly id: string;
  readonly name: string;
  readonly meal: DiaryEntry['meal'];
  readonly hours: number;
  readonly minutes: number;
  readonly nutrition: DiaryEntry['nutrition'];
  readonly amount: DiaryEntry['amount'];
  readonly photo: NonNullable<DiaryEntry['photo']>;
}

/**
 * The three meals on the dashboard frame. They reconcile: 320 + 540 + 380 = 1,240 kcal and
 * P 78 · C 142 · F 41, leaving 610 of the 1,850 budget.
 */
const SEED_MEALS: readonly SeedMeal[] = [
  {
    id: 'seed-breakfast',
    name: 'Greek yogurt bowl',
    meal: 'breakfast',
    hours: 8,
    minutes: 30,
    nutrition: { kcal: 320, protein: 22, carbs: 38, fat: 8 },
    amount: { value: 250, unit: 'g' },
    photo: 'yogurt-bowl',
  },
  {
    id: 'seed-lunch',
    name: 'Chicken & quinoa salad',
    meal: 'lunch',
    hours: 13,
    minutes: 15,
    nutrition: { kcal: 540, protein: 44, carbs: 62, fat: 14 },
    amount: { value: 320, unit: 'g' },
    photo: 'quinoa-salad',
  },
  {
    id: 'seed-snack',
    name: 'Trail mix, 55 g',
    meal: 'snack',
    hours: 16,
    minutes: 0,
    nutrition: { kcal: 380, protein: 12, carbs: 42, fat: 19 },
    amount: { value: 55, unit: 'g' },
    photo: 'trail-mix',
  },
];

/** Seed entries dated on `today`, so the demo always shows a populated current day. */
export function createSeedEntries(today: Date): DiaryEntry[] {
  return SEED_MEALS.map(({ hours, minutes, ...meal }) => ({
    ...meal,
    source: 'seed',
    loggedAt: set(today, { hours, minutes, seconds: 0, milliseconds: 0 }).toISOString(),
  }));
}
