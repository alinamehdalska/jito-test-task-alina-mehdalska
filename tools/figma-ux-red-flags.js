// Plate — close the Figma-side red flags from the 2026-09-03 UX audit.
// APPLIED 2026-09-04 against fileKey lzCgTFcfrlE8qGqYbBTh7l, as eleven use_figma calls in
// the order below. Each block is one call; each was screenshot-read before the next ran.
//
// WHAT THE AUDIT FOUND, AND WHAT THIS PASS CHANGES ON THE DESIGN SIDE
//   critical  entries could not be edited or deleted        → new frame 9 · Edit entry
//   high      over-budget hero read "-390 kcal left"        → new frame 1b, amber arc, "390 over"
//   high      Discover opened empty once remaining was low  → new frame 4b · planning tomorrow
//   high      meal and day were inferred, never chosen      → "Breakfast · Today" pull-down on
//                                                              2, 3, 7b (header) and 5/5b/5c (row)
//   medium    5b/5c dropped the fit context with the hero   → per-serving summary strip
//   medium    calculator seams (100 g default, 59/142/123)  → 1 pot · 170 g first, 73 → 124 kcal
//   low       search dead-ended on no results               → new frame 7c with two recoveries
//   low       three verbs, ambiguous "Tight fit"            → "Log …" everywhere, "Fits · 130 to spare"
//   low       text.tertiary under 20pt (3.6–3.9:1)          → 149 text nodes rebound to text.secondary
//
// THREE TRAPS THIS PASS ADDED TO THE LIST IN CLAUDE.md
//   · figma.createAutoLayout() frames are born with a WHITE fill. Every layout container
//     built here (title-stack, log-to-row, summary-row, the sheet blocks) rendered a white
//     plate behind its content until fills were cleared — visible only in the screenshot.
//   · Cloning a frame that is a flow starting point clones the starting point too. Setting
//     page.flowStartingPoints without de-duplicating by nodeId throws "duplicate input
//     nodeIds", and because scripts are atomic the reactions set earlier in the same call
//     were rolled back with it.
//   · Swapping fontName between two text nodes detaches their text style. Re-apply the
//     style afterwards, or the frame fails the file's own "0 unstyled" audit.
//
// The scripts below are the final working versions. Shared helpers first.

const page = await figma.getNodeByIdAsync('1:5');           // 04 · Screens
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);

// Seed every bound paint with the variable's real colour (agreement 1). The alias is walked
// with EACH variable's own collection — using the semantic collection's default mode on a
// primitive returns undefined and the script dies on `.r`.
const resolveColor = async (id) => {
  let v = await figma.variables.getVariableByIdAsync(id);
  for (let i = 0; i < 6; i++) {
    const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    const val = v.valuesByMode[col.defaultModeId];
    if (val && val.type === 'VARIABLE_ALIAS') { v = await figma.variables.getVariableByIdAsync(val.id); continue; }
    return { r: val.r, g: val.g, b: val.b };
  }
  throw new Error('alias too deep');
};
const boundPaint = async (id) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: await resolveColor(id) }, 'color', await figma.variables.getVariableByIdAsync(id));
const setText = async (t, chars) => { await figma.loadFontAsync(t.fontName); t.characters = chars; return t.id; };
const bindNum = async (node, prop, id) => node.setBoundVariable(prop, await figma.variables.getVariableByIdAsync(id));
const mainId = (n) => n.type === 'INSTANCE' && n.mainComponent ? n.mainComponent.id : null;
const mainSet = (n) => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent ? n.mainComponent.parent.id : null;
const V = {
  surface: 'VariableID:2:4', raised: 'VariableID:2:5', textSecondary: 'VariableID:2:9', textTertiary: 'VariableID:2:10',
  accentStrong: 'VariableID:2:16', warning: 'VariableID:2:33', canvasEnd: 'VariableID:33:13',
  space0: 'VariableID:1:66', space2: 'VariableID:1:67', space4: 'VariableID:1:68', space8: 'VariableID:1:69',
  space12: 'VariableID:1:70', space16: 'VariableID:1:71', space20: 'VariableID:1:72',
  radius16: 'VariableID:1:81', radiusFull: 'VariableID:1:85'
};
const STYLE = { footnote: 'S:e788c8562df25322e4b9f9b195b97a817db61c20,', cap1: 'S:bd81069b6dc767c9d00c1bb3db2e10891f217cd0,',
                cap1Emph: 'S:347e0a550153aa858f67834735224035baae242f,', shadowXs: 'S:0749ae2b9c2921baf6e1309b7064191b12eac4b8,' };
