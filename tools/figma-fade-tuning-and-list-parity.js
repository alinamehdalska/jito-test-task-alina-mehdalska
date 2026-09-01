// Plate — remove the opaque CTA pods, tune each scroll fade to its own content, and make
// the ingredient list match its counter.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in three use_figma calls.
//
// Verified after running: 6 fades all solid at or before their chrome, 0 opaque pods,
// 24 tap targets with 0 in the gesture zone, 0 overflow, 0 unbound spacing,
// ingredient rows 5 vs badge "5 items".

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);

// Re-shape a fade so it is fully opaque BY a given y, with a given ramp length.
// Gradients cannot bind to variables, so the canvas colour is read off the existing
// opaque stop rather than hardcoded.
const shape = (f, solidAtY, ramp) => {
  const top = solidAtY - ramp, h = 852 - top, by = ramp / h;
  const fill = f.fills[0], st = fill.gradientStops;
  const aF = st[0].color.a === undefined ? 1 : st[0].color.a;
  const aL = st[st.length - 1].color.a === undefined ? 1 : st[st.length - 1].color.a;
  const c = (aL >= aF ? st[st.length - 1] : st[0]).color;
  const clear = { r: c.r, g: c.g, b: c.b, a: 0 }, solid = { r: c.r, g: c.g, b: c.b, a: 1 };
  const nf = JSON.parse(JSON.stringify(fill));          // fills are read-only
  nf.gradientStops = (aL >= aF)
    ? [{ position: 0, color: clear }, { position: by, color: solid }, { position: 1, color: solid }]
    : [{ position: 0, color: solid }, { position: 1 - by, color: solid }, { position: 1, color: clear }];
  f.fills = [nf];
  f.resize(f.width, h);
  f.y = top;
  return { id: f.id, top, solidAtY, ramp };
};

// ============ 1. screens 5 / 5b: the white pod ============
// The CTA bar was an opaque 393x96 block with a top shadow. Its button ends at 808, so 44pt
// of bare white ran below it and the content above was cut hard against its top edge. That
// dead white is also why the buttons read as sitting too high — moving them further down
// would have pushed them into the gesture zone. Remove the pod, fade the content instead.
const template = await get('85:210');
for (const [frameId, barId] of [['72:98', '72:178'], ['72:189', '72:237']]) {
  const f = await get(frameId), bar = await get(barId);
  bar.fills = [];
  bar.effects = [];
  if (!f.findAll((n) => n.name === 'bottom-fade').length) {
    const fade = template.clone();
    fade.name = 'bottom-fade';
    f.insertChild(f.children.indexOf(bar), fade);       // behind the controls, above content
    fade.x = 0;
    shape(fade, 752, 60);
  }
}

// ============ 2. per-screen fade ramps ============
// A ramp that dies halfway down a card's text panel leaves a washed-out white block with
// unreadable text — that reads as "this card has no title", not "this scrolls". Cut through
// an image or a neutral band instead. Geometry therefore differs per screen.

// Discovery: solid three-quarters down row 2's photo, so the panel never shows.
const grid = await get('71:148');
const disc = page.children.find((c) => c.name.indexOf('4 · Recipe') === 0);
let gy = 0; { let a = grid; while (a && a.id !== disc.id) { gy += a.y; a = a.parent; } }
const row2 = grid.children[1];
shape(await get('85:210'), Math.round(gy + row2.y + row2.children[0].children[0].height * 0.75), 60);

// Dashboard: the ramp must finish by the glass bar at 756 — content still translucent behind
// 65% glass is the defect the fade exists to prevent — while sparing the meal header, whose
// label ends at 717. That leaves only 39pt, so the ramp is SHORT (32), not raised.
for (const id of ['85:209', '85:211', '85:212']) shape(await get(id), 756, 32);

// ============ 3. "5 items" said five, the list held three ============
// Not a clipping artefact — the two rows genuinely did not exist. The instruction steps
// already reference avocado and lemon, and these amounts make the list sum to ~477 kcal,
// reconciling with the stated 480 per serving.
const list = await get('72:151');                       // rows only, 2pt gap, no dividers
const tpl = list.children[list.children.length - 1];
const setText = async (t, chars) => {                   // load CURRENT fonts, await, mutate
  for (const seg of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(seg.fontName);
  t.characters = chars;
};
for (const [name, amount] of [['Avocado', '50 g'], ['Lemon juice', '10 g']]) {
  const nr = tpl.clone();
  list.appendChild(nr);
  const texts = nr.findAll((n) => n.type === 'TEXT');
  await setText(texts[0], name);
  await setText(texts[texts.length - 1], amount);
}

return { ok: true };
