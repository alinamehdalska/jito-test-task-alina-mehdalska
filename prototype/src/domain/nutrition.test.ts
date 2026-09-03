import { describe, expect, it } from 'vitest';

import {
  kcalFromMacro,
  kcalShare,
  mealForTime,
  percentOfGoal,
  perServing,
  remainingKcal,
  scaleNutrition,
  sumNutrition,
} from '@/domain/nutrition';
import type { Nutrition } from '@/domain/types';

const FAGE_2_PERCENT: Nutrition = { kcal: 73, protein: 10, carbs: 3.6, fat: 2 };

describe('scaleNutrition', () => {
  it('scales a label to the 170 g serving of the product calculator', () => {
    const serving = scaleNutrition(FAGE_2_PERCENT, 170);
    expect(serving).toEqual({ kcal: 124, protein: 17, carbs: 6.1, fat: 3.4 });
    // The per-macro column reproduces the label within rounding, as real labels do.
    const fromMacros =
      kcalFromMacro('protein', 17) + kcalFromMacro('carbs', 6.1) + kcalFromMacro('fat', 3.4);
    expect(Math.abs(fromMacros - serving.kcal)).toBeLessThanOrEqual(2);
  });
});

describe('sumNutrition and remainingKcal', () => {
  const seed: Nutrition[] = [
    { kcal: 320, protein: 22, carbs: 38, fat: 8 },
    { kcal: 540, protein: 44, carbs: 62, fat: 14 },
    { kcal: 380, protein: 12, carbs: 42, fat: 19 },
  ];

  it('reproduces the dashboard totals — 1,240 kcal, P78 C142 F41, 610 left', () => {
    const consumed = sumNutrition(seed);
    expect(consumed).toEqual({ kcal: 1240, protein: 78, carbs: 142, fat: 41 });
    expect(remainingKcal({ kcal: 1850, carbs: 220, protein: 120, fat: 65 }, consumed)).toBe(610);
  });
});

describe('perServing', () => {
  it('splits the dish calculator total — 488 kcal over 2 servings is 244', () => {
    const dish = sumNutrition([
      { kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 },
      { kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
      { kcal: 80, protein: 1, carbs: 4.3, fat: 7.4 },
      { kcal: 40, protein: 2, carbs: 8, fat: 0.3 },
    ]);
    expect(dish.kcal).toBe(488);
    expect(perServing(dish, 2).kcal).toBe(244);
  });

  it('never divides by less than one serving', () => {
    expect(perServing({ kcal: 100, protein: 1, carbs: 1, fat: 1 }, 0).kcal).toBe(100);
  });
});

describe('percentOfGoal and kcalShare', () => {
  it('matches the recipe macro row — 28 / 19 / 28 percent of the daily goal', () => {
    expect(percentOfGoal(34, 120)).toBe(28);
    expect(percentOfGoal(42, 220)).toBe(19);
    expect(percentOfGoal(18, 65)).toBe(28);
  });

  it('tells a high-protein recipe from a balanced one', () => {
    expect(kcalShare({ kcal: 445, protein: 40, carbs: 30, fat: 16 }, 'protein')).toBe(36);
    expect(kcalShare({ kcal: 480, protein: 34, carbs: 42, fat: 18 }, 'protein')).toBe(28);
  });
});

describe('mealForTime', () => {
  const at = (hour: number) => new Date(2026, 8, 3, hour, 30);
  it('assigns the meal from the hour of day', () => {
    expect(mealForTime(at(8))).toBe('breakfast');
    expect(mealForTime(at(10))).toBe('breakfast');
    expect(mealForTime(at(11))).toBe('lunch');
    expect(mealForTime(at(13))).toBe('lunch');
    expect(mealForTime(at(16))).toBe('snack');
    expect(mealForTime(at(19))).toBe('dinner');
  });
});
