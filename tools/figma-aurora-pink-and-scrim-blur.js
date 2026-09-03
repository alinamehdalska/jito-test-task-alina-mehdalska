// Plate — mirror the two tokens the prototype's shell stage added to tokens.json.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in one use_figma call.
//
//   semantic.bg.aurora-pink   blush/200 (Light) · blush/800 (Dark) — the fourth aurora blob
//                             had no semantic token, and the coded backdrop consumes
//                             semantic tokens only
//   primitive.blur.scrim 10   the modal scrim's backdrop blur behind the Add sheet
//
// Scopes copy the sibling they belong beside: aurora-pink takes bg/aurora-blue's, blur/scrim
// takes blur/glass's.

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const prims = collections.find((c) => c.name === 'Primitives');
const sem = collections.find((c) => c.name === 'Semantic');
const PRIM_MODE = prims.modes[0].modeId;
const LIGHT = sem.modes.find((m) => m.name === 'Light').modeId;
const DARK = sem.modes.find((m) => m.name === 'Dark').modeId;

const all = await figma.variables.getLocalVariablesAsync();
const byName = Object.fromEntries(all.map((v) => [v.name, v]));
const created = [];

if (!byName['bg/aurora-pink']) {
  const sibling = byName['bg/aurora-blue'];
  const v = figma.variables.createVariable('bg/aurora-pink', sem, 'COLOR');
  v.description = 'Fourth aurora blob (branding-strategy §8: blush/200 at 26%). Mirrors a gradient/blur paint that cannot bind to a variable.';
  v.scopes = sibling ? [...sibling.scopes] : ['FRAME_FILL', 'SHAPE_FILL'];
  v.setValueForMode(LIGHT, figma.variables.createVariableAlias(byName['color/blush/200']));
  v.setValueForMode(DARK, figma.variables.createVariableAlias(byName['color/blush/800']));
  created.push({ name: v.name, id: v.id });
}

if (!byName['blur/scrim']) {
  const sibling = byName['blur/glass'];
  const v = figma.variables.createVariable('blur/scrim', prims, 'FLOAT');
  v.description = 'Modal scrim behind the Add sheet: bg/inverse at 45% over this blur, so the dashboard reads as present but out of focus.';
  v.scopes = sibling ? [...sibling.scopes] : ['EFFECT_FLOAT'];
  v.setValueForMode(PRIM_MODE, 10);
  created.push({ name: v.name, id: v.id });
}

return { created, primitivesCount: prims.variableIds.length, semanticCount: sem.variableIds.length };
