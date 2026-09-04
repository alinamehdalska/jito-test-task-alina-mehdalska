import { beforeEach, describe, expect, it } from 'vitest';

import {
  consumedForDay,
  entriesForDay,
  groupByMeal,
  remainingForDay,
} from '@/features/diary/selectors';
import { useDiaryStore } from '@/features/diary/store';

const TODAY = new Date(2026, 8, 3, 12, 0);
const YESTERDAY = new Date(2026, 8, 2, 12, 0);

describe('diary store', () => {
  beforeEach(() => {
    useDiaryStore.getState().reset(TODAY);
  });

  it('seeds today with the dashboard meals and nothing else', () => {
    const { goal, entries } = useDiaryStore.getState();
    expect(consumedForDay(entries, TODAY)).toEqual({
      kcal: 1240,
      protein: 78,
      carbs: 142,
      fat: 41,
    });
    expect(remainingForDay(goal, entries, TODAY)).toBe(610);
    expect(entriesForDay(entries, YESTERDAY)).toEqual([]);
    expect(
      groupByMeal(entriesForDay(entries, TODAY)).map((group) => [group.meal, group.kcal]),
    ).toEqual([
      ['breakfast', 320],
      ['lunch', 540],
      ['snack', 380],
    ]);
  });

  it('logging lowers what is left, and undo restores it', () => {
    const { log, goal } = useDiaryStore.getState();
    const entry = log({
      name: 'Greek Yogurt, 2%',
      meal: 'snack',
      loggedAt: new Date(2026, 8, 3, 17, 0).toISOString(),
      amount: { value: 170, unit: 'g' },
      nutrition: { kcal: 124, protein: 17, carbs: 6.1, fat: 3.4 },
      source: 'product',
    });
    expect(remainingForDay(goal, useDiaryStore.getState().entries, TODAY)).toBe(486);

    useDiaryStore.getState().remove(entry.id);
    expect(remainingForDay(goal, useDiaryStore.getState().entries, TODAY)).toBe(610);
  });

  it('edits an entry in place and restores a removed one exactly', () => {
    const breakfast = useDiaryStore.getState().entries[0];
    if (!breakfast) throw new Error('no seed');
    useDiaryStore.getState().update(breakfast.id, {
      meal: 'lunch',
      nutrition: { kcal: 160, protein: 11, carbs: 19, fat: 4 },
    });
    const edited = useDiaryStore.getState().entries[0];
    expect(edited?.meal).toBe('lunch');
    expect(edited?.nutrition.kcal).toBe(160);
    expect(edited?.name).toBe('Greek yogurt bowl');

    useDiaryStore.getState().remove(breakfast.id);
    expect(useDiaryStore.getState().entries).toHaveLength(2);
    useDiaryStore.getState().restore(breakfast);
    useDiaryStore.getState().restore(breakfast);
    expect(useDiaryStore.getState().entries).toHaveLength(3);
    expect(entriesForDay(useDiaryStore.getState().entries, TODAY).at(0)?.id).toBe(breakfast.id);
  });

  it('keeps the three most recent products, newest first', () => {
    const { touchRecent } = useDiaryStore.getState();
    touchRecent('avocado');
    expect(useDiaryStore.getState().recentProductIds).toEqual([
      'avocado',
      'greek-yogurt-2',
      'banana',
    ]);
    touchRecent('banana');
    expect(useDiaryStore.getState().recentProductIds).toEqual([
      'banana',
      'avocado',
      'greek-yogurt-2',
    ]);
  });

  it('toggles favourites', () => {
    useDiaryStore.getState().toggleFavourite('greek-yogurt-2');
    expect(useDiaryStore.getState().favouriteProductIds).toEqual([]);
    useDiaryStore.getState().toggleFavourite('banana');
    expect(useDiaryStore.getState().favouriteProductIds).toEqual(['banana']);
  });
});
