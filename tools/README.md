# tools

Figma Plugin API scripts run through the Figma MCP (`use_figma`) against
`lzCgTFcfrlE8qGqYbBTh7l`. They are part of the AI-native workflow described in the
root `README.md`, not application code.

| Script | Status |
|---|---|
| `figma-spacing-and-homebar-fix.js` | **Applied 2026-09-01.** 60 gaps restored, 24 left at zero by design, 7 chips repadded, 10 home indicators, safe-areas set. |
| `figma-component-and-fade-fix.js` | **Applied 2026-09-01.** Recipe Card overflow, 44pt tap targets, skeleton/real card parity, segmented control, steppers, bottom scroll fade. |
| `figma-alignment-and-safe-area-fix.js` | **Applied 2026-09-01.** Hero-arc centring, status bars on 5/5b, tab-counter baseline, tighter Discovery, one CTA baseline at y=808. |
| `figma-fade-tuning-and-list-parity.js` | **Applied 2026-09-01.** Opaque CTA pods removed from 5/5b, per-screen fade ramps, ingredient list matched to its counter. |
| `figma-gauge-width-and-grid-cut.js` | **Applied 2026-09-01.** Hero Gauge widened to the card interior, Discovery grid cut repositioned so its fade can be light. |
| `figma-tab-split-and-discovery-compaction.js` | **Applied 2026-09-01.** Section tabs become true tab views (new frame 5c), each tab's content completed, Discovery reclaims 20pt. |
| `figma-card-photo-scrim.js` | **Applied 2026-09-01.** Recipe card photo dissolves into the panel; repairs the component's black-seeded surface fill. |
| `figma-chrome-componentisation.js` | **Applied 2026-09-02.** Six chrome components replace 44 duplicated structures; two needed variant sets, not single components. |

## figma-chrome-componentisation.js

**Forty-four copies of six things.** Every screen carried its own status bar, home
indicator, aurora backdrop, fade and — on four of them — its own tab bar. Changing any of
them meant changing it up to eleven times, which is the concrete version of the review's
"one parent component prolls changes to all children" argument. They are now six
components and the screens hold instances.

**The fingerprint lied about the tab bar.** A shape fingerprint over geometry and child
structure reported one shape across all four tab bars. It recursed three levels and
compared fill *types*, so it could not see that Dashboard lights `Home` and Discovery
lights `Discover`. Componentising on that reading would have flattened four navigation
states into one. Two of the six needed variant sets:

| Component | Property | Why |
|---|---|---|
| Tab Bar | `Active=Home\|Discover\|Diary\|Profile` | The lit destination differs per screen |
| Bottom Fade | `Context=Nav\|Discovery\|Detail` | Ramp is per layout — 121/139/160 |
| Section Tabs | `Active=Ingredients\|Nutrition\|Instructions` | These are the three tab views |

**The icon colour was on the stroke.** The first Tab Bar build copied `fills` for label and
icon. Labels switched, icons did not — these icons are stroked outlines whose `fills` array
is empty, so every variant kept the cloned bar's coral `Home` glyph. Discovery rendered a
grey "Discover" label next to a coral house. Four variants, correct labels, exactly one
active each: the structural audit passed. The screenshot did not.

**Baseline first, or the check is worthless.** Measurements were recorded before the pass
and re-run after: all seven fade geometries matched exactly (`drift: []`), the hero gauge
held 313 x 204.49, and all eleven frames stayed 393 x 852 at y=0.

### Found in passing

