import { useEffect, useId, useRef } from 'react';

import { routes } from '@/app/routes';
import { useAddSheetStore } from '@/features/add-sheet/store';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';
import { Icon, type IconName } from '@/shared/ui/icon';

interface SheetOptionProps {
  readonly icon: IconName;
  readonly title: string;
  readonly subtitle: string;
  readonly onSelect: () => void;
}

function SheetOption({ icon, title, subtitle, onSelect }: SheetOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex h-(--screen-sheet-row-h) w-full items-center gap-12 rounded-16 bg-bg-canvas px-16 text-left transition-colors duration-press active:bg-bg-sunken"
    >
      <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-accent-primary-muted text-accent-primary-strong">
        <Icon name={icon} className="size-20" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-subhead-emphasized text-text-primary">{title}</span>
        <span className="type-caption-1 text-text-tertiary">{subtitle}</span>
      </span>
      <Icon name="caret-right" className="size-20 text-text-tertiary" />
    </button>
  );
}

/**
 * Frame 6, "Add — action sheet". A non-modal <dialog> (the top layer would escape the device
 * frame), with its own scrim, Escape handling and focus return; the root layout marks
 * everything else inert while it is open.
 */
export function AddSheet() {
  const isOpen = useAddSheetStore((state) => state.isOpen);
  const close = useAddSheetStore((state) => state.close);
  const navigate = useAppNavigate();
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
      // A non-modal dialog does not move focus by itself; the first option is the natural landing.
      dialog.querySelector('button')?.focus();
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
      if (event.key === 'Escape') close();
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
    };
  }, [close]);

  const go = (to: string) => {
    close();
    navigate(to, 'push');
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        hidden={!isOpen}
        onClick={close}
        className="absolute inset-0 z-30 bg-bg-inverse/45 sheet-scrim backdrop-blur-scrim"
      />
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={close}
        className="absolute inset-x-0 top-auto bottom-0 z-40 m-0 flex w-full max-w-none sheet-panel flex-col gap-8 rounded-t-32 border-0 bg-bg-surface px-20 pt-12 pb-40 text-text-primary shadow-md"
      >
        <div className="flex justify-center py-8" aria-hidden="true">
          <span className="h-4 w-40 rounded-full bg-border-strong" />
        </div>
        <h2 id={titleId} className="type-title-3">
          Add to diary
        </h2>
        <SheetOption
          icon="magnifying-glass"
          title="Add a product"
          subtitle="Search foods and brands"
          onSelect={() => {
            go(routes.search);
          }}
        />
        <SheetOption
          icon="scan"
          title="Scan a barcode"
          subtitle="Point your camera at a label"
          onSelect={() => {
            go(routes.product);
          }}
        />
        <SheetOption
          icon="bowl-food"
          title="Create a dish"
          subtitle="Combine several ingredients"
          onSelect={() => {
            go(routes.dish);
          }}
        />
      </dialog>
    </>
  );
}
