// Inline styles may set custom properties (`--device-scale`), which React's CSSProperties
// does not declare. A plain .ts module rather than a .d.ts: `tsc -b` treats declaration
// files inside src as build outputs and drops them from the program.
export {};

declare module 'react' {
  // Module augmentation has to merge into the existing interface; a Record alias would
  // redeclare it and clash.
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  export interface CSSProperties {
    [customProperty: `--${string}`]: string | number | undefined;
  }
}
