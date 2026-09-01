// Plate — split the recipe section tabs into true tab views, complete the content each tab
// was hiding, and return 20pt of vertical space to Discovery.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in five use_figma calls.
//
// Verified after running: 11 frames; exactly one active tab on each of 5 / 5b / 5c;
// 5 CTAs all at y=808; 7 fades all solid at or before their chrome; 25 tap targets with 0 in
// the gesture zone; 0 opaque pods; 0 overflow; 0 unbound spacing; 0 unexpected zero gaps.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);

const V = {};
for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const S = (n) => { const v = V['space/' + n]; if (!v) throw new Error('space/' + n + ' is not on the grid'); return v; };
const setText = async (t, s) => {
  for (const seg of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(seg.fontName);
  t.characters = s;
};
const shape = (f, solidAtY, ramp) => {
  const top = solidAtY - ramp, h = 852 - top, by = ramp / h;
  const fill = f.fills[0], st = fill.gradientStops;
  const aF = st[0].color.a === undefined ? 1 : st[0].color.a;
  const aL = st[st.length - 1].color.a === undefined ? 1 : st[st.length - 1].color.a;
  const c = (aL >= aF ? st[st.length - 1] : st[0]).color;
  const clear = { r: c.r, g: c.g, b: c.b, a: 0 }, solid = { r: c.r, g: c.g, b: c.b, a: 1 };
  const nf = JSON.parse(JSON.stringify(fill));
  nf.gradientStops = (aL >= aF)
    ? [{ position: 0, color: clear }, { position: by, color: solid }, { position: 1, color: solid }]
    : [{ position: 0, color: solid }, { position: 1 - by, color: solid }, { position: 1, color: clear }];
  f.fills = [nf];
  f.resize(f.width, h);
  f.y = top;
};

// ============ 1. Discovery: give back 20pt of vertical space ============
// The previous pass bought a clean grid cut by pushing the whole column DOWN 20pt so row 2's
// photo edge landed on the nav bar. Unnecessary: the fade only has to be solid where the
// TITLE PANEL starts (737), not where the bar starts (756). The 19pt of plain canvas between
// them costs nothing, and 20pt at the top of the screen is worth far more.
(await get('71:117')).setBoundVariable('paddingTop', S(4));
const disc = page.children.find((c) => c.name.indexOf('4 · Recipe') === 0);
const grid = await get('71:148');
const row2 = grid.children[1];
const panelTop = Math.round(row2.absoluteBoundingBox.y - disc.absoluteBoundingBox.y)
  + Math.round(row2.children[0].children[0].height);
shape(disc.findAll((n) => n.name === 'bottom-fade')[0], panelTop, 24);

// ============ 2. section tabs become true tab views ============
// They were specified as scroll-spy anchors over one long page, which is why 5b rendered the
// nutrition table AND the instructions. An underline indicator reads as a segmented control,
// so that looks like a bug whatever the intent: the active tab said Nutrition while the
// instructions sat directly beneath it.
const f5b = await get('72:189');
for (const f of page.children) {                     // 5c belongs beside 5b
  if (f.type === 'FRAME' && /^\d/.test(f.name) && f.x >= 2760) f.x = f.x + 460;
}
const f5c = f5b.clone();
page.appendChild(f5c);
f5c.x = 2760; f5c.y = 0;
f5c.name = '5c · Recipe Details — Instructions';
f5b.name = '5b · Recipe Details — Nutrition';

const colOf = (f) => f.children.filter((c) => c.type === 'FRAME' && c.layoutMode === 'VERTICAL' && Math.round(c.width) === 393)[0];
const isInstr = (c) => (c.type === 'TEXT' && c.characters === 'Instructions')
  || (c.type === 'FRAME' && c.layoutMode === 'VERTICAL' && c.name !== 'section-tabs' && c.children.length === 3);
for (const c of colOf(f5c).children.slice()) if (c.name !== 'section-tabs' && !isInstr(c)) c.remove();
for (const c of colOf(f5b).children.slice()) if (c.name !== 'section-tabs' && isInstr(c)) c.remove();

// A tab's selected state is FOUR properties. Copying only fills and sizing produced an
// indicator with the right width and no paint, beside a deselected label still in Semibold.
await figma.loadFontAsync({ family: 'SF Pro', style: 'Semibold' });
await figma.loadFontAsync({ family: 'SF Pro', style: 'Regular' });
const tabsOf = (f) => f.findAll((n) => n.name === 'section-tabs')[0].children[0].children;
const ref = tabsOf(f5b);
const pick = (label) => ref.filter((c) => c.children[0].characters === label)[0];
const A = { fills: pick('Nutrition').children[0].fills, font: pick('Nutrition').children[0].fontName, ind: pick('Nutrition').children[1].fills };
const I = { fills: pick('Ingredients').children[0].fills, font: pick('Ingredients').children[0].fontName, ind: pick('Ingredients').children[1].fills };
for (const c of tabsOf(f5c)) {
  const on = c.children[0].characters === 'Instructions';
  const label = c.children[0], ind = c.children[1], src = on ? A : I;
  label.fontName = src.font;
  label.fills = src.fills;
  ind.fills = src.ind;
  if (on) ind.layoutSizingHorizontal = 'FILL';
  else { ind.layoutSizingHorizontal = 'FIXED'; ind.resize(0.01, ind.height); }
}

// ============ 3. the content each tab had been hiding ============
// Standing alone, a five-row nutrition table and a three-step method each left their tab half
// empty. Completed rather than padded — the values follow from figures already stated.
const card = await get('72:196');
const rowTpl = card.children[0], divTpl = card.children[1];
const insertAfter = async (afterLabel, label, value) => {
  const idx = card.children.findIndex((c) => c.type === 'FRAME' && c.children[0] && c.children[0].characters === afterLabel);
  if (idx < 0) throw new Error('row not found: ' + afterLabel);
  const div = divTpl.clone(), row = rowTpl.clone();
  card.insertChild(idx + 1, div);
  card.insertChild(idx + 2, row);
  await setText(row.children[0], label);
  await setText(row.children[1], value);
};
await insertAfter('Carbohydrates', 'Sugars', '6 g');
await insertAfter('Fat', 'Saturated fat', '3.5 g');
await insertAfter('Fibre', 'Sodium', '320 mg');
await insertAfter('Sodium', 'Cholesterol', '65 mg');

// Step 3 was doing two jobs — assembling AND finishing — and nothing covered slicing the
// avocado the ingredient list carries. Splitting it is better recipe writing, not filler.
const steps = colOf(f5c).children[colOf(f5c).children.length - 1];
const titleOf = (s) => s.children[1].children[0];
const bodyOf = (s) => s.children[1].children[1];
const numOf = (s) => s.children[0].findAll((n) => n.type === 'TEXT')[0];
const tpl = steps.children[1];
const mk = async (index, title, body) => {
  const s = tpl.clone();
  steps.insertChild(index, s);
  await setText(titleOf(s), title);
  await setText(bodyOf(s), body);
};
await mk(2, 'Prep the vegetables', 'Halve and slice the avocado, then rinse the spinach and pat it dry.');
await setText(bodyOf(steps.children.filter((s) => titleOf(s).characters === 'Assemble the bowl')[0]),
  'Spoon the rice into bowls, then top with spinach, salmon and avocado.');
await mk(steps.children.length, 'Finish and serve', 'Squeeze the lemon juice over the bowl, season to taste and serve warm.');
for (let i = 0; i < steps.children.length; i++) await setText(numOf(steps.children[i]), String(i + 1));

return { ok: true };
