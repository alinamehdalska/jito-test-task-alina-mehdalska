import { isSameDay, set } from 'date-fns';
import { useCallback } from 'react';

import { routes } from '@/app/routes';
import { MEAL_LABEL } from '@/domain/meals';
import type { DiaryEntry, EntryAmount, EntrySource, Nutrition, PhotoKey } from '@/domain/types';
import { dayKey, resolveLogTarget, useLogTargetStore } from '@/features/diary/log-target-store';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { formatDayShort, formatKcal } from '@/shared/lib/format';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';

export interface LogRequest {
  readonly name: string;
  readonly nutrition: Nutrition;
  readonly amount: EntryAmount;
  readonly source: EntrySource;
  readonly photo?: PhotoKey | undefined;
}

/**
 * Every "Log … to Diary" action ends the same way (frame 8): the entry lands in the meal and
 * day the pull-down names, the toast confirms it with Undo, and the flow dissolves back to
 * Today — or to the diary, when the day was not today.
 */
export function useLogEntry(): (request: LogRequest) => DiaryEntry {
  const log = useDiaryStore((state) => state.log);
  const remove = useDiaryStore((state) => state.remove);
  const chosenMeal = useLogTargetStore((state) => state.meal);
  const chosenDay = useLogTargetStore((state) => state.day);
  const setMeal = useLogTargetStore((state) => state.setMeal);
  const showToast = useToastStore((state) => state.show);
  const navigate = useAppNavigate();

  return useCallback(
    (request) => {
      const now = new Date();
      const { meal, day } = resolveLogTarget({ meal: chosenMeal, day: chosenDay }, now);
      const at = set(day, {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: 0,
        milliseconds: 0,
      });
      const entry = log({ ...request, meal, loggedAt: at.toISOString() });
      const isToday = isSameDay(day, now);
      // The title names the meal and day so the detail line stays short enough not to truncate.
      showToast({
        title: `Added to ${MEAL_LABEL[meal]}${isToday ? ' today' : `, ${formatDayShort(day)}`}`,
        detail: `${entry.name} · ${formatKcal(entry.nutrition.kcal)} kcal`,
        onUndo: () => {
          remove(entry.id);
        },
      });
      // The meal was chosen for this log; the day stays while the diary has it open.
      setMeal(null);
      navigate(isToday ? routes.home : `${routes.diary}?day=${dayKey(day)}`, 'dissolve');
      return entry;
    },
    [log, remove, chosenMeal, chosenDay, setMeal, showToast, navigate],
  );
}
