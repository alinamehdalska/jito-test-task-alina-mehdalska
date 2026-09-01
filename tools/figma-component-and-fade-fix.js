// Plate — component overflow, tap targets, skeleton parity, and the bottom scroll fade.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in three use_figma calls
// (Part A, Part B, fade). Reproduced here as one script for the record.
//
// Verified after running: 327 auto-layout frames, 0 overflow, 0 unbound spacing values,
// tokens.json 219 leaves / 118 aliases / 0 unresolved. Screenshot readback on all 10 frames.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);

const V = {};
for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;

// guarded: a missing token must throw. setBoundVariable(prop, undefined) CLEARS the
// property instead of failing — see CLAUDE.md, Figma working agreement 3.
const S = (n) => { const v = V['space/' + n]; if (!v) throw new Error('space/' + n + ' is not on the grid'); return v; };
const gap = (o, n) => o.setBoundVariable('itemSpacing', S(n));
const padAll = (o, n) => { for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) o.setBoundVariable(p, S(n)); };
const padX = (o, n) => { o.setBoundVariable('paddingLeft', S(n)); o.setBoundVariable('paddingRight', S(n)); };
const padY = (o, n) => { o.setBoundVariable('paddingTop', S(n)); o.setBoundVariable('paddingBottom', S(n)); };
const get = (id) => figma.getNodeByIdAsync(id);

// ============ 1. search fields ============
// The magnifier sat flush against the rounded left edge: padding was 0/16/0/0.
for (const id of ['71:120', '81:222']) padX(await get(id), 16);

// ============ 2. Recipe Card — instance outgrew a fixed-height component ============
// Component 224 (photo 116 + content 108). Restoring the content gap to 8 grew every
// instance's content to 124, so the "Fits your calories" chip rendered below the card
// with no error. Fix the COMPONENT and let it hug; then re-measure the rows.
for (const id of ['66:29', '66:39', '66:49']) gap(await get(id), 8);
for (const id of ['37:28', '37:39', '37:50']) (await get(id)).layoutSizingVertical = 'HUG';

const disc = page.children.find((c) => c.name.indexOf('4 · Recipe') === 0);
const rowIds = [];
for (const i of disc.findAll((n) => n.type === 'INSTANCE' && n.name === 'Recipe Card'))
  if (rowIds.indexOf(i.parent.id) < 0) rowIds.push(i.parent.id);
for (const rid of rowIds) {
  const row = await get(rid);
  for (const c of row.children) if (c.type === 'INSTANCE') c.layoutSizingVertical = 'HUG';
  const maxH = Math.max.apply(null, row.children.map((c) => c.height));
  row.resize(row.width, maxH);                       // resize BEFORE sizing modes
  for (const c of row.children) if (c.type === 'INSTANCE') c.layoutSizingVertical = 'FILL';
}

// ============ 3. ingredient rows ============
// Three of four name columns carried a stray 0/16/0/16, the fourth carried none, so the
// names started 16pt apart down the list. Flush them all; give the card vertical air.
for (const id of ['70:144', '70:156', '70:182']) padX(await get(id), 0);
padY(await get('70:139'), 8);

// ============ 4. number + unit pairs align on the baseline, not the box centre ============
for (const f of page.children) {
  if (f.type !== 'FRAME' || !/^\d/.test(f.name)) continue;
  for (const n of f.findAll((x) => x.type === 'FRAME' && x.layoutMode === 'HORIZONTAL'
      && x.children.length >= 2 && x.children.every((c) => c.type === 'TEXT'))) {
    const sz = n.children.map((c) => c.fontSize).filter((s) => typeof s === 'number');
    if (sz.length < 2) continue;
    if (sz.some((s) => s !== sz[0]) || n.id === '72:119') n.counterAxisAlignItems = 'BASELINE';
  }
}

// ============ 5. segmented control ============
// Even 24pt gaps; the active underline fills its label instead of a fixed 24pt stub.
for (const id of ['80:210', '80:222']) gap(await get(id), 24);
for (const id of ['80:213', '80:228']) (await get(id)).layoutSizingHorizontal = 'FILL';

// ============ 6. steppers ============
// The minus/plus buttons were flush against the pill's arc (padding 0).
// 16 — not the 24 first considered: the pill is 52 tall around 28pt buttons, so the
// vertical inset is 12, and 24 horizontal would have read lopsided against it.
for (const id of ['72:179', '72:238']) padX(await get(id), 16);
for (const id of ['69:173', '70:193']) (await get(id)).setBoundVariable('paddingRight', S(12));

