// Plate — turn the repeated screen chrome into components, so a change lands once
// instead of once per screen.
// APPLIED 2026-09-02 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in seven use_figma calls.
//
// Verified after running: 11 frames still 393x852 at y=0; every fade matches its recorded
// baseline exactly (drift: []); hero gauge still 313 x 204.49; 78 instances where there
// were 33; exactly one lit destination per Tab Bar variant and one lit tab per Section
// Tabs variant, checked by screenshot rather than by structure.

// ---------------------------------------------------------------------------
// 1. Fingerprint before componentising — "looks the same" is not the same as "is".
// ---------------------------------------------------------------------------
// A shape fingerprint over geometry + child structure found six repeated structures.
// It reported tab-bar as ONE shape across four screens, which was wrong: the
// fingerprint only recursed three levels and compared fill TYPES, so it could not see
// that the active destination differs. Two of the six needed variants, not a single
// component. Widen the fingerprint, or verify state separately, before trusting it.
//
//   status-bar      11 copies, 1 shape   -> component   (8 of them were named "Frame")
//   home-indicator  11 copies, 1 shape   -> component
//   aurora           8 copies, 1 shape   -> component
//   tab-bar          4 copies, 4 STATES  -> variant set, Active=Home|Discover|Diary|Profile
//   bottom-fade      7 copies, 3 shapes  -> variant set, Context=Nav|Discovery|Detail
//   section-tabs     3 copies, 3 STATES  -> variant set, Active=Ingredients|Nutrition|Instructions

// ---------------------------------------------------------------------------
// 2. The swap preserves the site, not just the node.
// ---------------------------------------------------------------------------
// Record how each copy sits in its parent BEFORE removing it — index, x/y, absolute
// positioning, constraints, locked — then restore all of it on the instance. Dropping
// any one of these silently re-flows the screen.
const site = (n) => ({
  node: n, parent: n.parent, index: n.parent.children.indexOf(n),
  x: n.x, y: n.y, w: n.width, h: n.height,
  abs: n.layoutPositioning === 'ABSOLUTE', locked: n.locked,
  constraints: n.constraints ? { horizontal: n.constraints.horizontal, vertical: n.constraints.vertical } : null
});

// ---------------------------------------------------------------------------
// 3. The icon colour was on the stroke, not the fill.
// ---------------------------------------------------------------------------
// First attempt at the Tab Bar variants copied `fills` for the label and the icon.
// Labels switched; icons did not, because these icons are stroked outlines with an
// EMPTY fills array. Every variant kept the cloned bar's coral Home icon, so Discovery
// rendered a grey "Discover" label beside a coral Home glyph. The structural audit
// passed — four variants, correct labels, one active each. Only the screenshot caught it.
//
// This is CLAUDE.md working agreement 11 again, one level deeper: a selected state is
// however many properties actually carry it, and you have to look rather than assume.
const stateOf = (item) => {
  const label = item.findAll((n) => n.type === 'TEXT')[0];
  const vec = item.findAll((n) => n.type === 'VECTOR')[0];
  return { fills: label.fills, strokes: vec ? vec.strokes : null };  // BOTH
};

// ---------------------------------------------------------------------------
// 4. Clone the working states rather than rebuilding them.
// ---------------------------------------------------------------------------
// Section Tabs had its three states already correct on frames 5, 5b and 5c. Cloning
// those into variants carries the variable bindings intact and never constructs a paint,
// which sidesteps the async bound-paint trap (working agreement 1) entirely.

// ---------------------------------------------------------------------------
// 5. createComponentFromNode wraps a leaf, converts a frame.
// ---------------------------------------------------------------------------
// Given a RECTANGLE it produces a COMPONENT containing that rectangle, so each instance
// still has a child carrying the old name. Given a FRAME it converts in place. An audit
// counting "nodes named home-indicator that are not instances" therefore returns 11 and
// looks like a failed swap when nothing is wrong. Check ancestry before believing it.

// ---------------------------------------------------------------------------
// Left deliberately alone
// ---------------------------------------------------------------------------
// The Bottom Fade ramps stay per-context. Nav 121/solid@756, Discovery 139/solid@737,
// Detail 160/solid@752 — the fade must reach full canvas alpha BY the chrome's top edge
// or content reads through 65% glass, yet must not START inside anything that has to
// stay legible. One component with one ramp cannot satisfy both on three layouts.
