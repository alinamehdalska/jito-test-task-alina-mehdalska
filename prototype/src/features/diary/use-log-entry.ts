import { useCallback } from 'react';

import { routes } from '@/app/routes';
import { mealForTime } from '@/domain/nutrition';
import type { DiaryEntry, EntrySource, Nutrition, PhotoKey } from '@/domain/types';
import { useDiaryStore } from '@/features/diary/store';
import { useToastStore } from '@/features/toast/store';
import { formatKcal } from '@/shared/lib/format';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';

export interface LogRequest {
  readonly name: string;
  readonly nutrition: Nutrition;
  readonly source: EntrySource;
  readonly photo?: PhotoKey | undefined;
  /** Defaults to now; the meal is inferred from it. */
  readonly at?: Date | undefined;
}

/**
 * Every "… to Diary" action ends the same way (frame 8): the entry lands in the diary, the
 * dashboard shows the toast with Undo, and the flow dissolves back to Today.
 */
export function useLogEntry(): (request: LogRequest) => DiaryEntry {
  const log = useDiaryStore((state) => state.log);
  const remove = useDiaryStore((state) => state.remove);
  const showToast = useToastStore((state) => state.show);
  const navigate = useAppNavigate();

  return useCallback(
    ({ at = new Date(), ...request }) => {
      const entry = log({ ...request, meal: mealForTime(at), loggedAt: at.toISOString() });
      showToast({
        title: 'Added to today’s diary',
        detail: `${entry.name} · ${formatKcal(entry.nutrition.kcal)} kcal`,
        onUndo: () => {
          remove(entry.id);
        },
      });
      navigate(routes.home, 'dissolve');
      return entry;
    },
    [log, remove, showToast, navigate],
  );
}
