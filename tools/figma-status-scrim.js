// Plate — make screen 5's status bar legible over its hero photograph.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l.
//
// Screen 5 is the only frame whose status bar sits on a photograph instead of the canvas
// gradient. `9:41` and the signal/wifi/battery glyphs are text.primary — dark ink over
// salmon, measuring roughly 4.2:1 and close to illegible. Found while building the device
// mockups, which is what made it obvious: presenting a screen at size is a different test
// from auditing it.
//
// The alternative was a light status-bar variant for photo-hero screens. A scrim was
// chosen because it keeps the chrome identical on all 11 frames — one status bar, one ink.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);
const kids = (n) => ('children' in n && n.children) ? n.children : [];

// --- the alpha is solved, not chosen --------------------------------------------------
// Worst case beneath a white scrim is a black photo, where the composited channel is just
// the alpha: a*1 + (1-a)*0 = a. So the alpha required for 4.5:1 IS the required sRGB
// value, and anything at or above it holds for ANY image rather than for this one salmon
// bowl. Solved floor: 0.578. Used: 0.62 -> 5.14:1 guaranteed.
const vars = await figma.variables.getLocalVariablesAsync('COLOR');
const tp = vars.find((v) => v.name === 'text/primary');
const raw = tp.valuesByMode[Object.keys(tp.valuesByMode)[0]];
const ink = raw.r !== undefined ? raw : (() => { throw new Error('text/primary is an alias — resolve it'); })();

const lin = (c) => (c <= 0.04045) ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const srgb = (l) => (l <= 0.0031308) ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
const L = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);

const Link = L(ink);                                  // text.primary = rgb(54, 43, 35)
const minAlpha = srgb(4.5 * (Link + 0.05) - 0.05);    // 0.578
const GLYPH_ALPHA = 0.62;

// --- build ----------------------------------------------------------------------------
const f5 = await get('72:98');
if (kids(f5).some((c) => c.name === 'status-scrim')) throw new Error('scrim already present');
const photo = kids(f5).find((c) => c.name.startsWith('photo'));

// Reuse a known vertical gradient's matrix rather than hand-rolling one. The bottom fade's
// stops run a=0 at position 0 to a=1 at 0.21, which confirms position 0 is the TOP edge —
// checked rather than assumed, because a flipped axis would put the scrim's opaque end
// under the content panel where it does nothing.
const fadeRect = kids(await get('176:405'))[0];
const XF = JSON.parse(JSON.stringify(fadeRect.fills[0].gradientTransform));

const scrim = figma.createRectangle();
scrim.name = 'status-scrim';
f5.insertChild(kids(f5).indexOf(photo) + 1, scrim);   // above the photo, below all chrome
scrim.resize(393, 104);
scrim.x = 0; scrim.y = 0;
scrim.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
// Gradients cannot bind to variables (working agreement 5). White is bg.surface's Light
// value, hardcoded like the aurora, the bottom fade and the recipe-card photo scrim; a
// Dark mode would need these stops re-authored.
scrim.fills = [{
  type: 'GRADIENT_LINEAR',
  gradientTransform: XF,
  gradientStops: [
    { position: 0,    color: { r: 1, g: 1, b: 1, a: 0.74 } },
    // Glyphs occupy y 24-37; holding 0.62 to y=44 clears them with room to spare.
    { position: 0.42, color: { r: 1, g: 1, b: 1, a: GLYPH_ALPHA } },
    { position: 1,    color: { r: 1, g: 1, b: 1, a: 0 } }
  ]
}];

// 104pt of ramp rather than a hard stop at 59: an edge exactly where the status bar ends
// would read as a band welded across the photo, which is the defect the bottom fade was
// already fixed for once (working agreement 10).

return { minAlpha, used: GLYPH_ALPHA, createdNodeIds: [scrim.id] };

// The presentation board holds a clone of this screen, so that clone was rebuilt in the
// same pass — see tools/figma-device-mockups.js. Clones are regenerated, never patched.