// ============ 7. skeleton must match the real product card exactly ============
// Skeleton rows were 72 tall against a real card of 88 — results jumped 48pt on load.
gap(await get('73:236'), 12);
for (const [row, block, inner] of [['73:237', '73:238', '73:239'], ['73:242', '73:243', '73:244'], ['73:247', '73:248', '73:249']]) {
  const r = await get(row); r.resize(r.width, 88); padAll(r, 16); gap(r, 12);
  (await get(block)).resize(56, 56);
  gap(await get(inner), 4);
}

// ============ 8. tap targets, chip rows, step spacing, meal headers ============
for (const id of ['70:148', '70:160', '70:173', '70:186']) (await get(id)).resize(44, 44);
for (const rowId of ['69:146', '71:130']) {
  const row = await get(rowId);
  gap(row, 12);
  if (row.layoutWrap === 'WRAP') row.counterAxisSpacing = 12;
  for (const c of row.children) { c.resize(c.width, 36); c.layoutSizingHorizontal = 'HUG'; }
}
for (const id of ['72:219', '72:225', '72:231']) gap(await get(id), 16);
padX(await get('72:220'), 0);            // 24pt of padding inside a 26pt box squeezed the digit
for (const id of ['67:197', '67:210', '67:223']) (await get(id)).setBoundVariable('paddingBottom', S(12));

// ============ 9. action sheet ============
const scrim = await get('73:177');
if (!scrim.effects.some((e) => e.type === 'BACKGROUND_BLUR'))
  scrim.effects = scrim.effects.concat([{ type: 'BACKGROUND_BLUR', radius: 20, visible: true }]);
padY(await get('73:180'), 8);            // 4pt grabber -> 20pt drag area

// ============ 10. bottom safe-area, then the scroll fade ============
// Pinned-CTA screens: the opaque CTA bar IS the bottom chrome, so 48pt on top of it was dead.
for (const f of page.children) {
  if (f.type !== 'FRAME' || !/^\d/.test(f.name)) continue;
  const cta = f.children.filter((c) => c.type === 'FRAME'
    && c.findAll((n) => n.type === 'INSTANCE' && n.name === 'Button').length && Math.round(c.y) > 500)[0];
  if (!cta) continue;
  for (const col of f.children.filter((c) => c.type === 'FRAME' && c.layoutMode === 'VERTICAL'
      && Math.round(c.width) === 393 && c.name !== 'aurora' && c.paddingBottom === 48))
    col.setBoundVariable('paddingBottom', S(32));
}

// The fade was 393x96 at y=756 — starting exactly where the bar starts, topping out at
// 0.86 alpha. It could not mask anything: card titles stayed legible through the glass and
// a second line rendered in the 824-852 band beside the home indicator.
const BAR_TOP = 756, RAMP = 60;
const FADE_TOP = BAR_TOP - RAMP, FADE_H = 852 - FADE_TOP, SOLID_BY = RAMP / FADE_H;
for (const f of page.findAll((n) => n.name === 'bottom-fade')) {
  const fill = f.fills[0];
  if (!fill || fill.type.indexOf('GRADIENT') !== 0) continue;
  const st = fill.gradientStops;
  const aFirst = st[0].color.a === undefined ? 1 : st[0].color.a;
  const aLast = st[st.length - 1].color.a === undefined ? 1 : st[st.length - 1].color.a;
  const c = (aLast >= aFirst ? st[st.length - 1] : st[0]).color;   // the canvas end
  const clear = { r: c.r, g: c.g, b: c.b, a: 0 };
  const solid = { r: c.r, g: c.g, b: c.b, a: 1 };
  const nf = JSON.parse(JSON.stringify(fill));                     // fills are read-only
  nf.gradientStops = (aLast >= aFirst)
    ? [{ position: 0, color: clear }, { position: SOLID_BY, color: solid }, { position: 1, color: solid }]
    : [{ position: 0, color: solid }, { position: 1 - SOLID_BY, color: solid }, { position: 1, color: clear }];
  f.fills = [nf];
  f.resize(f.width, FADE_H);
  f.y = FADE_TOP;
}

return { ok: true };
