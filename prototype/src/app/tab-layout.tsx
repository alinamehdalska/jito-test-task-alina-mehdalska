import { Outlet } from 'react-router';

import { Screen } from '@/shared/chrome/screen';
import { TabBar } from '@/shared/chrome/tab-bar';

/** The three root destinations (plus Profile) share one screen with the floating tab bar. */
export function TabLayout() {
  return (
    <Screen bottomInset="nav" chrome={<TabBar />}>
      <Outlet />
    </Screen>
  );
}
