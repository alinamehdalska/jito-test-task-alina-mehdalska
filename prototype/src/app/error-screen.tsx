import { isRouteErrorResponse, useRouteError } from 'react-router';

import { routes } from '@/app/routes';
import { Screen } from '@/shared/chrome/screen';
import { ButtonLink } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

/** Route-level boundary: a 404 or a render error both land here, inside the device frame. */
export function ErrorScreen() {
  const error: unknown = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Screen>
      <div className="flex flex-col gap-24 px-20 pt-4">
        <h1 className="type-large-title text-text-primary">
          {isNotFound ? 'Not found' : 'Something went wrong'}
        </h1>
        <EmptyState
          icon="bowl-food"
          title={isNotFound ? 'This screen does not exist' : 'The prototype hit an error'}
          body={
            isNotFound
              ? 'The link may be old. Today is always one tap away.'
              : 'Reloading the page resets the demo data.'
          }
          action={
            <ButtonLink to={routes.home} size="md">
              Back to Today
            </ButtonLink>
          }
        />
      </div>
    </Screen>
  );
}
