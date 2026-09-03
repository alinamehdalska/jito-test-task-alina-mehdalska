// Plate — wire the 11 Screens frames into a clickable prototype, and give screen 7 the
// bottom chrome it was missing.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l.
//
// 48 reactions, 2 flow starting points, 0 dangling destinations, 0 unreachable frames.
//
// THE CONSTRAINT THAT SHAPED THIS PASS: Figma prototype links are per-page. A reaction
// living on the Tab Bar component (page 02) cannot point at a frame on page 04, so the
// atomic version of this — wire the component once, let 4 instances inherit — is not
// available. Every reaction therefore sits on a Screens-page node, and the tab bar is
// wired 3× (Dashboard, Discovery, Logged) because those are 3 separate instances.
// That duplication is a platform limit, not a design decision; the coded prototype will
// express it once.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);
const kids = (n) => ('children' in n && n.children) ? n.children : [];
const deep = (n, p) => { const o = []; const w = (x) => { if (p(x)) o.push(x); for (const c of kids(x)) w(c); }; w(n); return o; };
const byName = (root, name) => deep(root, (n) => n.name === name);
// Throwing on an ambiguous lookup is the point: a silent [0] would have wired the wrong
// icon on any screen whose header carries both a back caret and a close X.
const one = (root, name) => {
  const m = byName(root, name);
  if (m.length !== 1) throw new Error(`expected exactly 1 "${name}" under ${root.name}, got ${m.length}`);
  return m[0];
};
const childNamed = (root, name) => kids(root).filter((c) => c.name === name);

const F = { d1: '67:130', calc: '69:113', dish: '70:106', disc: '71:107', det: '72:98',
            nut: '72:189', ins: '144:209', add: '73:100', diary: '73:212', search: '81:209', logged: '73:252' };

const EASE = { type: 'EASE_OUT' };
const nav = (dest, transition) => ({ type: 'NODE', destinationId: dest, navigation: 'NAVIGATE', transition: transition || null });
const BACK = { type: 'BACK' };
const click = (...actions) => ({ trigger: { type: 'ON_CLICK' }, actions });
const after = (secs, ...actions) => ({ trigger: { type: 'AFTER_TIMEOUT', timeout: secs }, actions });
// iOS forward push: the incoming frame enters from the right, so the motion runs LEFT.
const PUSH = { type: 'PUSH', direction: 'LEFT', matchLayers: false, easing: EASE, duration: 0.3 };
const DISS = (d) => ({ type: 'DISSOLVE', easing: EASE, duration: d });

// Two payload shapes the API rejects, both found by probing rather than by reading docs:
//   { action: {...} }              -> "update the `actions` field instead"
//   trigger ON_DRAG + BACK action  -> "Reaction at index 0 was invalid" (ON_DRAG rejects
//                                     a BACK action AND a NODE navigate; drag-to-dismiss
//                                     on the add sheet is not expressible, so the scrim
//                                     tap carries dismissal alone)

const jobs = [];
const add = (node, reactions, label) => jobs.push([node, reactions, label]);

// The tab bar is the one control every root screen shares, so it is wired identically
// everywhere. `active` names the item already lit, which stays inert.
const wireTabs = (root, active, tag) => {
  const tb = one(root, 'tab-bar');
  const dest = { home: F.d1, discover: F.disc, diary: F.diary };
  const item = { home: 'home-item', discover: 'discover-item', diary: 'diary-item' };
  for (const k of ['home', 'discover', 'diary']) {
    if (k === active) continue;
    add(one(tb, item[k]), [click(nav(dest[k]))], `${tag}/${k}`);
  }
  add(one(tb, 'log-fab'), [click(nav(F.add, DISS(0.2)))], `${tag}/add`);
};

