import { useId, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';

interface StepperProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly step?: number | undefined;
  readonly min?: number | undefined;
  readonly max?: number | undefined;
  /** Shown after the number, e.g. `g`. */
  readonly unit?: string | undefined;
  /** Lets the number be typed, which a stepper alone cannot express exactly. */
  readonly editable?: boolean | undefined;
  readonly inputId?: string | undefined;
  readonly className?: string | undefined;
}

interface StepButtonProps {
  readonly icon: 'minus' | 'plus';
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
}

function StepButton({ icon, label, onClick, disabled }: StepButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-control-button shrink-0 items-center justify-center rounded-full text-text-primary transition-transform duration-press ease-out active:scale-98 disabled:opacity-40"
    >
      <span className="flex size-control-chip items-center justify-center rounded-full bg-bg-sunken">
        <Icon name={icon} className="size-20" />
      </span>
    </button>
  );
}

interface AmountInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly onCommit: (value: number) => void;
}

/** Typed amount; keyed on the value by its parent, so it resets whenever the buttons change it. */
function AmountInput({ id, label, value, onCommit }: AmountInputProps) {
  const [draft, setDraft] = useState(String(value));
  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(parsed);
  };
  return (
    <input
      id={id}
      aria-label={label}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className="w-40 bg-transparent text-right outline-none"
    />
  );
}

/**
 * Figma 69:175 / 70:195. Two 36pt circles inside 44pt targets around a value. The slider
 * this replaced could not express an exact gram figure — this one can be typed into.
 */
export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  unit,
  editable = false,
  inputId,
  className,
}: StepperProps) {
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const clamp = (next: number) => Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next));

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-12', className)}>
      <StepButton
        icon="minus"
        label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => {
          onChange(clamp(value - step));
        }}
      />
      <span className="flex min-w-40 items-baseline justify-center gap-4 text-center type-headline text-text-primary">
        {editable ? (
          <AmountInput
            key={value}
            id={id}
            label={label}
            value={value}
            onCommit={(next) => {
              onChange(clamp(next));
            }}
          />
        ) : (
          <span className="min-w-32 text-center">{value}</span>
        )}
        {unit && <span>{unit}</span>}
      </span>
      <StepButton
        icon="plus"
        label={`Increase ${label}`}
        disabled={max !== undefined && value >= max}
        onClick={() => {
          onChange(clamp(value + step));
        }}
      />
    </div>
  );
}
