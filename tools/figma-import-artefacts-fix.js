// Plate — three defects introduced by the icon and Apple-kit imports, all invisible to a
// structural audit and all caught from a screenshot.
// APPLIED 2026-09-02 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in eight use_figma calls.
//
// Verified after running: 0 icon instances carrying a fill; every home indicator at exactly
// 126.5/839; every status bar at 0 with width 393; 319 text nodes, 0 unstyled; drift [].

// ---------------------------------------------------------------------------
// 1. `createNodeFromSvg` and `createComponentFromNode` hand back a WHITE frame.
// ---------------------------------------------------------------------------
// Invisible against a white surface, which is why 22 icons and the home indicator shipped
// with a white box nobody could see — until one landed on the coral FAB.
//
// Clearing it on the component is not enough. Instances created while the component still
// had the fill hold that white as an OVERRIDE, and an override does not track the
// component. Both levels need clearing:
//   for (const v of iconSet.children) v.fills = []          // the component
//   for (const i of allIconInstances)  i.fills = []          // and every instance

// ---------------------------------------------------------------------------
// 2. Measure the PAINTED node, not the instance box.
// ---------------------------------------------------------------------------
// An audit read the home indicator instance at x=127 and passed it as centred. The
// rectangle inside it was at x=-13 — hanging off the left edge of every frame — because the
// instance's bounding box and its painted content had come apart. The screenshot showed a
// dark bar at the wrong end of the screen while the numbers said it was fine.
//
//   const painted = deep(instance, n => n.type === 'RECTANGLE')[0] || instance
//   const x = painted.absoluteBoundingBox.x - frame.absoluteBoundingBox.x
//
// Same class of error hid a 24pt offset on the status bar: the component had inherited
// `paddingLeft/Right: 24` from the hand-built bar it replaced, so the Apple instance sat
// 24pt right of the origin and overflowed the frame. `child.x = 0` silently does nothing
// inside an auto-layout parent — clear the padding instead.
//
// And three of the indicators could not be moved at all: they live inside the Dashboard
// component instance, and instance children reject `relative-transform`
// (CLAUDE.md working agreement 12). Fix those on the component.

// ---------------------------------------------------------------------------
// 3. A 24pt ramp across a photo edge is a cut, not a fade.
// ---------------------------------------------------------------------------
// Discovery's fade started at 713 and reached full canvas by 737. Row 2's photo ends at 721
// and its title panel starts there, so the ramp crossed both boundaries inside 24pt and
// read as a hard horizontal line.
//
// The fix is to land the solid point ON the photo's bottom edge and give the ramp room
// above it: transparent at 661, solid at 721, 60pt of dissolve entirely within the photo.
// No part of the title panel ever shows, so the row reads as "more below" rather than as a
// card whose title failed to render — which is what the short ramp had produced.