// Ingredients / Nutrition / Instructions are three views of one screen: each variant
// lights one tab and links the other two.
const wireSectionTabs = (root, self, tag) => {
  const row = one(one(root, 'section-tabs'), 'ingredients-row');
  const stacks = childNamed(row, 'stack');
  if (stacks.length !== 3) throw new Error(`${tag}: expected 3 section-tab stacks, got ${stacks.length}`);
  const dests = [F.det, F.nut, F.ins];
  stacks.forEach((s, i) => { if (i !== self) add(s, [click(nav(dests[i], DISS(0.12)))], `${tag}/tab${i}`); });
};

const f1 = await get(F.d1);
wireTabs(f1, 'home', 'f1');
add(one(f1, 'Button'), [click(nav(F.calc, PUSH))], 'f1/log-a-meal');

// Back vs close are different actions, not two routes to the same place. The caret is
// BACK because screen 2 is reachable from the dashboard, the add sheet and the search
// state; only BACK returns to whichever one you came from. The X dismisses to root.
const f2 = await get(F.calc);
const f2icons = childNamed(one(f2, 'add-food-row'), 'icon');
add(f2icons[0], [click(BACK)], 'f2/back');
add(f2icons[1], [click(nav(F.d1, DISS(0.2)))], 'f2/close');
add(one(one(f2, 'product-row'), 'dish'), [click(nav(F.dish))], 'f2/dish-tab');
add(one(f2, 'Button'), [click(nav(F.logged, DISS(0.25)))], 'f2/add-to-diary');

const f3 = await get(F.dish);
const f3icons = childNamed(one(f3, 'create-a-dish-row'), 'icon');
add(f3icons[0], [click(BACK)], 'f3/back');
add(f3icons[1], [click(nav(F.d1, DISS(0.2)))], 'f3/close');
add(one(one(f3, 'product-row'), 'product'), [click(nav(F.calc))], 'f3/product-tab');
add(one(f3, 'Button'), [click(nav(F.logged, DISS(0.25)))], 'f3/save-dish');

const f4 = await get(F.disc);
wireTabs(f4, 'discover', 'f4');
// All four cards resolve to the one detail screen that exists. Wiring only the salmon
// bowl would be literally truer and read as three broken cards.
byName(f4, 'Recipe Card').forEach((c, i) => add(c, [click(nav(F.det, PUSH))], `f4/card${i}`));

const f5 = await get(F.det);
add(one(f5, 'caret-left-target'), [click(BACK)], 'f5/back');
add(one(f5, 'Button'), [click(nav(F.logged, DISS(0.25)))], 'f5/log-serving');
wireSectionTabs(f5, 0, 'f5');

for (const [id, self, tag] of [[F.nut, 1, 'f5b'], [F.ins, 2, 'f5c']]) {
  const f = await get(id);
  add(childNamed(one(f, 'lemon-herb-salmon-bowl-row'), 'icon')[0], [click(BACK)], `${tag}/back`);
  add(one(f, 'Button'), [click(nav(F.logged, DISS(0.25)))], `${tag}/log-serving`);
  wireSectionTabs(f, self, tag);
}

// The scrim sits above the dashboard and below the sheet, so it absorbs every tap outside
// the sheet — exactly the dismiss affordance a modal needs, with no extra layer. Taps on
// the sheet's own background hit nothing, because the scrim is its sibling, not its
// ancestor, and Figma only walks up the parent chain.
add(await get('73:177'), [click(BACK)], 'f6/scrim');
add(await get('73:182'), [click(nav(F.search, PUSH))], 'f6/add-a-product');
add(await get('73:192'), [click(nav(F.calc, PUSH))], 'f6/scan-a-barcode');
add(await get('73:202'), [click(nav(F.dish, PUSH))], 'f6/create-a-dish');

const f7 = await get(F.diary);
add(one(f7, 'Button'), [click(nav(F.add, DISS(0.2)))], 'f7/log-first-meal');

// A loading state has to resolve on its own, or it reads as a dead screen.
const f7b = await get(F.search);
add(childNamed(one(f7b, 'add-food-row'), 'icon')[0], [click(BACK)], 'f7b/back');
add(f7b, [after(1.2, nav(F.calc, DISS(0.25)))], 'f7b/resolve');

