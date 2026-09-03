/** iOS home indicator, 140 × 5, 8pt off the bottom. Only drawn inside the desktop device frame. */
export function HomeIndicator() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 left-1/2 hidden h-4 w-(--screen-home-indicator-w) -translate-x-1/2 rounded-full bg-text-primary md:block"
    />
  );
}
