import { useLayoutEffect, useRef } from 'react';
import { NavigationType, Outlet, useLocation, useNavigationType } from 'react-router';

import { isTabRoute } from '@/app/routes';
import { AddSheet } from '@/features/add-sheet/add-sheet';
import { useAddSheetStore } from '@/features/add-sheet/store';
import { EditEntrySheet } from '@/features/diary/edit-entry-sheet';
import { useEditEntryStore } from '@/features/diary/edit-entry-store';
import { useLogTargetStore } from '@/features/diary/log-target-store';
import { MealPickerSheet } from '@/features/diary/meal-picker';
import { Toast } from '@/features/toast/toast';
import { DeviceFrame } from '@/shared/chrome/device-frame';
import { readTransition, type TransitionKind } from '@/shared/lib/use-app-navigate';

function resolveTransition(
  previousPath: string,
  nextPath: string,
  navigationType: NavigationType,
  state: unknown,
): TransitionKind {
  if (isTabRoute(previousPath) && isTabRoute(nextPath)) return 'none';
  if (navigationType === NavigationType.Pop) return 'pop';
  return readTransition(state) ?? 'push';
}

/**
 * Everything that outlives a screen: the device frame, the three sheets and the toast. It
 * also stamps the transition kind on <html> inside the router's flushSync, which is early
 * enough for the view-transition pseudo-elements to pick it up.
 */
export function RootLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(location.pathname);
  const isAddOpen = useAddSheetStore((state) => state.isOpen);
  const isEditOpen = useEditEntryStore((state) => state.entryId !== null);
  const isPickerOpen = useLogTargetStore((state) => state.isPickerOpen);
  const isSheetOpen = isAddOpen || isEditOpen || isPickerOpen;

  useLayoutEffect(() => {
    document.documentElement.dataset.transition = resolveTransition(
      previousPath.current,
      location.pathname,
      navigationType,
      location.state,
    );
    previousPath.current = location.pathname;
  }, [location, navigationType]);

  return (
    <DeviceFrame>
      <div className="relative size-full">
        <div className="size-full" inert={isSheetOpen}>
          <Outlet />
        </div>
        <Toast />
        <AddSheet />
        <EditEntrySheet />
        <MealPickerSheet />
      </div>
    </DeviceFrame>
  );
}
