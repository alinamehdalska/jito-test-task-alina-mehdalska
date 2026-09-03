import type { Recipe, RecipeTag } from '@/data/recipes';
import { kcalShare } from '@/domain/nutrition';

/** How a recipe's serving relates to what is left of today's budget. */
export type Match = 'fits' | 'tight' | 'none';

/** Below this share of the remaining budget a serving fits comfortably. */
const COMFORTABLE_SHARE = 0.8;
/** At or above this share of a serving's energy from protein, protein is the story. */
const HIGH_PROTEIN_SHARE = 35;
const HIGH_PROTEIN_GRAMS = 30;
const QUICK_MINUTES = 30;
const LOW_CARB_GRAMS = 30;

export function matchFor(kcal: number, remaining: number): Match {
  if (kcal <= remaining * COMFORTABLE_SHARE) return 'fits';
  if (kcal <= remaining) return 'tight';
  return 'none';
}

export interface Reason {
  /** Positive is reserved for the calorie/macro fit; neutral carries attributes. */
  readonly tone: 'positive' | 'neutral';
  readonly label: string;
}

/**
 * Why a recipe is recommended — the app says why, not just that it is. High protein wins
 * when it is the stronger story; otherwise the fit speaks.
 */
export function reasonFor(recipe: Recipe, remaining: number): Reason {
  if (kcalShare(recipe.perServing, 'protein') >= HIGH_PROTEIN_SHARE) {
    return { tone: 'neutral', label: 'High protein' };
  }
  switch (matchFor(recipe.perServing.kcal, remaining)) {
    case 'fits':
      return { tone: 'positive', label: 'Fits your calories' };
    case 'tight':
      return { tone: 'neutral', label: 'Tight fit' };
    case 'none':
      return { tone: 'neutral', label: 'Above today’s budget' };
  }
}

export const FILTER_IDS = ['fits', 'protein', 'quick', 'vegetarian', 'low-carb'] as const;
export type FilterId = (typeof FILTER_IDS)[number];

export const FILTER_LABEL: Readonly<Record<FilterId, string>> = {
  fits: 'Fits my calories',
  protein: 'High protein',
  quick: 'Under 30 min',
  vegetarian: 'Vegetarian',
  'low-carb': 'Low carb',
};

const hasTag = (recipe: Recipe, tag: RecipeTag) => recipe.tags.includes(tag);

export function passesFilter(recipe: Recipe, filter: FilterId, remaining: number): boolean {
  switch (filter) {
    case 'fits':
      return matchFor(recipe.perServing.kcal, remaining) !== 'none';
    case 'protein':
      return recipe.perServing.protein >= HIGH_PROTEIN_GRAMS;
    case 'quick':
      return recipe.minutes < QUICK_MINUTES;
    case 'vegetarian':
      return hasTag(recipe, 'vegetarian');
    case 'low-carb':
      return recipe.perServing.carbs < LOW_CARB_GRAMS;
  }
}

export function applyFilters(
  recipes: readonly Recipe[],
  active: ReadonlySet<FilterId>,
  remaining: number,
  query = '',
): Recipe[] {
  const needle = query.trim().toLowerCase();
  return recipes.filter(
    (recipe) =>
      (needle === '' || recipe.name.toLowerCase().includes(needle)) &&
      [...active].every((filter) => passesFilter(recipe, filter, remaining)),
  );
}
