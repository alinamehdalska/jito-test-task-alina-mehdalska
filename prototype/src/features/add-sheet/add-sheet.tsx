import { routes } from '@/app/routes';
import { useAddSheetStore } from '@/features/add-sheet/store';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';
import { Icon, type IconName } from '@/shared/ui/icon';
import { SheetDialog } from '@/shared/ui/sheet-dialog';

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
        <span className="type-caption-1 text-text-secondary">{subtitle}</span>
      </span>
      <Icon name="caret-right" className="size-20 text-text-secondary" />
    </button>
  );
}

/** Frame 6, "Add — action sheet": the central `+` opens three routes into the diary. */
export function AddSheet() {
  const isOpen = useAddSheetStore((state) => state.isOpen);
  const close = useAddSheetStore((state) => state.close);
  const navigate = useAppNavigate();

  const go = (to: string) => {
    close();
    navigate(to, 'push');
  };

  return (
    <SheetDialog isOpen={isOpen} onClose={close} title="Add to diary">
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
    </SheetDialog>
  );
}
