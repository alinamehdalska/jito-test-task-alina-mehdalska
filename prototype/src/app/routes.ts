/** Every path in one place, so links and tests never spell a route by hand. */
export const routes = {
  home: '/',
  discover: '/discover',
  diary: '/diary',
  profile: '/profile',
  search: '/add/search',
  product: '/add/product',
  dish: '/add/dish',
  recipe: (slug: string) => `/recipes/${slug}`,
} as const;

/** Root tab destinations — the screens that carry the tab bar. */
export const TAB_ROUTES = [routes.home, routes.discover, routes.diary, routes.profile] as const;

export function isTabRoute(pathname: string): boolean {
  return (TAB_ROUTES as readonly string[]).includes(pathname);
}
