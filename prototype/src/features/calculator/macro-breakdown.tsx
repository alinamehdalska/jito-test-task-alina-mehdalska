import { kcalFromMacro } from '@/domain/nutrition';
import { MACRO_ORDER, type Nutrition } from '@/domain/types';
import { MACRO_DOT_CLASS, MACRO_LABEL } from '@/features/diary/macro-styles';
import { cn } from '@/shared/lib/cn';
import { formatGrams, formatKcal } from '@/shared/lib/format';

const TRACK_CLASS = {
  carbs: 'bg-macro-carbs-track',
  protein: 'bg-macro-protein-track',
  fat: 'bg-macro-fat-track',
} as const;

/**
 * Figma 69:183: per-macro grams, the energy they contribute, and a bar proportional to that
 * share of the serving's calories — so the bars read as one composition, not three goals.
 */
export function MacroBreakdown({ nutrition }: { readonly nutrition: Nutrition }) {
  return (
    <ul className="flex w-full flex-col gap-12 rounded-20 bg-bg-surface p-16 shadow-xs">
      {MACRO_ORDER.map((macro) => {
        const grams = nutrition[macro];
        const kcal = kcalFromMacro(macro, grams);
        const share =
          nutrition.kcal > 0 ? Math.min(100, Math.round((kcal / nutrition.kcal) * 100)) : 0;
        return (
          <li key={macro} className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-8">
                <span
                  aria-hidden="true"
                  className={cn('size-8 rounded-full', MACRO_DOT_CLASS[macro])}
                />
                <span className="type-subhead text-text-secondary">{MACRO_LABEL[macro]}</span>
              </span>
              <span className="flex items-baseline gap-8">
                <span className="type-subhead-emphasized text-text-primary">
                  {formatGrams(grams, 1)}
                </span>
                <span className="type-caption-1 text-text-tertiary">{formatKcal(kcal)} kcal</span>
              </span>
            </div>
            <div
              aria-hidden="true"
              className={cn(
                'h-(--screen-macro-track-h) w-full overflow-hidden rounded-full',
                TRACK_CLASS[macro],
              )}
            >
              <div
                className={cn('h-full rounded-full macro-fill', MACRO_DOT_CLASS[macro])}
                style={{ width: `${String(share)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
