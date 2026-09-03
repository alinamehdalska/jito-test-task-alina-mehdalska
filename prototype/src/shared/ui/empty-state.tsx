import { type ReactNode, useId } from 'react';

import { Icon, type IconName } from '@/shared/ui/icon';

interface EmptyStateProps {
  readonly icon: IconName;
  readonly title: string;
  readonly body: string;
  readonly action?: ReactNode;
}

/** Frame 7's empty card, reused for any state that has nothing to list yet. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-center gap-16 rounded-20 bg-bg-surface px-20 py-48 text-center shadow-xs"
    >
      <span className="flex size-80 items-center justify-center rounded-full bg-accent-primary-muted text-accent-primary-strong">
        <Icon name={icon} className="size-32" />
      </span>
      <div className="flex flex-col gap-8">
        <h2 id={titleId} className="type-title-3 text-text-primary">
          {title}
        </h2>
        <p className="type-subhead text-text-secondary">{body}</p>
      </div>
      {action}
    </section>
  );
}
