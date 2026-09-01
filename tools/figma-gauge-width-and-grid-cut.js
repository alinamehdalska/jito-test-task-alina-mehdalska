// Plate — Hero Gauge widened to the card interior, and the Discovery grid cut repositioned
// so its fade can be light instead of heavy.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in three use_figma calls.
//
// Verified after running: gauge margins 0/0 against the card interior; Discovery crisp photo
// 91 of 116pt (was 27); 6 fades all solid at or before their chrome; 4 CTAs all at y=808;
// 24 tap targets with 0 in the gesture zone; 0 overflow; 0 unbound spacing.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);

const V = {};
for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const S = (n) => { const v = V['space/' + n]; if (!v) throw new Error('space/' + n + ' is not on the grid'); return v; };

// Re-shape a fade so it is fully opaque BY a given y, with a given ramp length.
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

// ============ 1. Hero Gauge: fill the card interior ============
// The gauge measured symmetric under `counterAxisAlignItems: CENTER`, but not exactly: the
// 313 - 300 = 13pt remainder is odd, and Figma rounds it to 7 LEFT / 6 RIGHT. One point is
// invisible alone — the 6.5pt inset against a full-width divider directly beneath it is not.
// A zero remainder fixes both, and lines the end labels up with the macro rows.
//
// This MUST be done on the component. Instance children reject relative-transform overrides
// ("This property cannot be overridden in an instance"), and every child is pinned MIN/MIN,
// so resizing the instance alone would leave the arc 300 wide and genuinely left-aligned.
// Not figma.rescale() either — that scales font sizes, dragging the value off display-calorie.
const W = 313, k = W / 300;
const comp = await get('35:23');
const [arc, big, small, lLab, rLab] = comp.children;
arc.resize(W, 156 * k);
for (const e of arc.children) e.resize(W, W);      // 300x300 circles clipped to the top half
big.resize(W, big.height);     big.y = 74 * k;     // CENTER-aligned text recentres itself
small.resize(W, small.height); small.y = 134 * k;
lLab.x = 0;              lLab.y = 152 * k;
rLab.x = W - rLab.width; rLab.y = 152 * k;
comp.resize(W, 196 * k);
(await get('67:147')).resize(W, 196 * k);          // size IS overridable on the instance root

// ============ 2. Discovery: position the cut, don't fade over it ============
// A grid row cannot be half-shown well. Cut it in the photo and the fade must be heavy
// enough to erase a title panel further down — which is what made the second row look like
// cards with no titles. Cut it in the panel and you get washed-out unreadable text.
// So move the grid instead: row 2's photo bottom edge lands on the nav bar's top edge, the
// photo stays whole and crisp, and the bar itself hides the panel. Column top padding
// 4 -> 24 supplies the 20pt, and 24 is a better inset under the status bar anyway.
(await get('71:117')).setBoundVariable('paddingTop', S(24));
const disc = page.children.find((c) => c.name.indexOf('4 · Recipe') === 0);
shape(disc.findAll((n) => n.name === 'bottom-fade')[0], 756, 24);

// ============ 3. dashboard fade, re-tuned after the gauge grew ============
// Widening the gauge added 8pt of height, pushing the meal header down into the old ramp.
// The ramp must still finish by the glass bar at 756, so it gets shorter, never higher.
const dash = page.children.find((c) => c.name.indexOf('1 · Dash') === 0);
const label = (await get('67:195')).children[0].children[0].findAll((n) => n.type === 'TEXT')[0];
let ly = 0; { let a = label; while (a && a.id !== dash.id) { ly += a.y; a = a.parent; } }
const ramp = Math.max(16, 756 - (Math.round(ly + label.height) + 6));
for (const id of ['85:209', '85:211', '85:212']) shape(await get(id), 756, ramp);

return { ok: true };
