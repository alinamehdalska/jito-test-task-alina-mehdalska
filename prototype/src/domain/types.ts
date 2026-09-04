/** The macro spine: coral = carbs, periwinkle = protein, sky = fat — fixed everywhere. */
export type MacroKey = 'carbs' | 'protein' | 'fat';

/** Composition rule 8: macros are always listed carbs → protein → fat, never re-sorted by value. */
export const MACRO_ORDER = ['carbs', 'protein', 'fat'] as const satisfies readonly MacroKey[];

/** Grams of each macro. */
export interface Macros {
  readonly carbs: number;
  readonly protein: number;
  readonly fat: number;
}

/** Macros plus the energy they add up to (from the label, not re-derived). */
export interface Nutrition extends Macros {
  readonly kcal: number;
}

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export const MEAL_ORDER = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
] as const satisfies readonly MealSlot[];

/** Drives the icon in ingredient wells; the UI maps it to a glyph. */
export type FoodCategory = 'protein' | 'grain' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'other';

export type PhotoKey =
  | 'yogurt-bowl'
  | 'quinoa-salad'
  | 'trail-mix'
  | 'greek-yogurt'
  | 'salmon-bowl'
  | 'miso-bowl'
  | 'shakshuka'
  | 'tuna-nicoise';

/** The serving the label names — "1 pot · 170 g" — offered before any round number. */
export interface ProductServing {
  readonly label: string;
  readonly grams: number;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand?: string | undefined;
  readonly category: FoodCategory;
  readonly per100g: Nutrition;
  readonly photo?: PhotoKey | undefined;
  readonly serving?: ProductServing | undefined;
}

export type AmountUnit = 'g' | 'serving';

/** How much was logged, in the unit the entry was made in; editing rescales from it. */
export interface EntryAmount {
  readonly value: number;
  readonly unit: AmountUnit;
}

export type EntrySource = 'seed' | 'product' | 'dish' | 'recipe';

export interface DiaryEntry {
  readonly id: string;
  readonly name: string;
  readonly meal: MealSlot;
  /** ISO timestamp of when it was eaten. */
  readonly loggedAt: string;
  readonly amount: EntryAmount;
  readonly nutrition: Nutrition;
  readonly source: EntrySource;
  readonly photo?: PhotoKey | undefined;
}

/** Daily targets. */
export type Goal = Nutrition;
