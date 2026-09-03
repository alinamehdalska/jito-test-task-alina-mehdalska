/** The canvas layer under every root and calculator screen — see chrome.css. */
export function AuroraBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora-backdrop" />
  );
}
