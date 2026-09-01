// Plate — hero-arc centring, status bars, tab-counter baseline, and a single CTA baseline.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in two use_figma calls.
//
// Verified after running: 24 tap targets below y=700, 0 inside the home-indicator zone;
// 0 unbound spacing values; 0 unexpected zero gaps; all 10 frames carry a status bar.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);

const V = {};
for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const S = (n) => { const v = V['space/' + n]; if (!v) throw new Error('space/' + n + ' is not on the grid'); return v; };
const gap = (o, n) => o.setBoundVariable('itemSpacing', S(n));
const get = (id) => figma.getNodeByIdAsync(id);

// ============ 1. hero arc was leaning left ============
// The Hero Gauge is 300 wide inside a 313pt card interior. Left-aligned that is 20pt of
// left margin against 33pt of right — invisible in the layer tree, obvious on canvas.
// The card's other children are already full-width, so centring moves only the gauge.
(await get('67:146')).counterAxisAlignItems = 'CENTER';

// ============ 2. status bars ============
// Screens 5 and 5b were the only two without one. (Screen 2 already had it.)
// 5b's collapsed header reserves exactly 59pt for this; 5 takes it over the hero photo.
const src = await get('71:111');
for (const fid of ['72:98', '72:189']) {
  const f = await get(fid);
  if (f.findAll((n) => n.type === 'TEXT' && n.characters === '9:41').length) continue;
  const sb = src.clone();
  sb.name = 'status-bar';
  f.appendChild(sb);                      // last child = on top of the hero photo
  sb.x = 0; sb.y = 0;
}

// ============ 3. tab counter sat 4pt below the tab labels ============
// "5 items" is 16pt tall and was centred against a 30pt tab column whose label occupies
// only the top 20pt (the remaining 10 is gap + active underline). Align first baselines.
for (const id of ['80:209', '80:221']) (await get(id)).counterAxisAlignItems = 'BASELINE';

// ============ 4. Discovery: tighter chips and section rhythm ============
// Chip height stays 36 — that is the Filter Pill spec and the tap target. Only gaps shrink.
const chips = await get('71:130');
gap(chips, 8);
chips.counterAxisSpacing = 8;
gap(await get('71:117'), 12);

// ============ 5. one CTA baseline: bottom edge at y = 808 ============
// 44pt above the frame bottom, clear of the home indicator's reserved zone (818-852).
// Note the two directions: on 5/5b the bar was too HIGH (button at 794, only 7pt of air
// above it), so it moves down. On 3 the button was too LOW — 832, i.e. 14pt inside the
// zone. "Move the CTA down" is not a global instruction; the target is the number.
const TARGET = 808;

for (const id of ['72:178', '72:237']) {        // screens 5 and 5b
  const bar = await get(id);
  bar.y = 756;
  bar.resize(bar.width, 852 - 756);             // reach the frame bottom, no canvas sliver
}

// Screen 3 needs 24pt to rise, reclaimed without touching row spacing.
gap(await get('70:122'), 12);                   // column rhythm 16 -> 12, matching screen 2
const totalCard = await get('70:204');
totalCard.setBoundVariable('paddingTop', S(8)); // TOTAL DISH card 12 -> 8
totalCard.setBoundVariable('paddingBottom', S(8));
const grp = await get('70:203');
gap(grp, 8);                                    // group's own gap 12 -> 8
grp.y = TARGET - grp.height;                    // leaves a 14pt gap above the group

// Screen 6's sheet overflowed the frame by 24pt, putting its last option row 3pt from the
// home indicator. Anchor the last row to the target and let the sheet reach the bottom.
const sheet = await get('73:178');
const last = sheet.children[sheet.children.length - 1];
sheet.y = TARGET - (last.y + last.height);
sheet.resize(sheet.width, 852 - sheet.y);

return { ok: true };
