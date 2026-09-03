import { NavLink } from 'react-router';

import { routes } from '@/app/routes';
import { useAddSheetStore } from '@/features/add-sheet/store';
import { BottomFade } from '@/shared/chrome/bottom-fade';
import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/icon';

interface TabItemProps {
  readonly to: string;
  readonly icon: IconName;
  readonly label: string;
}

function TabItem({ to, icon, label }: TabItemProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex h-full w-(--screen-tab-item-w) flex-col items-center justify-center gap-4 rounded-full',
          'type-caption-2 transition-colors duration-state',
          isActive ? 'text-accent-primary-strong' : 'text-text-secondary',
        )
      }
    >
      <Icon name={icon} />
      {label}
    </NavLink>
  );
}

/**
 * Floating glass navigation (Figma 173:412). Two layers, as in the file: a glass plate that
 * carries the 65% surface, blur, hairline and shadow, and a transparent pill with the items
 * at full opacity. `aria-current="page"` carries the active state alongside the colour.
 */
export function TabBar() {
  const openSheet = useAddSheetStore((state) => state.open);
  return (
    <>
      <BottomFade context="nav" />
      <div
        aria-hidden="true"
        className="absolute inset-x-20 bottom-(--screen-tabbar-bottom) h-(--screen-tabbar-h) rounded-full border border-border-on-media/65 bg-bg-surface/65 shadow-md backdrop-blur-glass"
      />
      <nav
        aria-label="Primary"
        className="absolute inset-x-20 bottom-(--screen-tabbar-bottom) flex h-(--screen-tabbar-h) items-center justify-between px-16"
      >
        <TabItem to={routes.home} icon="house" label="Home" />
        <TabItem to={routes.discover} icon="compass" label="Discover" />
        <button
          type="button"
          aria-label="Add to diary"
          aria-haspopup="dialog"
          onClick={openSheet}
          className="flex size-control-fab items-center justify-center rounded-full bg-accent-primary text-text-primary shadow-lg transition-transform duration-press ease-out active:scale-98"
        >
          <Icon name="plus" />
        </button>
        <TabItem to={routes.diary} icon="notebook" label="Diary" />
        <TabItem to={routes.profile} icon="user" label="Profile" />
      </nav>
    </>
  );
}
