// Plate — give every layer a name that says what it is.
// APPLIED 2026-09-02 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in four use_figma calls.
//
// Verified after running: 0 nodes named Frame/Rectangle/Ellipse/Group/Vector outside a
// component instance, across both the Components and Screens pages. drift [] on the fades,
// CTA baseline still 808, hero gauge still 313 x 204.49.

// ---------------------------------------------------------------------------
// 1. Do this AFTER componentising, never before.
// ---------------------------------------------------------------------------
// Every rename inside a component propagates to its instances, so 332 renames covered a
// tree that would have needed far more before the chrome and content passes. Naming first
// would have meant naming twice: the rebuild changes the tree.

// ---------------------------------------------------------------------------
// 2. Name the role, not the value.
// ---------------------------------------------------------------------------
// The first pass derived names from the text a frame contained, which produced
// `610-stack`, `142g-row`, `1850-stack`. Those are worse than `Frame`: they look
// informative and go stale the moment the number changes. A layer name has to survive a
// content edit.
//
// Second pass: prefer the LABEL over the number, and where every string in the subtree is
// a value, describe the job instead.
//   const words = texts(n).filter(t => !/^[\s\d.,\/]+(g|kcal|mg|%|min)?$/i.test(t))
//   words.length ? slug(words[0]) : (texts(n).length >= 2 ? 'value-pair' : 'value')
//
// `610-stack` -> `kcal-left-stack`, `142g-row` -> `carbs-row`, `c-36-row` -> `carbs-chip`.

// ---------------------------------------------------------------------------
// 3. Shape carries meaning where text does not.
// ---------------------------------------------------------------------------
// Leaf nodes have no text to read, so they are named from geometry and role:
//   RECTANGLE h<=2  w>40   -> divider
//   RECTANGLE h<=8  w>40   -> track
//   RECTANGLE square <=16  -> dot
//   ELLIPSE   <=14         -> dot,  else blob
// An icon frame with no text takes its glyph: `scan-target`, `heart-target`.

// ---------------------------------------------------------------------------
// 4. TEXT nodes are not a naming problem.
// ---------------------------------------------------------------------------
// Figma names a text layer after its own content and keeps it in sync. `TEXT:610` looks
// like a bad name and is actually the tool working correctly — renaming it fights Figma
// and the name reverts on the next content edit. The audit excludes them.