const ICONS = '187:179', BUTTONS = '4:50', PILLS = '7:24', REASON_POSITIVE = '65:53', MEAL_ENTRY = '8:32', DASHBOARD = '182:533';

// ---------------------------------------------------------------------------------------
// 1 · 1b · Dashboard — over budget (x 5060)
// The Dashboard component is instanced and detached so a dinner group can be appended;
// daily-budget, Hero Gauge and Macro Stat were left as instances — text, arcData and
// sublayer fills override cleanly. The sublayer WIDTH override in this block did not (see
// block 10: it reported success and reverted), which is why the bars are detached there.
// The amber arc is a sibling drawn over the gauge rather than a child of it (instances take
// no children), inset 4pt inside the 13.6pt sweep, 5pt thick, swept BACK from the goal end:
// the excess sits beyond the goal, so it starts where the goal ends.
{
  const f1 = await get('67:130');
  const f = figma.createFrame(); f.name = '1b · Dashboard — over budget';
  f.resize(393, 852); f.x = 5060; f.y = 0; f.clipsContent = true; f.fills = f1.fills; page.appendChild(f);
  const inst = (await get(DASHBOARD)).createInstance(); f.appendChild(inst); inst.x = 0; inst.y = 0;
  const d = inst.detachInstance(); d.name = 'dashboard';
  const budget = d.findOne(n => mainId(n) === '8:2');
  const gauge = budget.findOne(n => mainId(n) === '35:23');
  await setText(gauge.findOne(n => n.type === 'TEXT' && n.characters === '610'), '390');
  await setText(gauge.findOne(n => n.type === 'TEXT' && n.characters === 'kcal left'), 'over today’s goal');
  await setText(gauge.findOne(n => n.type === 'TEXT' && n.characters === '1,240'), '2,240');
  const indicator = gauge.findOne(n => n.type === 'ELLIPSE' && n.name === 'indicator');
  indicator.arcData = { startingAngle: Math.PI, endingAngle: 2 * Math.PI, innerRadius: indicator.arcData.innerRadius };
  const gAbs = gauge.absoluteTransform, dAbs = d.absoluteTransform;
  const gx = gAbs[0][2] - dAbs[0][2], gy = gAbs[1][2] - dAbs[1][2];
  const R = 313 / 2, outer = R - 13.6 - 4, thick = 5, sweep = (390 / 1850) * Math.PI;
  const over = figma.createEllipse(); over.name = 'over-arc'; over.resize(outer * 2, outer * 2);
  over.arcData = { startingAngle: 2 * Math.PI - sweep, endingAngle: 2 * Math.PI, innerRadius: (outer - thick) / outer };
  over.fills = [await boundPaint(V.warning)];
  d.appendChild(over); over.x = gx + (R - outer); over.y = gy + (R - outer);
  const todayStack = d.findOne(n => n.name === 'today-stack');
  d.insertChild(d.children.indexOf(todayStack) + 1, over);              // under the fade and tab bar
  const macroVals = { carbs: '236 / 220 g', protein: '136 / 120 g', fat: '81 / 65 g' };
  for (const ms of budget.findAll(n => mainSet(n) === '65:52')) {
    const key = ms.mainComponent.name.replace('macro=', '');
    await setText(ms.findOne(n => n.type === 'TEXT' && n.characters.includes('/')), macroVals[key]);
    const fill = ms.findOne(n => n.type === 'RECTANGLE' && n.name === 'fill');
    fill.resize(313, fill.height); fill.fills = [await boundPaint(V.warning)];   // completes in amber, never red
  }
  await setText(d.findOne(n => n.type === 'TEXT' && n.characters === '1,240 kcal'), '2,240 kcal');
  // 1,240 + 480 + 520 = 2,240; P 78+34+24 = 136, C 142+42+52 = 236, F 41+18+22 = 81 — the numbers reconcile
  const snack = d.findOne(n => n.name === 'snack-stack');
  const dinner = snack.clone(); snack.parent.appendChild(dinner); dinner.name = 'dinner-stack';
  await setText(dinner.findOne(n => n.type === 'TEXT' && n.characters === 'SNACK'), 'DINNER');
  await setText(dinner.findOne(n => n.type === 'TEXT' && n.characters === '380 kcal'), '1,000 kcal');
  const row1 = dinner.findOne(n => mainId(n) === MEAL_ENTRY);
  const row2 = row1.clone(); row1.parent.appendChild(row2);
  const fillRow = async (row, name, detail, kcal) => {
    const ts = row.findAll(n => n.type === 'TEXT');
    await setText(ts.find(t => !t.characters.includes('·') && t.characters !== 'kcal' && !/^\d+$/.test(t.characters)), name);
    await setText(ts.find(t => t.characters.includes('·')), detail);
    await setText(ts.find(t => /^\d+$/.test(t.characters)), kcal);
  };
  await fillRow(row1, 'Lemon Herb Salmon Bowl', '19:20 · P 34 · C 42 · F 18', '480');
  await fillRow(row2, 'Chickpea Shakshuka', '19:45 · P 24 · C 52 · F 22', '520');
}

