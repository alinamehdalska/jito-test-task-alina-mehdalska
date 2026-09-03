import { type ReactNode, useSyncExternalStore } from 'react';

const DEVICE_H = 884;
const FRAME_MARGIN = 32;

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
  };
}

/** Scale the frame down when the viewport is shorter than the device plus a margin. */
function readScale(): number {
  return Math.min(1, (window.innerHeight - FRAME_MARGIN) / DEVICE_H);
}

const SIDE_BUTTONS = [
  { name: 'action', side: 'left', top: 175, height: 28 },
  { name: 'volume up', side: 'left', top: 225, height: 52 },
  { name: 'volume down', side: 'left', top: 292, height: 52 },
  { name: 'side', side: 'right', top: 245, height: 88 },
] as const;

/**
 * On viewports of 768px and up the app renders inside an iPhone 15 Pro outline — the same
 * geometry as the Figma presentation page (bezel 16, radii 71 / 55). Below that the screen
 * simply fills the viewport, so the prototype is also usable on a real phone.
 */
export function DeviceFrame({ children }: { readonly children: ReactNode }) {
  const scale = useSyncExternalStore(subscribe, readScale, () => 1);
  const scaleValue = String(scale);

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-bg-sunken">
      {/* The outer box takes the scaled size so the frame centres without the page scrolling;
          the inner box keeps the real device geometry and is scaled from its top-left corner. */}
      <div
        className="relative size-full md:h-(--device-scaled-h) md:w-(--device-scaled-w)"
        style={{
          '--device-scaled-w': `calc(var(--device-w) * ${scaleValue})`,
          '--device-scaled-h': `calc(var(--device-h) * ${scaleValue})`,
        }}
      >
        <div
          className="relative size-full md:h-(--device-h) md:w-(--device-w) md:origin-top-left md:scale-(--device-scale) md:rounded-(--device-r) md:bg-bg-inverse md:p-(--device-bezel) md:shadow-lg"
          style={{ '--device-scale': scaleValue }}
        >
          {SIDE_BUTTONS.map((button) => (
            <span
              key={button.name}
              aria-hidden="true"
              className="absolute hidden w-4 rounded-full bg-bg-inverse md:block"
              style={{
                top: button.top,
                height: button.height,
                [button.side === 'left' ? 'left' : 'right']: -3,
              }}
            />
          ))}
          <div className="relative size-full overflow-hidden bg-bg-canvas md:rounded-(--device-screen-r)">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