// The toast is a confirmation, not a destination: it dismisses itself. Undo short-cuts it.
const f8 = await get(F.logged);
wireTabs(f8, null, 'f8');
add(one(f8, 'Button'), [click(nav(F.calc, PUSH))], 'f8/log-a-meal');
add(await get('73:336'), [click(nav(F.d1, DISS(0.2)))], 'f8/undo');
add(f8, [after(3, nav(F.d1, DISS(0.3)))], 'f8/toast-dismiss');

// Every lookup resolves before anything is written, so a bad name aborts the pass whole
// rather than leaving the file half-wired.
for (const [node, reactions] of jobs) await node.setReactionsAsync(reactions);

page.flowStartingPoints = [
  { nodeId: F.d1,   name: 'US1 · Log a meal' },
  { nodeId: F.disc, name: 'US2 · Find a recipe that fits' }
];

// --- screen 7 was the one root tab destination with no tab bar ------------------------
// screens-spec.md names 2, 3, 5 and 6 as the only screens that omit it, so this was an
// omission rather than a decision — and it dead-ended the prototype on Diary.
const indicator = one(f7, 'home-indicator');
const at = f7.children.indexOf(indicator);          // chrome goes under the home indicator

// Context=Nav is the ramp the other two tab-bar screens use: transparent at y=731, full
// canvas alpha by y=756, the bar's top edge, per composition rule 5. Reusing it verbatim
// is what preserves the measured 5.63:1 for an 11pt label behind 65% glass — at the bar's
// own y the base is identical canvas colour whether or not content scrolls beneath it.
const fade = (await get('176:405')).createInstance();
f7.insertChild(at, fade);
fade.x = 0; fade.y = 731; fade.name = 'bottom-fade';

// glass-plate is a plain frame, not a component. Clone screen 4's rather than rebuild it,
// so its two-layer shadow — whose alphas are hand-boosted to survive node opacity 0.65 —
// travels intact instead of being reconstructed from the wrong numbers.
const plate = (await get('71:195')).clone();
f7.insertChild(at + 1, plate);
plate.x = 20; plate.y = 756;

const bar = (await get('173:386')).createInstance();  // Tab Bar, Active=Diary
f7.insertChild(at + 2, bar);
bar.x = 20; bar.y = 756; bar.name = 'tab-bar';

await one(bar, 'home-item').setReactionsAsync([click(nav(F.d1))]);
await one(bar, 'discover-item').setReactionsAsync([click(nav(F.disc))]);
await one(bar, 'log-fab').setReactionsAsync([click(nav(F.add, DISS(0.2)))]);

// Found while auditing chrome: the Home Indicator component (249:194) was named
// "Search Input/Home Indicator". It is a standalone component parented to the page, not a
// variant — the "/" is Figma's assets-panel folder separator, so it had been filing itself
// under a phantom "Search Input" group since the rebuild.
(await get('249:194')).name = 'Home Indicator';

return { ok: true };

// --- NOT APPLIED: scrolling -----------------------------------------------------------
// The dashboard's today-stack is 1109pt in an 852pt frame, so meal cards 2 and 3 sit below
// the fold, and README.md already claims content "scrolls beneath" the glass bar. Setting
// overflowDirection = 'VERTICAL' is one line; pinning the chrome is not possible here:
//
//   * `scrollBehavior` does not exist in this Plugin API build — it throws
//     "no such property 'scrollBehavior'" on both FRAME and INSTANCE.
//   * The fallback, `numberOfFixedChildren`, splits children into one scrolling and one
//     fixed section, and per the API docs "fixed children are always on top of scrolling
//     children". The aurora backdrop must be fixed (or 316pt of dead canvas trails the
//     blobs — the exact defect fixed in an earlier round) AND behind the content. That
//     frame cannot be expressed.
//
// So overflowDirection was set, tested and reverted to NONE on both 182:533 and 71:107.
// Scrolling belongs to the coded prototype, where it is free.
