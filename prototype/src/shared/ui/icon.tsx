import { cn } from '@/shared/lib/cn';
import { GLYPHS, type IconName } from '@/shared/ui/icon-glyphs';

export type { IconName } from '@/shared/ui/icon-glyphs';

interface IconProps {
  readonly name: IconName;
  /** Present only when the icon carries meaning on its own; otherwise it is decorative. */
  readonly label?: string | undefined;
  readonly weight?: 'regular' | 'fill' | undefined;
  readonly className?: string | undefined;
}

export function Icon({ name, label, weight = 'regular', className }: IconProps) {
  const Glyph = GLYPHS[name];
  return (
    <Glyph
      weight={weight}
      className={cn('size-control-icon shrink-0', className)}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    />
  );
}