The section-tab active indicator is `coral/400` (#F0986A), which measures **2.26:1** on
surface — under the 3:1 non-text floor this file's own contract sets for indicators, and
the same 400-tint trap already documented for the gauge and macro bars. State is also
carried by label weight and colour, so it is not colour-alone, but the underline is the
primary affordance. Flagged, not changed: moving it to `coral/600` alters the look and
wants a decision.

## figma-card-photo-scrim.js

**Frame 5 has no gradient.** Its hero photo meets the content panel because the panel
*overlaps* it by 24pt with a `radius.32` top — the softness is geometry, not a fade. The
recipe card had a butt joint instead: photo ends at 116, panel starts at 116, hard line.

At 170pt wide, copying the mechanism would read fussy and cost photo height, so the card
matches the **effect**: its last 24pt dissolve into `bg.surface`, hitting full opacity exactly
on the photo's bottom edge so there is no seam left to see. This is the design system's
sanctioned *recipe-card scrim* — one of the four rationed gradients — and like the other three
it cannot bind to a variable, so its stops are `bg.surface`'s Light value hardcoded. Dark mode
would need them re-authored.

The scrim must be `layoutPositioning: 'ABSOLUTE'`; in the card's vertical auto-layout a flow
child pushes the content panel down instead of overlaying the photo.

### Found in passing

Every Recipe Card variant's fill was bound to `bg.surface` but **seeded black** — so the
component set on the Components page rendered as three black cards while reporting
`bound: true`. The instances had resolved to white, which is why the Screens page looked
correct and only the library page was wrong. This is working agreement 1 in `CLAUDE.md`,
still latent from an earlier pass; re-seeded with the variable's real colour.

## figma-tab-split-and-discovery-compaction.js

**The section tabs were lying.** They were specified as scroll-spy anchors over one long
page, which is why 5b rendered the nutrition table *and* the cooking instructions together.
An underline indicator reads as a segmented control, so that looks like a bug whatever the
intent — the active tab said `Nutrition` while instructions sat directly beneath it. They are
now true tab views: frames 5, 5b and 5c are the three states, one section each.

**A tab's selected state is four properties, not one** — label `fontName`, label `fills`, the
indicator's `layoutSizingHorizontal`, *and* the indicator's own `fills`. Setting a subset
produced a half-lit tab that passed the structural audit: an indicator measuring the correct
82pt with no paint on it, beside a deselected label still set in Semibold. Only the
screenshot caught it. Copy the arrays wholesale from a known-good tab — that carries the
variable bindings and avoids the async bound-paint trap.

**Splitting exposed two content gaps the stacked layout had hidden.** A five-row nutrition
table and a three-step method each left their own tab roughly half empty. Both were completed
rather than padded:

- the nutrition panel gains sugars, saturated fat, sodium and cholesterol — the standard
  fields, with values following from the fat and carbohydrate figures already stated;
- step 3 was doing two jobs (`Add rice, spinach, salmon and avocado. Finish with a squeeze of
  lemon.`) and nothing covered slicing the avocado the ingredient list carries, so the method
  splits into five steps.

**Discovery got its 20pt back.** The previous pass bought a clean grid cut by pushing the
whole column *down* so row 2's photo edge met the nav bar. Unnecessary — the fade only has to
be solid where the **title panel** starts (737), not where the bar starts (756). The 19pt of
plain canvas between them costs nothing, and 20pt at the top of the screen is worth far more.

## figma-gauge-width-and-grid-cut.js

**The arc was centred and still wrong.** Under `counterAxisAlignItems: CENTER` it measured
symmetric — but not exactly: `313 − 300 = 13` is odd, and Figma rounds the remainder to
**7 left / 6 right**. One point is invisible on its own; the 6.5pt inset against a
full-width divider sitting directly beneath it is not. The gauge now fills the interior, so
the remainder is zero and its `Consumed` / `Goal` end labels line up with the macro rows.

Two API constraints make this less trivial than it sounds, and both cost a failed run:

- Instance children reject `relative-transform` overrides outright — *"This property cannot
  be overridden in an instance"*. The restructure has to happen on the **component**; the
  instance then needs only a root `resize()`.
- Every child is pinned `MIN/MIN`, so resizing without repositioning them would leave the arc
  300 wide and genuinely left-aligned — the exact defect being fixed. `figma.rescale()` is
  not the shortcut either: it scales font sizes, dragging the value off `Display Calorie`.

**A grid row cannot be half-shown well.** Cut it in the photo and the fade has to be heavy
enough to erase a title panel further down — which is what made Discovery's second row look
like cards with no titles. Cut it in the panel and you get washed-out, unreadable text. The
answer is to position the cut rather than lean on the gradient: row 2's photo bottom edge now
lands on y 756, the nav bar's own top edge. The photo is whole and crisp, the bar itself
hides the panel, and the fade only has to stop that panel showing through 65% glass. Crisp
photo went from **27pt of 116 to 91 of 116**.

Two complete rows will not fit — that needs the grid to start at y 264 against its current
389, and the only block big enough to reclaim 125pt is the "Recommended for you" card, which
is the personalisation payload of User Story 2.

Widening the gauge also added 8pt of height, pushing the dashboard's meal header down into
its fade ramp, so that ramp was re-tuned in the same pass. It gets **shorter, never higher** —
the ramp must still finish by the glass bar at 756.

## figma-fade-tuning-and-list-parity.js

**The white pod.** The CTA bar on both detail screens was an opaque 393×96 block with a top
shadow. Its button ends at 808, so 44pt of bare white ran beneath it and content above was
cut hard against its top edge. That dead white is *also* why the buttons read as sitting too
high — moving them further down would have pushed them into the gesture zone. The bar's fill
and shadow are gone; the stepper and CTA float on a fade like the nav screens.

**Fade ramps are per screen now, and it matters more than it sounds.** A ramp that reaches
full opacity halfway down a card's text panel leaves a washed-out white block with
unreadable text in it. That reads as *"this card has no title"*, not *"this scrolls"* — it
was reported as missing recipe descriptions. Two constraints pull against each other:

- solid **at or before** the chrome's top edge, or content stays legible through 65% glass;
- the ramp must not **start** inside something you want read.

| Screen | Ramp | Solid at | Cuts through |
|---|---|---|---|
| 1 · Dashboard, 6, 8 | 32 | 756 | below the meal header's label (ends 717) |
| 4 · Discovery | 60 | 708 | ¾ down row 2's photo — the card panel never shows |
| 5, 5b · Details | 60 | 752 | ingredient list / instruction steps |

The dashboard's ramp is short because its chrome sits at 756 while the header it must spare
ends at 717 — only 39pt to fade in. Widening it washes out the header; raising it leaves
content visible through the glass.

**"5 items" said five and the list held three.** Not a clipping artefact — the rows did not
exist. Avocado 50 g and lemon juice 10 g are already referenced by the instruction steps,
and the five amounts sum to ≈477 kcal against the stated 480 per serving.

## figma-alignment-and-safe-area-fix.js

**The hero arc was leaning left.** The Hero Gauge is 300pt wide inside a 313pt card
interior; left-aligned, that is 20pt of left margin against 33pt of right. Nothing in the
layer tree shows it. The card now centres its cross axis — its other children are already
full-width, so only the gauge moves.

**Screens 5 and 5b had no status bar.** They were the only two without one, and 5b's
collapsed header already reserved exactly 59pt for it. On 5 it sits over the hero photo in
ink, which the image's light upper region carries.

**One CTA baseline: bottom edge at y = 808**, 44pt above the frame bottom and clear of the
home indicator's reserved zone (818–852). The two directions matter and are easy to get
backwards:

| Screen | Was | Direction | Why |
|---|---|---|---|
| 5 · Details | 794 | **down** | bar sat too high — only 7pt of air above the button |
| 5b · Nutrition | 794 | **down** | same |
| 3 · Dish Calculator | 832 | **up** | 14pt *inside* the gesture zone |
| 6 · Action sheet | 836 | **up** | sheet overflowed the frame by 24pt; last row 3pt from the indicator |

Screen 3's 24pt came from column rhythm (`space.16` → `space.12`, which also matches screen
2), the TOTAL DISH card's vertical padding, and the bottom group's own gap — not from the
ingredient row spacing added in the previous pass. It keeps a 14pt content gap.

