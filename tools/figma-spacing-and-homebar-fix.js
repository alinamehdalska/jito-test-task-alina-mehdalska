// Plate — spacing repair + home indicator + bottom safe-area
// Run via use_figma on fileKey lzCgTFcfrlE8qGqYbBTh7l once edit access is restored.
// UNTESTED: written while the MCP was authenticated as a different account.
// Returns a report; read it before trusting the result, then screenshot every frame.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);

const varByName = {};
for (const v of await figma.variables.getLocalVariablesAsync()) varByName[v.name] = v;

// --- guarded setters: a missing token must throw, never silently clear ---
const V = (n) => {
  const v = varByName['space/' + n];
  if (!v) throw new Error('space/' + n + ' is not on the 4/8 grid');
  return v;
};
const gap = (n, s) => n.setBoundVariable('itemSpacing', V(s));
const pad = (n, t, r, b, l) => {
  n.setBoundVariable('paddingTop', V(t)); n.setBoundVariable('paddingRight', V(r));
  n.setBoundVariable('paddingBottom', V(b)); n.setBoundVariable('paddingLeft', V(l));
};
const bindPaint = (node, prop, token, hex) => {
  const h = parseInt(hex.slice(1), 16);
  node[prop] = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: ((h>>16)&255)/255, g: ((h>>8)&255)/255, b: (h&255)/255 } },
    'color', varByName[token])];
};
const radius = (n, name) => {
  const v = varByName[name];
  n.setBoundVariable('topLeftRadius', v); n.setBoundVariable('topRightRadius', v);
  n.setBoundVariable('bottomLeftRadius', v); n.setBoundVariable('bottomRightRadius', v);
};

// the scale tops out at 64; a bottom safe-area needs more, and 80/96 are valid 8pt steps
const prims = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Primitives');
for (const step of [80, 96]) {
  if (varByName['space/' + step]) continue;
  const nv = figma.variables.createVariable('space/' + step, prims, 'FLOAT');
  nv.setValueForMode(prims.modes[0].modeId, step);
  nv.scopes = ['GAP', 'WIDTH_HEIGHT'];
  nv.description = step + 'pt — layout-level only (bottom safe-area under the floating nav).';
  varByName['space/' + step] = nv;
}

const frames = {};
for (const c of page.children) if (c.type === 'FRAME' && /^\d/.test(c.name)) frames[c.name] = c;
const report = { gapsRepaired: 0, byText: [], homeBars: [], safeArea: [], notFound: [] };

const textIn = (root, chars) => root.findAll(n => n.type === 'TEXT' && n.characters === chars)[0] || null;
const up = (n, hops) => { let x = n; for (let i = 0; i < hops; i++) x = x.parent; return x; };

// ============ 1. blanket gap repair ============
// snap: 3->4, 5/6/7->8, 10->12, 14->16, 18->20. Zero gaps get a context default.
const walk = (n, frameName) => {
  if (n.type === 'FRAME' && n.layoutMode && n.layoutMode !== 'NONE') {
    const kids = n.children.length;
    const spaced = n.primaryAxisAlignItems === 'SPACE_BETWEEN';
    if (kids > 1 && (n.itemSpacing || 0) === 0 && !spaced) {
      // icon+text rows read best at 8; stacked label groups at 4; section stacks at 12
      const hasIcon = n.children.some(c => c.name === 'icon' || c.type === 'ELLIPSE' || c.type === 'VECTOR');
      const g = n.layoutMode === 'HORIZONTAL' ? (hasIcon ? 8 : 12) : (n.height < 60 ? 4 : 12);
      gap(n, g);
      report.gapsRepaired++;
    }
  }
  if ('children' in n) for (const c of n.children) walk(c, frameName);
};
for (const f of page.children) if (f.type === 'FRAME' && /^\d/.test(f.name)) walk(f, f.name);

// ============ 2. explicit fixes the blanket pass cannot infer ============
const fix = (frameName, chars, hops, fn, label) => {
  const f = frames[frameName];
  if (!f) return report.notFound.push(frameName);
  const t = textIn(f, chars);
  if (!t) return report.notFound.push(frameName + ' / ' + chars);
  fn(up(t, hops));
  report.byText.push(label || (frameName.slice(0, 14) + ' · ' + chars.slice(0, 18)));
};

// serving-size chips lost their horizontal padding and collapsed into circles
for (const [fr, labels] of [['2 · Calculator — Product', ['100 g', '150 g', '200 g', 'Custom']]]) {
  for (const l of labels) fix(fr, l, 1, (n) => { pad(n, 0, 16, 0, 16); }, 'chip ' + l);
}
// the chip row and its section label
fix('2 · Calculator — Product', 'SERVING SIZE', 1, (n) => gap(n, 12), 'SERVING SIZE stack');

