import { useEffect, useState } from 'react';

import { useToastStore } from '@/features/toast/store';
import { Icon } from '@/shared/ui/icon';

/**
 * Frame 8 → 1 in the Figma prototype fires after 3 s. The code holds 5 s: the audit measured
 * 3 s against the 4–10 s the platforms recommend, and undo is no longer the only way back.
 */
export const TOAST_DURATION_MS = 5000;

/**
 * Frame 8, "Logged — confirmation". Always mounted as a polite live region so the
 * announcement works the first time; auto-dismisses, but not while pointed at or focused.
 */
export function Toast() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);
  const [isHeld, setIsHeld] = useState(false);

  useEffect(() => {
    if (!current || isHeld) return;
    const timer = window.setTimeout(dismiss, TOAST_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [current, isHeld, dismiss]);

  return (
    // WCAG 2.2.1: the 3 s dismissal must be pausable. Hover and focus on the live region are
    // that pause; the region itself is announced, not operated, so the a11y rule does not apply.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="status"
      aria-live="polite"
      hidden={!current}
      onMouseEnter={() => {
        setIsHeld(true);
      }}
      onMouseLeave={() => {
        setIsHeld(false);
      }}
      onFocus={() => {
        setIsHeld(true);
      }}
      onBlur={() => {
        setIsHeld(false);
      }}
      className="absolute inset-x-20 top-(--screen-toast-y) z-20 flex h-64 toast-panel items-center gap-12 rounded-20 bg-bg-inverse px-16 text-text-inverse shadow-md"
    >
      {current && (
        <>
          <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-feedback-success text-text-inverse">
            <Icon name="check" weight="fill" className="size-16" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate type-subhead-emphasized">{current.title}</span>
            {current.detail && (
              <span className="truncate type-caption-2 text-text-inverse-secondary">
                {current.detail}
              </span>
            )}
          </span>
          {current.onUndo && (
            <button
              type="button"
              onClick={() => {
                current.onUndo?.();
                dismiss();
              }}
              className="-mr-8 flex h-control-button shrink-0 items-center rounded-full px-8 type-subhead-emphasized text-accent-primary"
            >
              Undo
            </button>
          )}
        </>
      )}
    </div>
  );
}
