import type { Recipe, RecipeTag } from '@/data/recipes';
import { kcalShare } from '@/domain/nutrition';
import { formatKcal } from '@/shared/lib/format';

/** How a recipe's serving relates to what is left of today's budget. */
export type Match = 'fits' | 'tight' | 'none';

/** Below this share of the remaining budget a serving fits comfortably. */
const COMFORTABLE_SHARE = 0.8;
/** At or above this share of a serving's energy from protein, protein is the story. */
const HIGH_PROTEIN_SHARE = 35;
const HIGH_PROTEIN_GRAMS = 30;
const QUICK_MINUTES = 30;
const LOW_CARB_GRAMS = 30;
/** From this hour the evening is spoken for, and Discover plans tomorrow instead. */
export const PLAN_TOMORROW_FROM_HOUR = 20;

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
 * What Discover is recommending against: what is left today, or — once nothing fits tonight,
 * or after 20:00 — a full day tomorrow. A root tab must never open on an empty grid.
 */
export type RecommendationMode = 'today' | 'tomorrow';

export function recommendationMode(
  recipes: readonly Recipe[],
  remaining: number,
  now: Date,
): RecommendationMode {
  const nothingFits = recipes.every(
    (recipe) => matchFor(recipe.perServing.kcal, remaining) === 'none',
  );
  return nothingFits || now.getHours() >= PLAN_TOMORROW_FROM_HOUR ? 'tomorrow' : 'today';
}

/**
 * Why a recipe is recommended, with the number. The app says why, not just that it is:
 * "Fits · 130 to spare" rather than a bare "Tight fit" that could mean time or calories.
 * High protein wins when it is the stronger story.
 */
export function reasonFor(
  recipe: Recipe,
  budget: number,
  mode: RecommendationMode = 'today',
): Reason {
  const { kcal } = recipe.perServing;
  if (mode === 'tomorrow') {
    return kcal <= budget
      ? { tone: 'positive', label: 'Fits tomorrow' }
      : { tone: 'neutral', label: 'Above a full day' };
  }
  if (kcalShare(recipe.perServing, 'protein') >= HIGH_PROTEIN_SHARE) {
    return { tone: 'neutral', label: 'High protein' };
  }
  const spare = formatKcal(budget - kcal);
  switch (matchFor(kcal, budget)) {
    case 'fits':
      return { tone: 'positive', label: `Fits · ${spare} to spare` };
    case 'tight':
      return { tone: 'neutral', label: `Just fits · ${spare} to spare` };
    case 'none':
      return { tone: 'neutral', label: 'Above today’s budget' };
  }
}

const MATCH_RANK: Readonly<Record<Match, number>> = { fits: 0, tight: 1, none: 2 };

/**
 * Fit is a sort, not a filter: today, what fits comes first and the rest follows in database
 * order; planning tomorrow, the lightest recipe leads.
 */
export function rankRecipes(
  recipes: readonly Recipe[],
  budget: number,
  mode: RecommendationMode,
): Recipe[] {
  const ranked = [...recipes];
  if (mode === 'tomorrow') return ranked.sort((a, b) => a.perServing.kcal - b.perServing.kcal);
  return ranked.sort(
    (a, b) =>
      MATCH_RANK[matchFor(a.perServing.kcal, budget)] -
      MATCH_RANK[matchFor(b.perServing.kcal, budget)],
  );
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

export function passesFilter(recipe: Recipe, filter: FilterId, budget: number): boolean {
  switch (filter) {
    case 'fits':
      return matchFor(recipe.perServing.kcal, budget) !== 'none';
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
  budget: number,
  query = '',
): Recipe[] {
  const needle = query.trim().toLowerCase();
  return recipes.filter(
    (recipe) =>
      (needle === '' || recipe.name.toLowerCase().includes(needle)) &&
      [...active].every((filter) => passesFilter(recipe, filter, budget)),
  );
}
