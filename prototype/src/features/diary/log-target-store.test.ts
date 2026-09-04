import { describe, expect, it } from 'vitest';

import { describeLogTarget, resolveLogTarget } from '@/features/diary/log-target-store';

const TODAY = new Date(2026, 8, 3, 9, 41);

describe('resolveLogTarget', () => {
  it('defaults the meal from the clock and the day to today', () => {
    const target = resolveLogTarget({ meal: null, day: null }, TODAY);
    expect(target.meal).toBe('breakfast');
    expect(describeLogTarget(target, TODAY)).toBe('Breakfast · Today');
  });

  it('keeps an explicit meal and day, and names yesterday and older days', () => {
    expect(
      describeLogTarget(resolveLogTarget({ meal: 'dinner', day: '2026-09-02' }, TODAY), TODAY),
    ).toBe('Dinner · Yesterday');
    expect(
      describeLogTarget(resolveLogTarget({ meal: null, day: '2026-08-31' }, TODAY), TODAY),
    ).toBe('Breakfast · Mon 31 Aug');
  });

  it('falls back to today on a malformed day key', () => {
    expect(resolveLogTarget({ meal: null, day: 'not-a-day' }, TODAY).day).toBe(TODAY);
  });
});
