import { createBrowserRouter, type RouteObject } from 'react-router';

import { ErrorScreen } from '@/app/error-screen';
import { PushPlaceholder, TabPlaceholder } from '@/app/placeholder-screen';
import { RootLayout } from '@/app/root-layout';
import { TabLayout } from '@/app/tab-layout';
import { DishScreen, ProductScreen, SearchScreen } from '@/features/calculator';
import { DashboardScreen, DiaryScreen } from '@/features/diary';
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
          {
            path: 'discover',
            element: <TabPlaceholder title="Discover" stage="the discovery stage" />,
          },
          { path: 'diary', element: <DiaryScreen /> },
          { path: 'profile', element: <ProfileScreen /> },
        ],
      },
      { path: 'add/search', element: <SearchScreen /> },
      { path: 'add/product/:productId?', element: <ProductScreen /> },
      { path: 'add/dish', element: <DishScreen /> },
      {
        path: 'recipes/:slug',
        element: <PushPlaceholder title="Recipe" stage="the discovery stage" />,
      },
    ],
  },
];

export const router = createBrowserRouter(routeObjects);
