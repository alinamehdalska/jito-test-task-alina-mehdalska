import { Link } from 'react-router';

import { routes } from '@/app/routes';

/**
 * The dashboard's avatar. Initials rather than the Figma portrait: that photo carries no
 * licence record, and the design system keeps people out of its imagery anyway.
 */
export function Avatar({ initials, name }: { readonly initials: string; readonly name: string }) {
  return (
    <Link
      to={routes.profile}
      aria-label={`${name} — profile`}
      className="flex size-control-button shrink-0 items-center justify-center rounded-full bg-accent-primary-muted type-subhead-emphasized text-accent-primary-strong"
    >
      <span aria-hidden="true">{initials}</span>
    </Link>
  );
}