Also: the "5 items" counter now shares a baseline with the tab labels (it was centred
against a 30pt column whose label occupies only the top 20pt), and Discovery's chip and
section gaps tighten to 8 and 12. Chip height stays 36 — that is the Filter Pill spec and
the tap target.

## figma-component-and-fade-fix.js

Ten fixes from a screenshot review. Two were structural rather than cosmetic:

**The Recipe Card was a fixed-height component being outgrown by its instances.** Restoring
the content gap in the previous pass grew each instance's content from 108 to 124 against a
component still fixed at 224, so the "Fits your calories" chip rendered *below* the card —
no error, no layer-tree symptom. Fixing an instance would have masked it; the component now
hugs, and every row holding its instances was re-measured because hugging changes their
height too.

**The bottom fade could not mask anything.** It was 393×96 at y = 756 — its transparent
first stop sat exactly where content needed to disappear, and it only reached 0.86 alpha at
the very frame bottom. Recipe titles stayed legible through the glass nav and a second line
of them rendered in the 824–852 band beside the home indicator. It now spans 696 → 852 and
hits full canvas alpha at 756, the bar's own top edge.

The rest: search-field left padding, ingredient-name alignment (three of four rows carried a
stray 16pt inset), baseline alignment for number+unit pairs, 24pt segmented-control gaps with
a label-width indicator, stepper padding, skeleton rows matched to the real product card
(72 → 88, which removes a 48pt jump on load), 44pt delete targets, 36pt chip rows, step-number
spacing, meal-header separation, and a real backdrop blur on the add sheet.