// ---------------------------------------------------------------------------------------
// 2 · 9 · Edit entry (x 5520) — a clone of frame 6 with the sheet rebuilt. Rows inside the
// white sheet sit on bg.raised (composition rule 6: nested surfaces use raised, not a
// second shadow). Buttons are the Button set's own primary and destructive lg variants —
// the first live use of feedback.danger in the file.
{
  const f9 = (await get('73:100')).clone(); f9.name = '9 · Edit entry'; f9.x = 5520; f9.y = 0; page.appendChild(f9);
  const sheet = f9.children.find(c => c.name === 'add-sheet'); sheet.name = 'edit-sheet';
  await setText(sheet.findOne(n => n.type === 'TEXT' && n.characters === 'Add to diary'), 'Edit entry');
  for (const row of sheet.children.filter(c => /-row$/.test(c.name) && c.name !== 'row')) row.remove();
  sheet.itemSpacing = 16; await bindNum(sheet, 'itemSpacing', V.space16);
  const labelSrc = await get('69:163');                                  // SERVING SIZE caption on frame 2
  const label = async (chars, parent) => { const t = labelSrc.clone(); parent.appendChild(t); await setText(t, chars); t.layoutSizingHorizontal = 'FILL'; return t; };
  const block = (name) => { const b = figma.createAutoLayout('VERTICAL', { name, itemSpacing: 8 }); sheet.appendChild(b); b.layoutSizingHorizontal = 'FILL'; b.fills = []; return b; };
  const card = figma.createAutoLayout('VERTICAL', { name: 'entry-card', paddingLeft: 12, paddingRight: 12, cornerRadius: 16 });
  sheet.appendChild(card); card.layoutSizingHorizontal = 'FILL'; card.fills = [await boundPaint(V.raised)];
  for (const p of ['paddingLeft', 'paddingRight']) await bindNum(card, p, V.space12);
  for (const p of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) await bindNum(card, p, V.radius16);
  const entry = (await get(MEAL_ENTRY)).createInstance(); card.appendChild(entry);
  const ets = entry.findAll(n => n.type === 'TEXT');
  await setText(ets.find(t => t.characters.includes('·')), '08:30 · P 22 · C 38 · F 8');
  entry.findOne(n => n.type === 'RECTANGLE' && n.name === 'thumb').fills =
    (await get('I182:1030;182:516')).findOne(n => n.type === 'RECTANGLE' && n.name === 'thumb').fills;   // the breakfast photo
  const bAmount = block('amount-block'); await label('AMOUNT', bAmount);
  const amount = (await get('69:173')).clone(); bAmount.appendChild(amount); amount.layoutSizingHorizontal = 'FILL';
  amount.fills = [await boundPaint(V.raised)];
  await setText(amount.findOne(n => n.type === 'TEXT' && n.characters === '170 g'), '250 g');
  const bMeal = block('meal-block'); await label('MEAL', bMeal);
  const pills = figma.createAutoLayout('HORIZONTAL', { name: 'meal-pills', itemSpacing: 8 });
  bMeal.appendChild(pills); pills.fills = []; pills.layoutSizingHorizontal = 'FILL'; pills.layoutWrap = 'WRAP'; pills.counterAxisSpacing = 8;
  await bindNum(pills, 'itemSpacing', V.space8); await bindNum(pills, 'counterAxisSpacing', V.space8);
  const pillSet = await get(PILLS);
  const sel = pillSet.children.find(c => c.name === 'state=selected, count=false');
  const def = pillSet.children.find(c => c.name === 'state=default, count=false');
  for (const [name, comp] of [['Breakfast', sel], ['Lunch', def], ['Snack', def], ['Dinner', def]]) {
    const p = comp.createInstance(); pills.appendChild(p); p.name = name.toLowerCase();
    await setText(p.findOne(n => n.type === 'TEXT'), name);
  }
  const bTime = block('time-block'); await label('TIME', bTime);
  const time = (await get('69:173')).clone(); bTime.appendChild(time); time.layoutSizingHorizontal = 'FILL'; time.name = 'time-row';
  time.fills = [await boundPaint(V.raised)];
  await setText(time.findOne(n => n.type === 'TEXT' && n.characters === 'Amount'), 'Time');
  const stepper = time.findOne(n => n.name === 'value');
  const tv = stepper.findOne(n => n.type === 'TEXT').clone(); time.appendChild(tv); await setText(tv, '08:30'); tv.textAlignHorizontal = 'RIGHT';
  const caret = (await get(ICONS)).children.find(c => c.name === 'Icon=caret-right').createInstance();
  time.appendChild(caret); caret.resize(18, 18);
  for (const g of caret.findAll(n => n.type === 'VECTOR')) g.fills = [await boundPaint(V.textSecondary)];
  stepper.remove();
  const btnSet = await get(BUTTONS);
  const mk = async (variant, chars) => { const b = btnSet.children.find(c => c.name === `variant=${variant}, size=lg, state=default`).createInstance(); sheet.appendChild(b); b.layoutSizingHorizontal = 'FILL'; await setText(b.findOne(n => n.type === 'TEXT'), chars); return b; };
  await mk('primary', 'Save changes'); await mk('destructive', 'Delete entry');
  sheet.primaryAxisSizingMode = 'AUTO'; sheet.y = 852 - sheet.height;   // hug, then bottom-anchor: 645 tall, y 207
}

