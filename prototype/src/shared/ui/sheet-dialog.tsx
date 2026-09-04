import { type ReactNode, useEffect, useId, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

interface SheetDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** Spacing between the sheet's rows; the add sheet's options sit tighter than a form. */
  readonly className?: string | undefined;
  readonly children: ReactNode;
}

const FOCUSABLE = 'button, input, [tabindex]:not([tabindex="-1"])';

/**
 * The bottom sheet every modal state shares (frames 6 and 9, the meal picker). A non-modal
 * <dialog> — the top layer would escape the device frame — with its own scrim, Escape
 * handling and focus return; the root layout marks everything else inert while it is open.
 */
export function SheetDialog({ isOpen, onClose, title, className, children }: SheetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.show();
      // A non-modal dialog does not move focus by itself; the first control is the natural landing.
      dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      openerRef.current?.focus();
      openerRef.current = null;
    }
  }, [isOpen]);

  // A non-modal dialog does not close on Escape by itself.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        hidden={!isOpen}
        onClick={onClose}
        className="absolute inset-0 z-30 bg-bg-inverse/45 sheet-scrim backdrop-blur-scrim"
      />
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={onClose}
        className={cn(
          'absolute inset-x-0 top-auto bottom-0 z-40 m-0 sheet-panel flex max-h-full w-full max-w-none flex-col overflow-y-auto rounded-t-32 border-0 bg-bg-surface px-20 pt-12 pb-40 text-text-primary shadow-md',
          className ?? 'gap-8',
        )}
      >
        <div className="flex justify-center py-8" aria-hidden="true">
          <span className="h-4 w-40 rounded-full bg-border-strong" />
        </div>
        <h2 id={titleId} className="type-title-3">
          {title}
        </h2>
        {children}
      </dialog>
    </>
  );
}
