import { describe, expect, it } from 'vitest';

import { findRecipe, RECIPES } from '@/data/recipes';
import { applyFilters, matchFor, rankRecipes, reasonFor, recommendationMode } from '@/domain/match';

const REMAINING = 610;
const GOAL = 1850;
const NOON = new Date(2026, 8, 3, 12, 0);
const EVENING = new Date(2026, 8, 3, 20, 5);

function recipe(slug: string) {
  const found = findRecipe(slug);
  if (!found) throw new Error(`missing recipe ${slug}`);
  return found;
}

describe('matchFor', () => {
  it('fits below 80 % of what is left, is tight up to all of it, none beyond', () => {
    expect(matchFor(480, REMAINING)).toBe('fits');
    expect(matchFor(488, REMAINING)).toBe('fits');
    expect(matchFor(520, REMAINING)).toBe('tight');
    expect(matchFor(610, REMAINING)).toBe('tight');
    expect(matchFor(611, REMAINING)).toBe('none');
  });
});

describe('reasonFor', () => {
  it('reproduces the four Discovery cards with 610 kcal left, numbers included', () => {
    expect(reasonFor(recipe('lemon-herb-salmon-bowl'), REMAINING)).toEqual({
      tone: 'positive',
      label: 'Fits · 130 to spare',
    });
    expect(reasonFor(recipe('miso-rice-egg-bowl'), REMAINING)).toEqual({
      tone: 'positive',
      label: 'Fits · 215 to spare',
    });
    expect(reasonFor(recipe('chickpea-shakshuka'), REMAINING)).toEqual({
      tone: 'neutral',
      label: 'Just fits · 90 to spare',
    });
    expect(reasonFor(recipe('seared-tuna-nicoise'), REMAINING)).toEqual({
      tone: 'neutral',
      label: 'High protein',
    });
  });

  it('never uses the positive tone for something over budget', () => {
    expect(reasonFor(recipe('chickpea-shakshuka'), 130)).toEqual({
      tone: 'neutral',
      label: 'Above today’s budget',
    });
  });

  it('badges everything that fits a full day when planning tomorrow', () => {
    expect(reasonFor(recipe('chickpea-shakshuka'), GOAL, 'tomorrow')).toEqual({
      tone: 'positive',
      label: 'Fits tomorrow',
    });
  });
});

describe('recommendationMode', () => {
  it('plans tomorrow once nothing fits tonight, or after 20:00', () => {
    expect(recommendationMode(RECIPES, REMAINING, NOON)).toBe('today');
    expect(recommendationMode(RECIPES, 130, NOON)).toBe('tomorrow');
    expect(recommendationMode(RECIPES, REMAINING, EVENING)).toBe('tomorrow');
  });
});

describe('rankRecipes', () => {
  it('puts what fits first today and the lightest first tomorrow', () => {
    expect(rankRecipes(RECIPES, REMAINING, 'today').map((r) => r.slug)).toEqual([
      'lemon-herb-salmon-bowl',
      'miso-rice-egg-bowl',
      'seared-tuna-nicoise',
      'chickpea-shakshuka',
    ]);
    expect(rankRecipes(RECIPES, GOAL, 'tomorrow').map((r) => r.perServing.kcal)).toEqual([
      395, 445, 480, 520,
    ]);
  });
});

describe('applyFilters', () => {
  it('keeps every recipe under the fit filter at 610, and narrows by attribute', () => {
    expect(applyFilters(RECIPES, new Set(['fits']), REMAINING)).toHaveLength(4);
    expect(applyFilters(RECIPES, new Set(['vegetarian']), REMAINING).map((r) => r.slug)).toEqual([
      'miso-rice-egg-bowl',
      'chickpea-shakshuka',
    ]);
    expect(
      applyFilters(RECIPES, new Set(['protein', 'low-carb']), REMAINING).map((r) => r.slug),
    ).toEqual(['seared-tuna-nicoise']);
    expect(applyFilters(RECIPES, new Set(['fits']), 130)).toHaveLength(0);
  });

  it('searches by name', () => {
    expect(applyFilters(RECIPES, new Set(), REMAINING, 'salmon').map((r) => r.slug)).toEqual([
      'lemon-herb-salmon-bowl',
    ]);
  });
});