// ---------------------------------------------------------------------------------------
// 3 · Frame 4 reasons carry the margin; 4b · planning tomorrow (x 5980)
// The Reason Chip is FIXED 120 wide; a chip is widened to its text when the copy needs it.
{
  const chipOf = (card) => card.findOne(n => mainSet(n) === '65:59');
  const setChip = async (card, chars) => {
    const chip = chipOf(card); const t = chip.findOne(n => n.type === 'TEXT'); await setText(t, chars);
    const need = 8 + 5 + 4 + t.width + 8; if (need > chip.width) chip.resize(Math.ceil(need), chip.height);
  };
  await setChip(await get('71:150'), 'Fits · 130 to spare');       // salmon 480 of 610
  await setChip(await get('71:161'), 'Fits · 215 to spare');       // miso 395
  await setChip(await get('71:173'), 'Just fits · 90 to spare');   // shakshuka 520 — over 80% of remaining
  const f4b = (await get('71:107')).clone(); f4b.name = '4b · Recipe Discovery — planning tomorrow'; f4b.x = 5980; f4b.y = 0; page.appendChild(f4b);
  const t = (chars) => f4b.findOne(n => n.type === 'TEXT' && n.characters === chars);
  await setText(t('610 kcal left'), '130 kcal left');
  await setText(t('Recommended for you'), 'Planning tomorrow');
  await setText(t('Matched against the calories and macros you have left.'), 'Nothing fits tonight’s 130 kcal · ranked for tomorrow.');
  f4b.findOne(n => n.type === 'INSTANCE' && n.name === 'fits-my-calories').setProperties({ state: 'default' });   // fit is a sort here, not a filter
  const isCard = (n) => mainSet(n) === '37:58';
  const [row1, row2] = f4b.findAll(n => n.type === 'FRAME' && n.children.length === 2 && n.children.every(isCard));
  const byTitle = (s) => f4b.findOne(n => isCard(n) && n.findOne(x => x.type === 'TEXT' && x.characters.includes(s)));
  const order = [byTitle('Miso'), byTitle('Tuna'), byTitle('Salmon'), byTitle('Shakshuka')];   // lightest first: 395 · 445 · 480 · 520
  row1.appendChild(order[0]); row1.appendChild(order[1]); row2.appendChild(order[2]); row2.appendChild(order[3]);
  for (const c of order) { c.setProperties({ match: 'fits' }); await setChip(c, 'Fits tomorrow'); }
}

