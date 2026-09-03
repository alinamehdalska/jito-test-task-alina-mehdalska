// Plate — a consistency sweep across all seven pages, and the removal of the last
// genuinely legacy artefact in the file.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in fourteen use_figma calls.
//
// Verified after running, per page: 0 unstyled text, 0 off-grid spacing, 0 off-scale
// radius, 0 generic layer names, 0 placeholders. Screens still 11 frames at 393x852.

// ---------------------------------------------------------------------------
// 1. The Stylescape held a rebuilt copy of a design that no longer existed.
// ---------------------------------------------------------------------------
// Board 03 showed four hand-built screen "thumbnails" at 0.62 scale. They accounted for
// almost everything wrong with that page:
//
//   121 of 187 unstyled text nodes   — 120 of them inside the thumbnails
//   124 off-grid spacing values      — 14.88, 12.4, 7.44, 2.48: all 0.62x of real numbers
//   radii of 2.48 and 6199.38        — same cause
//   `photo (placeholder)` rectangles never filled
//
// And they were four screens when the product now has eleven, drawn before the Phosphor
// icons, the Apple chrome and the canvas gradient. A reviewer opening that page saw an
// old version of the product.
//
// They are now full-size clones of the live screens. Scaling was the wrong instinct:
// `rescale()` rewrites font sizes, which detaches every text style — that is precisely how
// the originals ended up with 120 unstyled nodes. A 1:1 clone keeps styles, bindings and
// real photography, and the board simply grows to 1796x1280 to hold them.

// ---------------------------------------------------------------------------
// 2. Images do not survive between use_figma calls.
// ---------------------------------------------------------------------------
// The first attempt rendered each screen with `exportAsync` + `figma.createImage`, which
// is the tidier answer — a stylescape should present the product, not duplicate it. The
// hash returned fine and the fill was assigned, but by the next call `fills` was empty:
// an image with nothing referencing it when the call ends is not retained. Doing export
// and attach inside a single call did not help either. Treat `createImage` as unavailable
// here, the same as the documented `createImageAsync`.

// ---------------------------------------------------------------------------
// 3. Audit rules need exemptions, and the exemptions need to be named.
// ---------------------------------------------------------------------------
// Three things fail a naive sweep and should:
//   `glass-plate`        shadow authored inline because node opacity 0.65 divides it
//   aurora blobs         unbound fills carrying measured opacities
//   `Dynamic Island`     black because it is a hardware cutout
// And one fails it wrongly: Apple's own status bar internals (`padding 2.33 / 9`) are
// vendor geometry, not ours to snap to a grid. The sweep skips anything under those names.

// ---------------------------------------------------------------------------
// 4. Two sizes of one logotype.
// ---------------------------------------------------------------------------
// "Plate" was set at 128pt on the cover and 108pt on the brand-core stylescape — the same
// mark at two arbitrary sizes, which is the exact failure this sweep was looking for. A
// 128pt logotype is not a step on a text ramp, so leaving it unstyled would have kept the
// audit permanently at "almost zero". It now has one named `Wordmark` style, used twice.