// dots touching their values
fix('3 · Dish Calculator', '32 g', 2, (n) => gap(n, 8), 'dish macro totals row');
fix('4 · Recipe Discovery', '610 kcal left', 1, (n) => gap(n, 8), '610 kcal badge');

// dish name label -> input
fix('3 · Dish Calculator', 'DISH NAME', 1, (n) => gap(n, 8), 'DISH NAME stack');
// ingredients header -> card, and row internals
fix('3 · Dish Calculator', 'INGREDIENTS (4)', 2, (n) => gap(n, 12), 'INGREDIENTS stack');
fix('3 · Dish Calculator', 'Chicken breast', 2, (n) => gap(n, 12), 'ingredient row');

// search field leading padding + gap to the filter button
fix('4 · Recipe Discovery', 'Search recipes', 1, (n) => pad(n, 0, 12, 0, 16), 'search field');
fix('4 · Recipe Discovery', 'Search recipes', 2, (n) => gap(n, 12), 'search + filter row');
fix('2 · Calculator — Product', 'Greek yogurt', 1, (n) => pad(n, 0, 12, 0, 16), 'search field');

// recent chip star -> label
fix('2 · Calculator — Product', 'Greek yogurt', 3, (n) => gap(n, 12), 'recent chip row');

// product row: thumbnail -> text
fix('2 · Calculator — Product', 'Greek Yogurt, 2%', 2, (n) => gap(n, 12), 'product row');

// macro stat rows: gap between stats, and label-row -> bar
const dash = frames['1 · Dashboard'];
if (dash) {
  const carbs = textIn(dash, 'Carbs');
  if (carbs) {
    const statsCol = up(carbs, 3);              // text -> left grp -> top row -> stat -> col
    gap(statsCol, 16);
    for (const stat of statsCol.children) gap(stat, 8);
    report.byText.push('macro stat spacing');
  }
}

// "+ Add food": replace the padded-string hack with a real icon + gap
const PLUS = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5.5v13M5.5 12h13" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>';
for (const fr of ['1 · Dashboard', '7 · Diary — empty state']) {
  const f = frames[fr];
  if (!f) continue;
  const t = f.findAll(n => n.type === 'TEXT' && n.characters.indexOf('Add food') > -1)[0];
  if (!t) continue;
  await figma.loadFontAsync(t.fontName);
  t.characters = 'Add food';
  const btn = t.parent;
  if (!btn.children.some(c => c.name === 'icon')) {
    const ic = figma.createNodeFromSvg(PLUS);
    ic.name = 'icon'; ic.resize(20, 20); ic.fills = [];
    for (const c of ic.findAll(() => true)) {
      if ('strokes' in c && c.strokes && c.strokes.length) bindPaint(c, 'strokes', 'text/primary', '#362B23');
    }
    btn.insertChild(0, ic);
  }
  gap(btn, 12);
  report.byText.push(fr.slice(0, 14) + ' · Add food icon');
}
// gap between the Add food pill and the scan button
if (dash) {
  const t = dash.findAll(n => n.type === 'TEXT' && n.characters === 'Add food')[0];
  if (t) { gap(up(t, 2), 12); report.byText.push('add + scan row'); }
}

// ============ 3. home indicator ============
const addHomeBar = (holder) => {
  if (holder.children.some(c => c.name === 'home-indicator')) return null;
  const bar = figma.createRectangle();
  bar.name = 'home-indicator';
  bar.resize(140, 5);
  bar.x = Math.round((393 - 140) / 2);
  bar.y = 852 - 8 - 5;
  bindPaint(bar, 'fills', 'text/primary', '#362B23');
  bar.fills = bar.fills.map(p => Object.assign({}, p));
  radius(bar, 'radius/full');
  bar.locked = true;
  holder.appendChild(bar);
  return Math.round(bar.y);
};
for (const f of page.children) {
  if (f.type !== 'FRAME' || !/^\d/.test(f.name)) continue;
  const y = addHomeBar(f);
  if (y !== null) report.homeBars.push({ frame: f.name.slice(0, 26), y });
}

// ============ 4. bottom safe-area ============
// nav bar spans 756..824, home indicator sits at 839 — 96 clears both
for (const f of page.children) {
  if (f.type !== 'FRAME' || !/^\d/.test(f.name)) continue;
  const hasNav = f.findAll(n => n.name === 'tab-bar').length > 0;
  for (const col of f.findAll(n =>
      n.type === 'FRAME' && n.layoutMode === 'VERTICAL' &&
      Math.round(n.width) === 393 && Math.round(n.y) < 200 && n.name !== 'aurora')) {
    col.setBoundVariable('paddingBottom', V(hasNav ? 96 : 48));
    report.safeArea.push({ frame: f.name.slice(0, 22), pad: hasNav ? 96 : 48 });
  }
}

return report;