// ---------------------------------------------------------------------------------------
// 4 · The meal and day, chosen with a smart default.
// Form screens (2, 3, 7b) carry it as a pull-down subtitle under the header title — the
// iOS 16 navigation-title-menu pattern, zero layout cost on frames that are already full.
// Recipe screens (5, 5b, 5c) have no title bar, so they carry a "Log to" row above the
// sticky CTA; the fade moves up 52 and a solid extension covers 800–852 beneath it.
const subtitle = async (headerId, titleId, contentId) => {
  const header = await get(headerId), title = await get(titleId);
  const stack = figma.createAutoLayout('VERTICAL', { name: 'title-stack', itemSpacing: 2, counterAxisAlignItems: 'CENTER' });
  header.insertChild(header.children.indexOf(title), stack); stack.appendChild(title); stack.fills = [];
  await bindNum(stack, 'itemSpacing', V.space2);
  const sub = figma.createAutoLayout('HORIZONTAL', { name: 'log-to-row', itemSpacing: 4, counterAxisAlignItems: 'CENTER' });
  stack.appendChild(sub); sub.fills = []; await bindNum(sub, 'itemSpacing', V.space4);
  const st = title.clone(); sub.appendChild(st); st.name = 'log-to';
  await figma.loadFontAsync({ family: 'SF Pro', style: 'Regular' });
  await setText(st, 'Breakfast · Today'); await st.setTextStyleIdAsync(STYLE.footnote);
  st.fills = [await boundPaint(V.accentStrong)];                       // coral/700 — 5.61:1 on the canvas
  const caret = (await get(ICONS)).children.find(c => c.name === 'Icon=caret-right').createInstance();
  sub.appendChild(caret); caret.name = 'caret-down'; caret.resize(14, 14); caret.rotation = -90;
  for (const g of caret.findAll(n => n.type === 'VECTOR')) g.fills = [await boundPaint(V.accentStrong)];
  header.resize(393, 60);                                              // the row is FIXED 44; items stay centred
  const content = await get(contentId); content.y = 119;
  if (content.layoutMode !== 'NONE') { content.paddingTop = 0; await bindNum(content, 'paddingTop', V.space0); }   // reclaims 8 of the 16
};
await subtitle('69:123', '69:126', '69:129');
await subtitle('70:116', '70:119', '70:122');
await subtitle('81:216', '81:219', '81:221');

const logToRow = async (frameId, fadeId) => {
  const f = await get(frameId);
  const fade = await get(fadeId); fade.y = 640;                         // solid at 700, above the new row
  const ext = figma.createRectangle(); ext.name = 'fade-extension'; ext.resize(393, 52);
  ext.fills = [await boundPaint(V.canvasEnd)];
  f.appendChild(ext); f.insertChild(f.children.indexOf(fade) + 1, ext); ext.x = 0; ext.y = 800;
  const row = figma.createAutoLayout('HORIZONTAL', { name: 'log-to-row', itemSpacing: 8, paddingLeft: 20, paddingRight: 20, counterAxisAlignItems: 'CENTER' });
  f.appendChild(row); f.insertChild(f.children.indexOf(ext) + 1, row);
  row.fills = []; row.resize(393, 44); row.x = 0; row.y = 704;         // 44 row supplies the target for a 36 chip
  await bindNum(row, 'itemSpacing', V.space8); await bindNum(row, 'paddingLeft', V.space20); await bindNum(row, 'paddingRight', V.space20);
  const cap = (await get('72:121')).clone(); row.appendChild(cap); cap.name = 'log-to'; await setText(cap, 'Log to');
  const chip = figma.createAutoLayout('HORIZONTAL', { name: 'meal-picker', itemSpacing: 4, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, counterAxisAlignItems: 'CENTER' });
  row.appendChild(chip); chip.fills = [await boundPaint(V.surface)]; await chip.setEffectStyleIdAsync(STYLE.shadowXs);
  for (const p of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) await bindNum(chip, p, V.radiusFull);
  await bindNum(chip, 'itemSpacing', V.space4); await bindNum(chip, 'paddingLeft', V.space16); await bindNum(chip, 'paddingRight', V.space16);
  await bindNum(chip, 'paddingTop', V.space8); await bindNum(chip, 'paddingBottom', V.space8);
  const t = (await get('72:120')).clone(); chip.appendChild(t); t.name = 'meal'; await setText(t, 'Breakfast · Today');
  const caret = (await get(ICONS)).children.find(c => c.name === 'Icon=caret-right').createInstance();
  chip.appendChild(caret); caret.name = 'caret-down'; caret.resize(14, 14); caret.rotation = -90;
  for (const g of caret.findAll(n => n.type === 'VECTOR')) g.fills = [await boundPaint(V.textSecondary)];
};
await logToRow('72:98', '176:415'); await logToRow('72:189', '176:417'); await logToRow('144:209', '176:423');
await setText(await get('72:128'), '130 kcal to spare after this serving.');   // numbers lead sentences

