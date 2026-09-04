import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { formatDayTitle, formatWeekday } from '@/shared/lib/format';

interface WeekStripProps {
  readonly today: Date;
  readonly selected: Date;
  /** `yyyy-MM-dd` keys of the days that have entries — the dot under the number. */
  readonly loggedDays: ReadonlySet<string>;
  readonly onSelect: (day: Date) => void;
}

const DAYS_IN_WEEK = 7;
const DAY_KEY = 'yyyy-MM-dd';

/** The seven days of the current week as one radio group; a selected pill is solid coral. */
export function WeekStrip({ today, selected, loggedDays, onSelect }: WeekStripProps) {
  const idPrefix = useId();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(monday, index));

  return (
    <fieldset className="flex justify-between gap-4">
      <legend className="sr-only">Day of the week</legend>
      {days.map((day) => {
        const isSelected = isSameDay(day, selected);
        const key = format(day, DAY_KEY);
        const isLogged = loggedDays.has(key);
        const inputId = `${idPrefix}-${key}`;
        return (
          <label
            key={key}
            htmlFor={inputId}
            className={cn(
              'flex min-h-control-button flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-16 py-8 transition-colors duration-state',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-border-focus',
              isSelected
                ? 'bg-accent-primary text-text-primary shadow-xs'
                : 'bg-bg-surface text-text-secondary shadow-xs',
            )}
          >
            <input
              id={inputId}
              type="radio"
              name="diary-day"
              className="sr-only"
              checked={isSelected}
              aria-label={`${formatDayTitle(day)}${isLogged ? ', logged' : ''}`}
              onChange={() => {
                onSelect(day);
              }}
            />
            <span aria-hidden="true" className="type-caption-2">
              {formatWeekday(day)}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'type-subhead-emphasized',
                isSameDay(day, today) && !isSelected && 'text-accent-primary-strong',
              )}
            >
              {format(day, 'd')}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'size-4 rounded-full',
                isLogged
                  ? isSelected
                    ? 'bg-text-primary'
                    : 'bg-accent-primary-strong'
                  : 'bg-transparent',
              )}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
