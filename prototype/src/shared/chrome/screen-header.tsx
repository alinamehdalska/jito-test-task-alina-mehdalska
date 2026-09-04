import type { ReactNode } from 'react';

import { routes } from '@/app/routes';
import { cn } from '@/shared/lib/cn';
import { useAppNavigate, useGoBack } from '@/shared/lib/use-app-navigate';
import { IconButton } from '@/shared/ui/icon-button';

interface ScreenHeaderProps {
  readonly title: string;
  /** Push contexts get a back caret; the close X dismisses the whole flow to the dashboard. */
  readonly closable?: boolean | undefined;
  /** A pull-down under the title — the meal and day a log will land in. Grows the row to 60. */
  readonly subtitle?: ReactNode;
  readonly trailing?: ReactNode;
}

/** The header row of every push screen: back · title (· subtitle) · close. */
export function ScreenHeader({ title, closable = false, subtitle, trailing }: ScreenHeaderProps) {
  const goBack = useGoBack();
  const navigate = useAppNavigate();
  return (
    <header
      className={cn(
        'flex items-center justify-between px-20',
        subtitle ? 'h-(--screen-header-h)' : 'h-control-button',
      )}
    >
      <IconButton icon="caret-left" label="Back" onClick={goBack} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="type-headline text-text-primary">{title}</h1>
        {subtitle}
      </div>
      {trailing ??
        (closable ? (
          <IconButton
            icon="x"
            label="Close"
            onClick={() => {
              navigate(routes.home, 'dissolve');
            }}
          />
        ) : (
          <span aria-hidden="true" className="size-control-button" />
        ))}
    </header>
  );
}