// 5b / 5c keep the fit context when the hero is gone: kcal per serving + the fit chip, above the tabs
const summary = async (stackId) => {
  const stack = await get(stackId);
  const row = figma.createAutoLayout('HORIZONTAL', { name: 'summary-row', primaryAxisAlignItems: 'SPACE_BETWEEN', counterAxisAlignItems: 'CENTER' });
  stack.insertChild(0, row); row.fills = []; row.layoutSizingHorizontal = 'FILL';
  const left = figma.createAutoLayout('HORIZONTAL', { name: 'per-serving-row', itemSpacing: 4, counterAxisAlignItems: 'BASELINE' });
  row.appendChild(left); left.fills = []; await bindNum(left, 'itemSpacing', V.space4);
  left.appendChild((await get('72:120')).clone()); left.appendChild((await get('72:121')).clone());
  const rc = (await get(REASON_POSITIVE)).createInstance(); row.appendChild(rc); rc.name = 'reason-chip';
  const ct = rc.findOne(n => n.type === 'TEXT'); await setText(ct, 'Fits · 130 to spare');
  const need = 8 + 5 + 4 + ct.width + 8; if (need > rc.width) rc.resize(Math.ceil(need), rc.height);
  stack.paddingTop = 8; await bindNum(stack, 'paddingTop', V.space8);
  if (stack.primaryAxisSizingMode === 'FIXED') stack.primaryAxisSizingMode = 'AUTO';
};
await summary('72:194'); await summary('144:214');

// ---------------------------------------------------------------------------------------
// 5 · Frame 2 — the label serving first, and numbers that reconcile.
// Fage 2% is 73 kcal per 100 g; the pot is 170 g; 6.1 / 17.0 / 3.4 g give 24 + 68 + 31 = 123
// ≈ 124. The frame had said 59, 142 and 123 — three numbers that disagreed with each other.
{
  await setText(await get('69:159'), 'Fage · 73 kcal per 100 g');
  const c100 = await get('69:165'), custom = await get('69:171'), t100 = await get('69:166'), tCustom = await get('69:172');
  const swap = (a, b) => { const fa = a.fills, fb = b.fills; a.fills = fb; b.fills = fa; };
  swap(c100, custom); swap(t100, tCustom);
  const fa = t100.fontName, fb = tCustom.fontName; await figma.loadFontAsync(fa); await figma.loadFontAsync(fb); t100.fontName = fb; tCustom.fontName = fa;
  await t100.setTextStyleIdAsync(STYLE.cap1Emph); await tCustom.setTextStyleIdAsync(STYLE.cap1);   // the font swap detached both
  await setText(t100, '1 pot · 170 g'); await setText(await get('69:168'), '100 g'); await setText(await get('69:170'), '200 g');
  c100.name = 'label-serving';
  await setText(await get('69:218'), 'for 170 g · 1 pot'); await setText(await get('69:219'), '124 kcal');
  for (const [id, k] of [['69:193', 24], ['69:203', 68], ['69:213', 31]]) { const r = await get(id); r.resize(Math.round(321 * k / 124), r.height); }
  await setText((await get('69:220')).findOne(n => n.type === 'TEXT'), 'Log 124 kcal to Diary');
  await setText((await get('70:228')).findOne(n => n.type === 'TEXT'), 'Log 244 kcal to Diary');   // frame 3: one verb for the diary
}

// ---------------------------------------------------------------------------------------
// 6 · 7c · Search — no results (x 6440): a clone of 7b whose skeleton becomes the empty
// state from frame 7, with the two recoveries every benchmark offers.
{
  const f7c = (await get('81:209')).clone(); f7c.name = '7c · Search — no results'; f7c.x = 6440; f7c.y = 0; page.appendChild(f7c);
  await setText(f7c.findOne(n => n.type === 'TEXT' && n.characters === 'chicken bre'), 'kefir');
  await setText(f7c.findOne(n => n.type === 'TEXT' && n.characters === 'SEARCHING…'), '0 RESULTS');
  const content = f7c.findOne(n => n.name === 'chicken-bre-stack'); content.name = 'kefir-stack';
  content.findOne(n => n.name === 'stack' && n.children.length === 3).remove();
  const empty = (await get('73:226')).clone(); content.appendChild(empty); empty.name = 'no-results-stack'; empty.layoutSizingHorizontal = 'FILL';
  empty.findOne(n => mainSet(n) === ICONS).setProperties({ Icon: 'magnifying-glass' });
  await setText(empty.findOne(n => n.type === 'TEXT' && n.characters === 'Nothing logged yet'), 'Nothing matches “kefir”');
  await setText(empty.findOne(n => n.type === 'TEXT' && n.characters.startsWith('Log a meal')), 'Try a shorter word, or add it yourself.');
  const btn = empty.findOne(n => mainSet(n) === BUTTONS);
  await setText(btn.findOne(n => n.type === 'TEXT'), 'Create a food');
  const scan = (await get(BUTTONS)).children.find(c => c.name === 'variant=tertiary, size=md, state=default').createInstance();
  btn.parent.appendChild(scan); scan.name = 'scan-a-barcode'; await setText(scan.findOne(n => n.type === 'TEXT'), 'Scan a barcode');
  await f7c.setReactionsAsync([]);                                      // the clone carried 7b's 1.2 s auto-resolve
}

