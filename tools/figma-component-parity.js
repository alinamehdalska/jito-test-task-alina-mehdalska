// Plate — the legacy sweep the previous pass missed, because it was auditing values rather
// than asking whether a thing was a component at all.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in eleven use_figma calls.
//
// Verified after running: Screens page at 11 frames / 0 unstyled of 319 / 0 off-grid /
// 0 off-scale radius / 0 generic names outside instances / drift []. 18 components in use
// across 183 instances.

// ---------------------------------------------------------------------------
// 1. I dismissed a true finding as noise.
// ---------------------------------------------------------------------------
// The consistency sweep reported `Under 400 kcal rightOver: 2` and `count rightOver: 34`
// on the Filter Pill and I wrote them off as artefacts of measuring a component set. They
// were real: the pill was FIXED at 120pt while its content needed 138 to 192, so the label
// ran past the right edge in every variant and the count badge sat outside the pill
// entirely. A chip is as wide as its label — all six variants now HUG.
//
// The lesson is about the audit, not the pill: an overflow report is a claim about pixels,
// and the way to settle it is to look, not to reason about why the number might be wrong.

// ---------------------------------------------------------------------------
// 2. Black-seeded bound paints, still latent.
// ---------------------------------------------------------------------------
// Six fills across Filter Pill, Ingredient Chip and Calorie Card were bound to a variable
// and seeded #000000. They render black on the library page while every instance resolves
// correctly, so the screens looked right and the component page did not. Working agreement
// 1, third occurrence in this file.
//   seeded !== resolved  ->  re-seed with the variable's real colour

// ---------------------------------------------------------------------------
// 3. Four components were reaching past the semantic layer.
// ---------------------------------------------------------------------------
// They bound to `color/static/white` and `color/periwinkle/100` — primitives, which are
// scoped [] precisely so components cannot pick them. Re-pointed at `bg/surface` and
// `accent/*`. One exception is legitimate and now documented: `Swatch / Primitive` exists
// to display the primitive layer, and binding it semantically was the rule applied where
// it does not belong.

// ---------------------------------------------------------------------------
// 4. Components that existed but were not used.
// ---------------------------------------------------------------------------
// The five filter chips on Discovery were plain frames with padding 12, beside a Filter
// Pill component specifying 16. The Recipe Card carried a hand-built match tag while a
// Reason Chip component sat unused with the exact variants needed. Both are now instances.
//
// A component nobody instances is not a component, it is a drawing that happens to live on
// the library page — and the copy on the screen drifts from it silently.

// ---------------------------------------------------------------------------
// 5. Selection borrowed a macro colour.
// ---------------------------------------------------------------------------
// Filter Pill and Ingredient Chip marked `selected` with periwinkle/100 — the protein macro
// tint. Everything else in this system signals active with the primary accent: the lit tab,
// the current nav item, the CTA. Moved to `accent/primary-muted`, measured at 11.6:1 for
// ink and 5.1:1 for accent-strong.

// ---------------------------------------------------------------------------
// 6. The library page had no background.
// ---------------------------------------------------------------------------
// Light-mode components on Figma's dark canvas are unreadable, which is how this whole
// round started — the screenshots showed dark text on dark. Every page now carries the app
// canvas, and the Screens page a step deeper (sand/300) so the frames keep an edge against
// their own sand/100 gradient.
