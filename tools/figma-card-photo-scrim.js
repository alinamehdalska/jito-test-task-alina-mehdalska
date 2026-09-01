// Plate — soften the recipe card's photo/panel seam, and repair the card component's
// black-seeded surface fill found while doing it.
// APPLIED 2026-09-01 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in one use_figma call.
//
// Verified after running: component fills 0,0,0 -> 255,255,255 with the binding intact on all
// three variants; scrim present on all three and inherited by all four instances.

const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const get = (id) => figma.getNodeByIdAsync(id);

// Reuse an existing vertical gradient's transform rather than guessing the matrix.
const XF = JSON.parse(JSON.stringify((await get('132:209')).fills[0].gradientTransform));

const surfaceVar = await figma.variables.getVariableByIdAsync('VariableID:2:4');  // bg/surface
const WHITE = { r: 1, g: 1, b: 1 };                                              // its Light value
const PHOTO_H = 116, RAMP = 24;

for (const id of ['37:28', '37:39', '37:50']) {
  const c = await get(id);

  // Found in passing: every variant's card fill was bound to bg/surface but SEEDED BLACK, so
  // the component set rendered as three black cards while reporting bound: true. The
  // instances had resolved to white, which is why the Screens page looked fine and only the
  // Components page was wrong. Re-seed with the variable's real colour — CLAUDE.md item 1.
  c.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: WHITE }, 'color', surfaceVar)];

  // Frame 5 softens its hero photo geometrically: the content panel overlaps it by 24 with a
  // radius.3xl top. At 170pt wide that reads fussy and costs photo height, so the card
  // matches the EFFECT instead — the image dissolves into bg.surface, reaching full opacity
  // exactly on the photo's bottom edge, leaving no seam to see.
  if (c.findAll((n) => n.name === 'photo-scrim').length) continue;
  const scrim = figma.createRectangle();
  scrim.name = 'photo-scrim';
  c.appendChild(scrim);
  scrim.layoutPositioning = 'ABSOLUTE';       // a flow child would push the panel down instead
  scrim.resize(c.width, RAMP);
  scrim.x = 0;
  scrim.y = PHOTO_H - RAMP;
  // One of the four rationed gradients, and gradients cannot bind to variables: the stops are
  // bg.surface's Light value, hardcoded like the aurora and the bottom-fade. Dark mode would
  // need them re-authored.
  scrim.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: XF,
    gradientStops: [
      { position: 0, color: { r: 1, g: 1, b: 1, a: 0 } },
      { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } }
    ]
  }];
  scrim.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
}

return { ok: true };
