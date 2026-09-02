// Plate — componentise the repeated CONTENT, after the chrome pass had done the frame.
// APPLIED 2026-09-02 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in five use_figma calls.
//
// Verified after running: drift [] against the pre-rebuild baseline; 11 frames still
// 393x852 at y=0; three Hero Gauge instances all 313 x 204.49; 319 text nodes preserved
// exactly; 97 instances where the file started with 33.

// ---------------------------------------------------------------------------
// 1. The first fingerprint could not see content rows at all.
// ---------------------------------------------------------------------------
// Including TEXT width in the signature gave every ingredient row a different shape,
// because the rows differ by their words. Normalising text to a bare 'TEXT' token
// collapsed them and the real repeats appeared at once:
//
//   Nutrition Row     9 on 5b     FRAME 321x46 [TEXT|TEXT]
//   Instruction Step  5 on 5c     FRAME 353x66 [badge|title+body]
//   Ingredient Row    5 on 5      FRAME 353x44 [icon|TEXT|TEXT]
//
// Text is variable-width by nature. Any structural signature that includes it is
// measuring the copy, not the component.
const sig = (n, d) => {
  if (n.type === 'TEXT') return 'TEXT';          // <- the whole fix
  const b = [n.type, Math.round(n.width) + 'x' + Math.round(n.height)];
  if (n.layoutMode) b.push(n.layoutMode + ':' + n.itemSpacing);
  if ((d || 0) < 2 && n.children) b.push('[' + n.children.map((c) => sig(c, (d || 0) + 1)).join('|') + ']');
  return b.join(' ');
};

// ---------------------------------------------------------------------------
// 2. The component owns the shape; the instance keeps its words.
// ---------------------------------------------------------------------------
// Capture each row's strings before the swap and write them back onto the instance,
// or nine nutrition rows all end up saying "Calories · 480 kcal".
//   const texts = row.findAll(n => n.type === 'TEXT').map(t => t.characters)
//   ... create instance ...
//   for (const seg of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(seg.fontName)
//   slots[i].characters = texts[i]

// ---------------------------------------------------------------------------
// 3. Frames 6 and 8 each carried a whole second copy of the Dashboard.
// ---------------------------------------------------------------------------
// 133 descendants against the original's 135, and all 40 text strings identical with
// nothing extra. This is the review's "sixty changes instead of one parent" argument in
// its most literal form: the dashboard existed three times.
//
// A guard ran before the swap comparing the sorted text of each copy to the original,
// and threw on any divergence — swapping first and checking later would have silently
// discarded whatever made a copy different.
//
// Frame 1 then took an instance too. Without that step the component is just a fourth
// copy and edits to frame 1 still do not reach 6 and 8. The trade is that the screen IS
// the component: edit it in the component, not on the frame.

// ---------------------------------------------------------------------------
// 4. `layoutMode` is the string 'NONE' on a plain frame — truthy.
// ---------------------------------------------------------------------------
//   if (frame.layoutMode)                      // WRONG: true for a non-auto-layout frame
//   if (frame.layoutMode !== 'NONE')           // right
// Guarding on truthiness threw `Can only set layoutPositioning = ABSOLUTE if the parent
// node has layoutMode !== NONE`. Worth noting the failure applied nothing: the frame
// still had its original 7 children and 40 texts afterwards, so use_figma is atomic on
// error and a failed script does not need unwinding.

// ---------------------------------------------------------------------------
// Still open after this pass
// ---------------------------------------------------------------------------
// 105 of 319 text nodes on the Screens page carry no text style. The rows that became
// components inherit whatever their master had, so componentising did not fix it —
// it just made the gap addressable in one place per row type instead of in every copy.