### Deviation from the brief

The stepper was asked for `px-6` (24pt). It shipped at **16**. The pill is 52pt tall around
28pt buttons, so its vertical inset is 12 — 24pt horizontal would have read visibly lopsided,
and it would have cut the adjacent "Log 1 serving to Diary" CTA from 245 to 197pt.

## figma-spacing-and-homebar-fix.js

Repairs the second wave of the off-grid spacing-token bug (see `CLAUDE.md` → Figma working
agreements → item 3), then adds the iOS home indicator and a deeper bottom safe-area.

Binding `itemSpacing` or a padding to a token that does not exist — `space/6`, `space/10`,
`space/14` — makes Figma **clear** the property to zero rather than fail. The visible symptoms
were dots touching their labels (`●32 g`, `●610 kcal left`) and the serving-size chips
collapsing into circles once their horizontal padding vanished.

It also extends the spacing scale with `80` and `96`, both valid 8pt steps, because a bottom
safe-area that clears the floating nav *and* the home indicator needs more than the previous
maximum of 64.

### What it covers

| Area | Change |
|---|---|
| Internal padding | Blanket pass — any filled, rounded container wider than 120pt with no horizontal padding gets 16; hugging containers also get 12 vertical. Only ever *sets* a missing value, never re-sets an existing one |
| Cards, search fields, ingredient rows, product row | Explicit padding and gap fixes |
| Serving-size chips | 16pt horizontal padding — they had collapsed into circles |
| Steppers (+/-) | 36pt controls, 12pt cluster gap, 16/8 row padding |
| Macro bars & metric tags | 8pt dot-to-label, 16pt between stats |
| Section gaps | Blanket repair of every auto-layout frame left at a zero gap |
| Bottom safe-area | 96pt on screens with the floating nav (≈ `pb-24`) |
| Home indicator | 140 × 5 pill, `radius.full`, 8pt from the bottom edge, on all 10 frames |

**Applied.** Verified by screenshot on all four primary screens.

### Why the blanket pass was replaced

The first draft assigned a gap to every auto-layout frame sitting at zero. Auditing the 84
affected containers first showed that would have been wrong: cards whose rows are separated
by **hairline dividers**, and **tight numeric pairs** (a value stacked over its unit), are
correct at zero. A blanket pass would have floated every divider off its row. Gaps are now
assigned by child-shape signature — 60 repaired, 24 deliberately untouched.