// ---------------------------------------------------------------------------------------
// 7 · text.tertiary is large-text only — now enforced rather than recorded.
// 122 nodes on 04 · Screens and 27 inside components on 02 (run as a second call there,
// skipping the swatch specimens) moved from text/tertiary to text/secondary wherever the
// size is under 20pt: gauge captions, meal detail lines, section labels, placeholders,
// inactive section tabs, unit suffixes. Nothing under 20pt is left on tertiary.
{
  const sec = await figma.variables.getVariableByIdAsync(V.textSecondary);
  const seed = await resolveColor(V.textSecondary);
  for (const t of page.findAllWithCriteria({ types: ['TEXT'] })) {
    const b = t.boundVariables && t.boundVariables.fills;
    if (!b || !b.length || b[0].id !== V.textTertiary) continue;
    if (typeof t.fontSize === 'number' && t.fontSize >= 20) continue;
    t.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: seed }, 'color', sec)];
  }
}

// ---------------------------------------------------------------------------------------
// 8 · Prototype: 14 reactions and three state starting points. Frame 9 is reached by
// tapping the breakfast row on the dashboard; Save, Delete and the scrim all go BACK.
// 4b inherited frame 4's seven reactions with the clone — and its starting point, hence
// the de-duplication by nodeId.
{
  const F = { d1: '67:130', calc: '69:113', disc: '71:107', diary: '73:212', add: '73:100', over: '295:987', edit: '297:1106', plan: '297:2822', none: '298:1416' };
  const EASE = { type: 'EASE_OUT' };
  const nav = (dest, transition) => ({ type: 'NODE', destinationId: dest, navigation: 'NAVIGATE', transition: transition || null });
  const BACK = { type: 'BACK' };
  const click = (...actions) => ({ trigger: { type: 'ON_CLICK' }, actions });
  const PUSH = { type: 'PUSH', direction: 'LEFT', matchLayers: false, easing: EASE, duration: 0.3 };
  const DISS = (d) => ({ type: 'DISSOLVE', easing: EASE, duration: d });
  const one = (root, pred, label) => { const m = root.findAll(pred); if (m.length !== 1) throw new Error(`expected 1 ${label}, got ${m.length}`); return m[0]; };
  const isBtn = (n) => mainSet(n) === BUTTONS;
  const jobs = [];
  const f1b = await get(F.over);
  const tb = one(f1b, n => n.name === 'tab-bar' && n.type === 'INSTANCE', 'tab-bar');
  jobs.push([one(tb, n => n.name === 'discover-item', 'discover'), [click(nav(F.disc))]]);
  jobs.push([one(tb, n => n.name === 'diary-item', 'diary'), [click(nav(F.diary))]]);
  jobs.push([one(tb, n => n.name === 'log-fab', 'fab'), [click(nav(F.add, DISS(0.2)))]]);
  jobs.push([one(f1b, n => isBtn(n) && n.parent.name === '-add-food-item', 'add food'), [click(nav(F.calc, PUSH))]]);
  jobs.push([one(f1b, n => n.name === 'scan-target', 'scan'), [click(nav(F.calc, PUSH))]]);
  jobs.push([await get('I182:1030;182:516'), [click(nav(F.edit, DISS(0.2)))]]);
  const f9 = await get(F.edit);
  for (const b of f9.findAll(isBtn)) jobs.push([b, [click(BACK)]]);
  jobs.push([one(f9, n => n.name === 'surface' && n.parent === f9, 'scrim'), [click(BACK)]]);
  const f7c = await get(F.none);
  jobs.push([one(f7c, n => n.name === 'icon' && n.parent.name === 'add-food-row', 'back'), [click(BACK)]]);
  for (const b of f7c.findAll(isBtn)) jobs.push([b, [click(nav(F.calc, PUSH))]]);
  for (const [node, reactions] of jobs) await node.setReactionsAsync(reactions);
  const names = new Map(page.flowStartingPoints.map(f => [f.nodeId, f.name]));
  names.set(F.over, 'State · Over budget'); names.set(F.plan, 'State · Nothing fits tonight'); names.set(F.none, 'State · No results');
  page.flowStartingPoints = [...names.entries()].map(([nodeId, name]) => ({ name, nodeId }));
}

