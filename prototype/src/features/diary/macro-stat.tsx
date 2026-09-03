import { useId } from 'react';

import { type MacroKey } from '@/domain/types';
import { MACRO_DOT_CLASS, MACRO_LABEL } from '@/features/diary/macro-styles';
import { cn } from '@/shared/lib/cn';
import { formatGrams } from '@/shared/lib/format';

const TRACK_CLASS: Readonly<Record<MacroKey, string>> = {
  carbs: 'bg-macro-carbs-track',
  protein: 'bg-macro-protein-track',
  fat: 'bg-macro-fat-track',
};

interface MacroStatProps {
  readonly macro: MacroKey;
  readonly consumed: number;
  readonly target: number;
}

/**
 * Figma 65:52 "Macro Stat". Colour, name and numbers are all present, so colour never
 * carries the meaning alone; the bar is a meter with the same numbers for AT.
 */
export function MacroStat({ macro, consumed, target }: MacroStatProps) {
  const labelId = useId();
  const ratio = target > 0 ? consumed / target : 0;
  const isOver = ratio > 1;
  const width = `${String(Math.min(100, Math.round(ratio * 100)))}%`;

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-8">
          <span aria-hidden="true" className={cn('size-8 rounded-full', MACRO_DOT_CLASS[macro])} />
          <span id={labelId} className="type-subhead text-text-secondary">
            {MACRO_LABEL[macro]}
          </span>
        </span>
        <span className="type-subhead-emphasized text-text-primary">
          {formatGrams(consumed).replace(' g', '')} / {formatGrams(target)}
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={consumed}
        aria-valuetext={`${formatGrams(consumed)} of ${formatGrams(target)}`}
        className={cn(
          'h-(--screen-macro-track-h) w-full overflow-hidden rounded-full',
          TRACK_CLASS[macro],
        )}
      >
        {/* Over target completes the bar in amber — never red; going over is information, not shame. */}
        <div
          className={cn(
            'h-full rounded-full macro-fill',
            isOver ? 'bg-feedback-warning' : MACRO_DOT_CLASS[macro],
          )}
          style={{ width }}
        />
      </div>
    </div>
  );
}
