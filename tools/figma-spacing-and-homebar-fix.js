// Plate — spacing repair + home indicator + bottom safe-area
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l.
// Result: 60 gaps restored, 24 deliberately left at zero, 7 chips repadded,
// 10 home indicators added, safe-areas set, Calculator collision resolved.
//
// The original blanket gap heuristic was REPLACED before running. Auditing the 84
// zero-gap containers first showed not all of them wanted a gap: cards whose rows
// are separated by hairline dividers (signatures FRI, FRFRFRF, FRFRFRFRF) and
// tight numeric pairs are correct at zero, and a blanket pass would have floated
// every divider off its row. Gaps are assigned by child-shape signature instead.

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
const report = { gapsRepaired: 0, leftAtZero: 0, padsRepaired: 0, steppers: 0, byText: [], homeBars: [], safeArea: [], notFound: [] };

const textIn = (root, chars) => root.findAll(n => n.type === 'TEXT' && n.characters === chars)[0] || null;
const up = (n, hops) => { let x = n; for (let i = 0; i < hops; i++) x = x.parent; return x; };

// ============ 1. classified gap repair ============
const KEEP_ZERO = new Set(['FRI', 'FRFRFRF', 'FRFRFRFRF']);
const TIGHT_TEXT = /^(320|540|380|244|32 g|53 g|14 g|142|78|41)$/;

const sig = (n) => n.children.map(c =>
  c.type === 'TEXT' ? 'T' : c.type === 'ELLIPSE' ? 'O' : c.type === 'RECTANGLE' ? 'R' :
  c.type === 'INSTANCE' ? 'I' : c.name === 'icon' ? 'i' : 'F').join('');

const gapFor = (n) => {
  const k = sig(n);
  const t = n.findAll(x => x.type === 'TEXT')[0];
  const txt = t ? t.characters : '';
  if (KEEP_ZERO.has(k)) return null;               // hairline dividers do the separating
  if (n.layoutMode === 'HORIZONTAL') {
    if (k === 'OT' || k === 'OF' || k === 'iT') return 8;
    if (k === 'TTT') return 4;
    if (k === 'IF' || k === 'RFi' || k === 'FF' || k === 'FTF') return 12;
    return null;
  }
  if (k === 'TR') return 8;
  if (k === 'III') return 16;
  if (k === 'RR') return 8;
  if (k === 'TT') return TIGHT_TEXT.test(txt.trim()) ? null : 4;
  if (k === 'TF' || k === 'TFF') return /SERVING SIZE/.test(txt) ? 12 : 8;
  if (k === 'FF') return /INGREDIENTS/.test(txt) ? 12 : 8;
  if (k === 'FFF') return 12;
  return null;
};

const walk = (n) => {
  if (n.type === 'FRAME' && n.layoutMode && n.layoutMode !== 'NONE') {
    if (n.children.length > 1 && (n.itemSpacing || 0) === 0 &&
        n.primaryAxisAlignItems !== 'SPACE_BETWEEN') {
      const g = gapFor(n);
      if (g === null) report.leftAtZero++;
      else { gap(n, g); report.gapsRepaired++; }
    }
  }
  if ('children' in n) for (const c of n.children) walk(c);
};
for (const f of page.children) if (f.type === 'FRAME' && /^\d/.test(f.name)) walk(f);

// ============ 1b. blanket padding repair ============
// A filled, rounded container wide enough to be a card or row must not have text
// flush against its edge. Only ever SET a missing value — never re-set an existing
// one, because an existing off-grid value would make the guarded setter throw.
const padWalk = (n) => {
  if (n.type === 'FRAME' && n.layoutMode && n.layoutMode !== 'NONE') {
    const filled = Array.isArray(n.fills) && n.fills.length && n.fills[0].type === 'SOLID';
    const rounded = (n.topLeftRadius || 0) >= 8;
    const wide = n.width > 120;
    if (filled && rounded && wide) {
      let touched = false;
      if ((n.paddingLeft || 0) === 0 && (n.paddingRight || 0) === 0) {
        n.setBoundVariable('paddingLeft', V(16));
        n.setBoundVariable('paddingRight', V(16));
        touched = true;
      }
      // vertical padding only matters where the container hugs its content;
      // fixed-height rows centre their children and are fine at 0
      const hugsV = n.layoutMode === 'VERTICAL' && n.primaryAxisSizingMode === 'AUTO';
      if (hugsV && (n.paddingTop || 0) === 0 && (n.paddingBottom || 0) === 0) {
        n.setBoundVariable('paddingTop', V(12));
        n.setBoundVariable('paddingBottom', V(12));
        touched = true;
      }
      if (touched) report.padsRepaired++;
    }
  }
  if ('children' in n) for (const c of n.children) padWalk(c);
};
for (const f of page.children) if (f.type === 'FRAME' && /^\d/.test(f.name)) padWalk(f);

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

// "+ Add food": the padded-string hack becomes a single space.
// The icon cannot be inserted here — the button is a shared component INSTANCE,
// and inserting into the component would put a plus on every button in the library.
for (const t of page.findAll(n => n.type === 'TEXT' && /^\+\s{2,}Add food$/.test(n.characters))) {
  await figma.loadFontAsync(t.fontName);
  t.characters = '+ Add food';
  report.byText.push('Add food label');
}

// gap between the Add food pill and the scan button
if (dash) {
  const t = dash.findAll(n => n.type === 'TEXT' && n.characters === 'Add food')[0];
  if (t) { gap(up(t, 2), 12); report.byText.push('add + scan row'); }
}

// stepper clusters: consistent gap and 36pt controls so +/- never crowd the value
for (const [fr, label] of [['2 · Calculator — Product', 'Amount'], ['3 · Dish Calculator', 'Servings']]) {
  const f = frames[fr];
  if (!f) continue;
  const t = textIn(f, label);
  if (!t) { report.notFound.push(fr + ' / ' + label); continue; }
  const row = t.parent;
  pad(row, 0, 8, 0, 16);
  const cluster = row.children.find(c => c.type === 'FRAME' && c.layoutMode === 'HORIZONTAL' && c !== t);
  if (cluster) {
    gap(cluster, 12);
    for (const b of cluster.children) {
      if (b.type === 'FRAME' && b.children.length === 1 && b.children[0].name === 'icon') {
        b.resize(36, 36);
        b.primaryAxisSizingMode = 'FIXED';
        b.counterAxisSizingMode = 'FIXED';
      }
    }
  }
  report.steppers++;
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