// ---------------------------------------------------------------------------------------
// 9 · 07 · Presentation — run as its own call on page 271:2. Every existing device's clone
// is replaced with a fresh clone of the live frame (the tertiary rebind and copy changes
// would otherwise be stale there), and four devices are added: 9 after 6 in "Log a meal",
// 7c after 7b, then 1b and 4b at the end of "States". Geometry and paints are copied from
// the first existing cell, so the board stays one system.
// (See figma-device-mockups.js for buildDevice; the refresh step is `old.remove()` followed
// by placing a new clone at BEZEL/BEZEL with SCREEN_R and reactions wiped.)

// ---------------------------------------------------------------------------------------
// 10 · Review fixes (same day, after the designer's readback of the screenshots).
//   · Frame 2: the pinned pod sat 2pt under the macro card. 8 + 8 reclaimed from the two
//     cards' vertical padding (16 → 12, both tokens), 16 given to the pod's top; the CTA
//     bottom stays on 808 and the card now ends 18pt above the TOTAL label.
//   · 1b: the macro bars had NOT filled. A width override on an instance sublayer reports
//     success and silently reverts — the render showed 202 / 203 / 198 of 313, the
//     dashboard's own proportions. The daily-budget is detached first (detaching a nested
//     child detaches the parent implicitly and invalidates the siblings' ids), then each
//     Macro Stat, then the fill is resized to its track.
//   · 9: the entry card's inset was 12 against the rows' 16, so the photo sat 4pt left of
//     the row text; padding 16 and the entry resized to 321. "Amount" inside the amount
//     row duplicated the AMOUNT caption above it — it is now the helper "1 bowl" beside the
//     250 g stepper; "Time ··· 08:30 ›" became the value "Today, 08:30 ›".
{
  for (const id of ['69:183', '69:155']) { const card = await get(id); card.paddingTop = 12; card.paddingBottom = 12; await bindNum(card, 'paddingTop', V.space12); await bindNum(card, 'paddingBottom', V.space12); }
  const pod = await get('69:214'); pod.paddingTop = 16; await bindNum(pod, 'paddingTop', V.space16); pod.y = 808 - pod.height;
  const f1b = await get('295:987');
  const budget = f1b.findOne(n => mainId(n) === '8:2').detachInstance(); budget.name = 'daily-budget';
  for (const ms of budget.findAll(n => mainSet(n) === '65:52')) {
    const d = ms.detachInstance();
    const fill = d.findOne(n => n.type === 'RECTANGLE' && n.name === 'fill');
    fill.resize(fill.parent.width, fill.height); fill.fills = [await boundPaint(V.warning)];
  }
  const card = await get('297:1287'); card.paddingLeft = 16; card.paddingRight = 16;
  await bindNum(card, 'paddingLeft', V.space16); await bindNum(card, 'paddingRight', V.space16);
  (await get('297:1288')).resize(321, 68);
  const helper = await get('297:1299'); await setText(helper, '1 bowl'); helper.fills = [await boundPaint(V.textSecondary)]; helper.name = 'helper';
  const value = await get('297:1326'); await setText(value, 'Today, 08:30'); value.name = 'value';
  (await get('297:1336')).remove();
}

return { ok: true };

// --- MEASURED, NOT EYEBALLED ---------------------------------------------------------------
// feedback.warning #A36700 on bg.surface 4.67:1, on the three macro tracks 3.35 / 3.38 / 3.43
// (non-text, ≥3:1). text.secondary on bg.raised 4.87:1 (the edit sheet's rows).
// feedback.danger on danger-surface 4.74:1 ("Delete entry"). accent.primary-strong at 13pt on
// the canvas 5.61:1 (the pull-down subtitle).
// Binding audit after the pass: 1,096 solid fills on 04 · Screens, 65 unbound, all in the
// exempt classes (aurora blobs, Dynamic Island, the two modal scrims); 0 unbound strokes;
// 490 text nodes, 0 unstyled; 48 gradients.
//
// --- FOUND WHILE DOING THIS, NOT FIXED ------------------------------------------------------
// The four meal pills in the edit sheet wrap to a second row (Dinner alone), because the
// selected pill carries a check glyph and Breakfast is the widest label. A Segmented
// Control would sit on one line; it is the same "wrap, never clip" rule as Discovery's
// filters, so it is left as drawn and noted for the component pass.
