import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';

interface FilterPillProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

/**
 * Figma 7:24 "Filter Pill", 36pt. Selected carries a checkmark as well as the fill change,
 * so colour is never the sole indicator; `aria-pressed` says the same to AT.
 */
export function FilterPill({ label, selected, onToggle }: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'inline-flex h-control-chip items-center gap-8 rounded-full px-16 type-subhead whitespace-nowrap shadow-xs transition-colors duration-state',
        selected
          ? 'bg-accent-primary-muted text-text-primary'
          : 'border border-border-subtle bg-bg-surface text-text-secondary',
      )}
    >
      {selected && <Icon name="check" className="size-16" />}
      {label}
    </button>
  );
}
