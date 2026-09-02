// Plate — replace the hand-drawn glyphs with real Phosphor geometry.
// APPLIED 2026-09-02 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in six use_figma calls.
//
// Verified after running: 22-glyph `Icon` variant set; 93 icon frames swapped; steppers
// read `− value +` on all four; confirmation badges read as checks. Two mapping errors
// were caught by screenshot and fixed — see 3.

// ---------------------------------------------------------------------------
// 1. Identify by looking, not by inferring.
// ---------------------------------------------------------------------------
// The review's complaint was that the icon source was undocumented. Mapping 31 distinct
// glyphs to Phosphor names from the surrounding text alone would have been guesswork, so
// one instance of each was cloned into a labelled contact sheet and screenshotted. Most
// turned out to be decent and coherent; only fish, grains and the servings glyph were
// genuinely weak. That is worth knowing before replacing anything.

// ---------------------------------------------------------------------------
// 2. Phosphor regular is FILL-based; the old glyphs were stroked.
// ---------------------------------------------------------------------------
// The colour therefore moves from `strokes` to `fills`. Carry the binding across rather
// than re-picking a colour, or the semantics are lost:
//   const src     = oldVector.strokes[0]
//   const boundId = src.boundVariables?.color?.id
//   newVector.fills = [figma.variables.setBoundVariableForPaint(
//                       {type:'SOLID', color: src.color}, 'color',
//                       await figma.variables.getVariableByIdAsync(boundId))]
//
// This also invalidates any state logic that switched icon `strokes` — the Tab Bar's
// Active variant had to be re-pointed at fills.

// ---------------------------------------------------------------------------
// 3. Path-data LENGTH is not a glyph identity.
// ---------------------------------------------------------------------------
// Glyphs were keyed by the character count of their path `d` attribute. It is cheap and
// mostly works — and it silently collided. `x` and `minus` happen to produce the same
// length, so every stepper decrement came through as a cross: the serving controls read
// `× 1 +`. A second collision turned the "Fits your daily plan" check into a plus.
//
// Neither was visible in the swap tally, which reported plausible counts throughout. Both
// were caught by screenshot and fixed by POSITION rather than by glyph — a stepper is
// [decrement, value, increment], so whatever sits left of the increment is a minus
// regardless of what it currently is:
//   if (glyph(icons[1]) === 'plus' && glyph(icons[0]) !== 'minus')
//     icons[0].setProperties({ Icon: 'minus' })

// ---------------------------------------------------------------------------
// 4. Scanning after swapping finds your own work.
// ---------------------------------------------------------------------------
// `frame.findAll(VECTOR)` returns the vectors inside a freshly placed icon instance too,
// so a second pass reports them as unmapped leftovers. Exclude anything whose ancestry
// crosses an INSTANCE boundary before concluding a swap failed.

// ---------------------------------------------------------------------------
// 5. `findAll` does not exist on leaf nodes.
// ---------------------------------------------------------------------------
// Calling it on a RECTANGLE throws `no such property 'findAll'`. Guard with `'children' in n`
// when walking mixed child arrays.
