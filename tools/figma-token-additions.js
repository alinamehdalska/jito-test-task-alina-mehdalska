// Plate — mirror the coded prototype's token additions into the Figma variable collections.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in one use_figma call.
//
// tokens.json gained five things while the coded prototype was being built, and the
// repo's contract is that the file and the Figma collections are generated from one
// source, so each lands here too:
//
//   primitive.size.24/36/44/52/56    the four control heights (+ icon glyph) from §2.12a,
//                                    which had lived only in prose
//   primitive.blur.glass 28          the tab bar's backdrop blur
//   primitive.motion.duration.*      120 / 200 / 320 ms from branding-strategy §8 and the Button spec
//   semantic.control.*               role names for the sizes — components consume these
//   semantic.text.inverse-secondary  neutral/300 (Light) · neutral/700 (Dark)
//
// and one re-solve: primitive.color.feedback.success #30815E → #2C7757. The old value
// measured 4.22:1 on success-pale, under AA for the 11–15pt labels that sit on it
// ("610 kcal left", "Fits your calories", "Fits your daily plan"); the new one measures
// 4.80:1 there and 5.9:1 under a white check, and is visually the same green.
//
// Found while measuring: the toast's detail line ("Greek yogurt bowl · 320 kcal", Caption 2)
// was bound to text/tertiary on bg/inverse — 3.55:1, and text/tertiary is large-text only by
// contract. It is rebound here to the new text/inverse-secondary (8.24:1).

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const prims = collections.find((c) => c.name === 'Primitives');
const sem = collections.find((c) => c.name === 'Semantic');
const PRIM_MODE = prims.modes[0].modeId;
const LIGHT = sem.modes.find((m) => m.name === 'Light').modeId;
const DARK = sem.modes.find((m) => m.name === 'Dark').modeId;

const all = await figma.variables.getLocalVariablesAsync();
const byName = Object.fromEntries(all.map((v) => [v.name, v]));
const created = [];

const makeFloat = (name, collection, description, scopes) => {
  if (byName[name]) return byName[name];
  const v = figma.variables.createVariable(name, collection, 'FLOAT');
  v.description = description;
  v.scopes = scopes;
  byName[name] = v;
  created.push({ name, id: v.id });
  return v;
};

// 1. Primitive sizes, keyed by value like space/* and radius/*.
const SIZES = {
  24: 'Icon glyph. Legal only inside a 44 target.',
  36: 'Chip and filter pill. Never appears alone — its row supplies the 44 target.',
  44: 'Standard button, icon button, list-row action. The touch-target floor.',
  52: 'Primary and sticky CTA. One per screen.',
  56: 'Floating action button. FAB only, never more than one per screen.',
};
for (const [px, desc] of Object.entries(SIZES)) {
  makeFloat('size/' + px, prims, desc, ['WIDTH_HEIGHT']).setValueForMode(PRIM_MODE, Number(px));
}

// 2. Glass blur and motion durations. Durations have no picker scope in Figma, so they are
//    documentation-level mirrors: scopes [] keeps them out of every picker.
makeFloat('blur/glass', prims, 'Glass tab bar: bg/surface at 65% over this blur keeps inactive labels at 5.63:1.', ['EFFECT_FLOAT']).setValueForMode(PRIM_MODE, 28);
const MOTION = {
  press: [120, 'Pressed state: fill steps to accent/primary-hover, scale 0.98. In ms.'],
  state: [200, 'State changes — selection, toggles, tab underline. In ms.'],
  sheet: [320, 'Sheet presentation and dismissal. In ms.'],
};
for (const [key, [ms, desc]] of Object.entries(MOTION)) {
  makeFloat('motion/duration/' + key, prims, desc, []).setValueForMode(PRIM_MODE, ms);
}

// 3. Re-solve feedback/success. The semantic feedback/success aliases this primitive, so
//    every instance updates with it.
const success = byName['color/feedback/success'];
success.setValueForMode(PRIM_MODE, { r: 0x2c / 255, g: 0x77 / 255, b: 0x57 / 255 });
success.description = 'Primitive — do not consume directly. Reference via a Semantic token. Re-solved 2026-09-03 from #30815E (4.22:1 on success-pale) to #2C7757 (4.80:1).';

// 4. Semantic control sizes — aliases to size/*, identical in both modes.
const CONTROL = {
  icon: [24, 'Icon glyph size.'],
  chip: [36, 'Filter Pill, Ingredient Chip.'],
  button: [44, 'Button size=md, icon buttons, row actions — and the minimum tap target everywhere.'],
  cta: [52, 'Button size=lg: the sticky CTA.'],
  fab: [56, 'The log FAB seated in the tab bar.'],
};
for (const [role, [px, desc]] of Object.entries(CONTROL)) {
  const v = makeFloat('control/' + role, sem, desc, ['WIDTH_HEIGHT']);
  const alias = figma.variables.createVariableAlias(byName['size/' + px]);
  v.setValueForMode(LIGHT, alias);
  v.setValueForMode(DARK, alias);
}

// 5. text/inverse-secondary — secondary text on bg/inverse.
let invSec = byName['text/inverse-secondary'];
if (!invSec) {
  invSec = figma.variables.createVariable('text/inverse-secondary', sem, 'COLOR');
  invSec.description = "Secondary text on bg/inverse — the toast's detail line. 8.24:1 on neutral/900; text/tertiary measured 3.55 there.";
  invSec.scopes = ['TEXT_FILL'];
  invSec.setValueForMode(LIGHT, figma.variables.createVariableAlias(byName['color/neutral/300']));
  invSec.setValueForMode(DARK, figma.variables.createVariableAlias(byName['color/neutral/700']));
  created.push({ name: invSec.name, id: invSec.id });
}

// 6. Rebind the toast's detail line. Text mutations need the node's font loaded first, and the
//    bound paint must be seeded with the variable's real colour (CLAUDE.md working agreement 1).
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const detail = await figma.getNodeByIdAsync('73:335');
for (const seg of detail.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(seg.fontName);
const NEUTRAL_300 = { r: 0xc9 / 255, g: 0xc7 / 255, b: 0xd1 / 255 };
detail.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: NEUTRAL_300 }, 'color', invSec)];

return {
  created,
  successNow: success.valuesByMode[PRIM_MODE],
  toastDetailBoundTo: (await figma.variables.getVariableByIdAsync(detail.boundVariables.fills[0].id)).name,
  primitivesCount: prims.variableIds.length,
  semanticCount: sem.variableIds.length,
  mutatedNodeIds: ['73:335'],
};
