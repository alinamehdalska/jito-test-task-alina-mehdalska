import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

interface RenderRouteOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial history entries; the last one is the current location. */
  readonly initialEntries?: readonly string[] | undefined;
}

/** Renders a route tree inside a memory router, the way the app mounts it. */
export function renderRoutes(
  routeObjects: RouteObject[],
  { initialEntries = ['/'], ...options }: RenderRouteOptions = {},
): RenderResult & { router: ReturnType<typeof createMemoryRouter> } {
  const router = createMemoryRouter(routeObjects, { initialEntries: [...initialEntries] });
  const result = render(<RouterProvider router={router} />, options);
  return { ...result, router };
}
