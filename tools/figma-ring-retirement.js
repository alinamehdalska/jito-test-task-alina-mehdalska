// Plate — retire the circular macro ring, sync the Hero Gauge with the product, and rebuild
// the Home Indicator whose bounding box lied.
// APPLIED 2026-09-03 against fileKey lzCgTFcfrlE8qGqYbBTh7l, in ten use_figma calls.
//
// Verified after running: 0 Macro Progress Ring instances anywhere; 11 frames at 393x852;
// every home indicator at 126.5/839 with box and painted rect agreeing; 319 text nodes all
// styled; fade drift []; every touched component 100% bound with 0 primitive bindings.

// ---------------------------------------------------------------------------
// 1. "Unused" was not quite true, and the difference mattered.
// ---------------------------------------------------------------------------
// The ring had three instances — all three inside `Calorie Card variant=daily-budget`, a
// variant nothing on any screen instanced. So the brief was right about the outcome and
// wrong about the path: deleting the ring first would have left a broken variant behind.
//
//   daily-budget    Hero Gauge + 3 rings, 353x312, no card chrome   0 uses
//   meal-entry      meal row                                        9 uses
//   product-result  search result row                               0 uses
//
// Meanwhile the live dashboard built its hero card BY HAND from Hero Gauge + Macro Stat —
// 353x411, bg.surface, radius 20. The component and the screen had described the same
// thing differently for weeks and nothing could catch it, because neither referenced the
// other.

// ---------------------------------------------------------------------------
// 2. Rebuild FROM the live artefact, not towards it.
// ---------------------------------------------------------------------------
// The variant was rebuilt by cloning the live card's children and copying its layout
// properties wholesale, then the Dashboard was pointed at an instance of the result. Editing
// the variant "until it matches" would have left whatever difference I failed to notice.
//   for (const c of kids(daily).slice()) c.remove()
//   daily.layoutMode = live.layoutMode; daily.itemSpacing = live.itemSpacing; ...
//   for (const c of kids(live)) daily.appendChild(c.clone())
// Text is then copied back onto the instance so the numbers do not revert to the master's.

// ---------------------------------------------------------------------------
// 3. The gauge master had been left behind.
// ---------------------------------------------------------------------------
// It showed `1,240 · Calories` in the centre with `610 Left` at a terminus, while every
// instance showed the opposite. The product counts DOWN — that is the no-shame position —
// so the master now leads with `610 · kcal left`. Instances carry text overrides, so none
// of them moved.

// ---------------------------------------------------------------------------
// 4. A bounding box that disagrees with what is painted.
// ---------------------------------------------------------------------------
// The Home Indicator instance reported x=266.5 while its rectangle painted at 126.5 —
// exactly its own width apart. That is what let an audit call it centred while it hung off
// the left edge of every frame. Nudging it only moves the disagreement around; the component
// was rebuilt from a fresh rectangle and all twelve instances repointed, after which box and
// paint agree at 126.5/839 on all eleven screens.
//
// Three of those instances live inside the Dashboard component and cannot be moved at the
// instance level at all — `relative-transform` is not overridable — so they were fixed at
// the component. CLAUDE.md working agreement 12.
