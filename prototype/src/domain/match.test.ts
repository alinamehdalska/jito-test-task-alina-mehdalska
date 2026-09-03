import { describe, expect, it } from 'vitest';

import { findRecipe, RECIPES } from '@/data/recipes';
import { applyFilters, matchFor, reasonFor } from '@/domain/match';

const REMAINING = 610;

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
  it('reproduces the four Discovery cards with 610 kcal left', () => {
    expect(reasonFor(recipe('lemon-herb-salmon-bowl'), REMAINING)).toEqual({
      tone: 'positive',
      label: 'Fits your calories',
    });
    expect(reasonFor(recipe('miso-rice-egg-bowl'), REMAINING)).toEqual({
      tone: 'positive',
      label: 'Fits your calories',
    });
    expect(reasonFor(recipe('chickpea-shakshuka'), REMAINING)).toEqual({
      tone: 'neutral',
      label: 'Tight fit',
    });
    expect(reasonFor(recipe('seared-tuna-nicoise'), REMAINING)).toEqual({
      tone: 'neutral',
      label: 'High protein',
    });
  });

  it('never uses the positive tone for something over budget', () => {
    expect(reasonFor(recipe('chickpea-shakshuka'), 130).tone).toBe('neutral');
  });
});

describe('applyFilters', () => {
  it('keeps every recipe under the default fit filter, and narrows by attribute', () => {
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
