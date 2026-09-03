import { BatteryFullIcon, CellSignalFullIcon, WifiHighIcon } from '@phosphor-icons/react';

/**
 * The iOS status bar as the Figma frames show it (Apple Design Resources, 59pt, 9:41).
 * Drawn only inside the desktop device frame; on a phone the OS supplies the real one and
 * `--screen-top-inset` follows the safe area instead. Decorative, so hidden from AT.
 */
export function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-(--screen-status-h) items-center justify-between px-24 text-text-primary md:flex"
    >
      <span className="flex-1 text-center type-headline">9:41</span>
      <span className="h-(--device-island-h) w-(--device-island-w) shrink-0 rounded-full bg-bg-inverse" />
      <span className="flex flex-1 items-center justify-center gap-4">
        <CellSignalFullIcon weight="fill" className="size-control-icon" />
        <WifiHighIcon weight="fill" className="size-control-icon" />
        <BatteryFullIcon weight="fill" className="size-control-icon" />
      </span>
    </div>
  );
}
