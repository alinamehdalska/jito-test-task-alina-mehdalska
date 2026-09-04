import { type KeyboardEvent, type ReactNode, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SectionTab<Id extends string> {
  readonly id: Id;
  readonly label: string;
}

interface SectionTabsProps<Id extends string> {
  readonly label: string;
  readonly tabs: readonly SectionTab<Id>[];
  readonly active: Id;
  readonly onChange: (id: Id) => void;
  /** Sits at the trailing edge on the baseline — "5 items" on the ingredients tab. */
  readonly trailing?: ReactNode;
}

/**
 * Figma 177:448 "Section Tabs": true tab views, one section each. The active tab is both
 * the emphasised ink label and the 2pt accent-strong underline (6.04:1), and the
 * tablist carries the state for AT; arrow keys move between tabs.
 */
export function SectionTabs<Id extends string>({
  label,
  tabs,
  active,
  onChange,
  trailing,
}: SectionTabsProps<Id>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active);
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (!next) return;
    onChange(next.id);
    buttons.current[tabs.indexOf(next)]?.focus();
  };

  return (
    <div className="flex items-baseline justify-between">
      <div role="tablist" aria-label={label} className="flex items-center gap-24">
        {tabs.map((tab, index) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={onKeyDown}
              onClick={() => {
                onChange(tab.id);
              }}
              className="flex h-control-button flex-col items-center justify-end gap-8"
            >
              <span
                className={cn(
                  isActive
                    ? 'type-subhead-emphasized text-text-primary'
                    : 'type-subhead text-text-secondary',
                )}
              >
                {tab.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'h-2 w-full rounded-full',
                  isActive ? 'bg-accent-primary-strong' : 'bg-transparent',
                )}
              />
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
}
