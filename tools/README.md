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
