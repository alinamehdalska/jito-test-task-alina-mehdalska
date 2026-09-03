import type { ReactNode } from 'react';

import { routes } from '@/app/routes';
import { useAppNavigate, useGoBack } from '@/shared/lib/use-app-navigate';
import { IconButton } from '@/shared/ui/icon-button';

interface ScreenHeaderProps {
  readonly title: string;
  /** Push contexts get a back caret; the close X dismisses the whole flow to the dashboard. */
  readonly closable?: boolean | undefined;
  readonly trailing?: ReactNode;
}

/** The 44pt header row of every push screen: back · title · close. */
export function ScreenHeader({ title, closable = false, trailing }: ScreenHeaderProps) {
  const goBack = useGoBack();
  const navigate = useAppNavigate();
  return (
    <header className="flex h-control-button items-center justify-between px-20">
      <IconButton icon="caret-left" label="Back" onClick={goBack} />
      <h1 className="type-headline text-text-primary">{title}</h1>
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
