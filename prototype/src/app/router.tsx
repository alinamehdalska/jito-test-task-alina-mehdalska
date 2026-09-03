import { createBrowserRouter, type RouteObject } from 'react-router';

import { ErrorScreen } from '@/app/error-screen';
import { RootLayout } from '@/app/root-layout';
import { TabLayout } from '@/app/tab-layout';
import { DishScreen, ProductScreen, SearchScreen } from '@/features/calculator';
import { DashboardScreen, DiaryScreen } from '@/features/diary';
import { DiscoveryScreen, RecipeDetailsScreen } from '@/features/discover';
import { ProfileScreen } from '@/features/profile/profile-screen';

export const routeObjects: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorScreen />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { index: true, element: <DashboardScreen /> },
          { path: 'discover', element: <DiscoveryScreen /> },
          { path: 'diary', element: <DiaryScreen /> },
          { path: 'profile', element: <ProfileScreen /> },
        ],
      },
      { path: 'add/search', element: <SearchScreen /> },
      { path: 'add/product/:productId?', element: <ProductScreen /> },
      { path: 'add/dish', element: <DishScreen /> },
      { path: 'recipes/:slug', element: <RecipeDetailsScreen /> },
    ],
  },
];

export const router = createBrowserRouter(routeObjects);
