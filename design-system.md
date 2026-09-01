# Plate — Design System Specification

**Deliverable 2 of 3.** Component architecture for the Plate calorie calculator.
Token values live in [`tokens.json`](tokens.json); rationale lives in
[`branding-strategy.md`](branding-strategy.md).

---

## 1. Architecture

Three tiers, one direction of dependency:

```
Primitives  ──▶  Semantic  ──▶  Components
(raw values)     (intent)       (composition)
coral/400        accent.primary  Button.primary
```

**Primitives** are the generated OKLCH ramps plus the spacing and radius scales. In
Figma they are scoped to `[]` — deliberately **invisible in every property picker**. A
designer cannot reach for `coral/400` directly; they must go through `accent.primary`.
This is what keeps a token system from decaying into a colour palette: if primitives
are pickable, they get picked, and the semantic layer becomes decoration.

**Semantic** tokens are aliases carrying intent. They are the only layer components
consume, and the only layer that changes between light and dark.

**Components** compose semantic tokens. A component never references a primitive and
never hardcodes a hex value.

### Naming

| Layer | Figma | DTCG | Example |
|---|---|---|---|
| Primitive | `color/coral/400` | `primitive.color.coral.400` | — |
| Semantic | `accent/primary` | `semantic.accent.primary` | — |
| Component set | `Button` | — | `variant=primary, size=lg` |

Slash-delimited in Figma (produces folder grouping), dot-delimited in DTCG.

### Scope discipline

| Token group | Figma scopes | Effect |
|---|---|---|
| All primitives | `[]` | Hidden from pickers |
| `bg/*` | `FRAME_FILL`, `SHAPE_FILL` | Only offered as backgrounds |
| `text/*` | `TEXT_FILL` | Only offered as text colour |
| `border/*` | `STROKE_COLOR` | Only offered as strokes |
| `space/*` | `GAP`, `WIDTH_HEIGHT` | Only in layout fields |
| `radius/*` | `CORNER_RADIUS` | Only in radius fields |
| `*-gradient-*` | `ALL_FILLS`, `STROKE_COLOR` | Mirror values for gradients |
| `*/on-media` | `TEXT_FILL` / `STROKE_COLOR` | Content over photography |

**Gradients are the one thing tokens cannot own.** Figma paints cannot bind a gradient to a
variable, so the three sanctioned gradients are mirrored by `accent.cta-gradient-*`,
`accent.gauge-*` and `bg.canvas-gradient-*` tokens that hold the same stop values. The
binding audit counts them separately rather than pretending they are bound.

Scoping is the mechanism that makes the right choice the easy one.

---

## 2. Components

Six component sets. Every fill, gap, and radius is variable-bound; the token column
below is the binding contract, not a suggestion.

### 2.1 Button

Primary action affordance.

**Anatomy:** container → [leading icon] · label · [trailing icon]

| Property | Values |
|---|---|
| `variant` | `primary` · `secondary` · `tertiary` · `destructive` |
| `size` | `md` (44pt) · `lg` (52pt) |
| `state` | `default` · `pressed` · `disabled` |

24 variants.

| Variant | Fill | Label | Border | Shadow |
|---|---|---|---|---|
| `primary` | solid `accent.primary` | `text.primary` | none | `elevation.1` |
| `secondary` | `bg.surface` | `accent.primary-strong` | `border.subtle` 1pt | `elevation.1` |
| `tertiary` | transparent | `accent.primary-strong` | none | none |
| `destructive` | `feedback.danger-surface` | `feedback.danger` | none | none |

**Why primary is solid, and why the label is ink.** Only two combinations on this hue clear
AA: `coral/400` with an ink label (6.16:1) and `coral/700` with white (6.04:1). The second
abandons the warm orange accent, so the first wins. The gradient was dropped in the product
pass — decoration on the most-used control made the interface read softer than it should.
**Gradient now appears in exactly one place: the calorie gauge**, where the sweep encodes
progress rather than ornamenting a button.

**Secondary is a floating card, not a tinted button.** White fill, hairline, soft shadow —
it reads as a surface that happens to be tappable, which keeps secondary actions visually
quiet without making them look disabled.

- Height `44`/`52` — both meet the 44pt iOS minimum touch target.
- Padding `space.24` horizontal, radius `radius.full`.
- `pressed` → fill steps to `accent.primary-hover`, scale 0.98, 120ms.
- `disabled` → opacity 0.4, no fill change (colour alone never signals state).

```ts
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive'
  size?: 'md' | 'lg'
  disabled?: boolean
  iconLeading?: SFSymbol
  iconTrailing?: SFSymbol
  fullWidth?: boolean
  onPress: () => void
}
```

### 2.2 Search Input

Entry point for User Story A. Text search and barcode scan share one control.

**Anatomy:** container → search icon · field · [clear] · [scan button]

| Property | Values |
|---|---|
| `state` | `default` · `focused` · `filled` · `disabled` |
| `scan` | `true` · `false` |

8 variants.

| Element | Token |
|---|---|
| Container fill | `bg.surface` |
| Border (rest) | `border.subtle` 1pt |
| Border (focus) | `border.focus`, 2pt |
| Shadow | `elevation.1` |
| Placeholder | `text.tertiary` |
| Value | `text.primary` |
| Icons | `text.secondary` |

- Height 52, radius `radius.full` (wide pill), leading padding `space.20`.
- A soft shadow replaces the harsh border: the field reads as floating on the canvas.
- The scan button is a **separate 44pt target** inside the container, not the whole field.
- `focused` uses a 2pt ring at 3.87:1 — meets WCAG 2.4.11.

```ts
type SearchInputProps = {
  value: string
  onChange: (v: string) => void
  onScan?: () => void
  placeholder?: string
  disabled?: boolean
}
```

### 2.3 Macro Progress Ring

The system's signature element. Renders one macro's consumed-vs-target as an arc.

**Anatomy:** track circle → indicator arc → centre value → centre label

| Property | Values |
|---|---|
| `macro` | `carbs` · `protein` · `fat` · `total` |
| `size` | `sm` (64pt) · `lg` (160pt) |

8 variants.

| Element | Token |
|---|---|
| Track | `macro.{m}.track` |
| Indicator | `macro.{m}.indicator` |
| Centre value | `text.primary` (`display-calorie` at `lg`, `title-3` at `sm`) |
| Centre label | `text.tertiary`, `caption-1` |

- Stroke `sm` 3pt / `lg` 8pt — deliberately thin, so the number leads and the arc supports.
- `total` uses `accent.primary` as its indicator.
- **Over-target does not turn red.** The arc completes and a second, inset arc draws
  the excess in `feedback.warning`.
- Indicator tints are the 600-step, which clear 3:1 (WCAG 1.4.11). The 400-tints do not.

**Accessibility:** the ring is `aria-hidden`; the value and label carry the meaning as
text. Never the only representation of a number.

```ts
type MacroRingProps = {
  macro: 'carbs' | 'protein' | 'fat' | 'total'
  consumed: number
  target: number
  size?: 'sm' | 'lg'
  unit?: 'g' | 'kcal'
}
```

### 2.4 Calorie Card

Three shapes of the same idea: a calorie figure with macro context.

| Property | Values |
|---|---|
| `variant` | `daily-budget` · `meal-entry` · `product-result` |

| Element | Token |
|---|---|
| Fill | `bg.surface` |
| Nested fill | `bg.raised` |
| Radius | `radius.xl` (20) |
| Padding | `space.20` |
| Shadow | `elevation.1` |
| Title | `text.primary`, `title-2` |
| Meta | `text.secondary`, `footnote` |

- `daily-budget` — **no card chrome.** Hero Gauge plus a horizontal row of three thin macro
  badges, sitting directly on the canvas so nothing competes with the data.
- `meal-entry` — floating card: thumbnail, dish name left-aligned, macro grams as small dot
  indicators, calories pushed to the right edge.
- `product-result` — name, brand, per-100g kcal, macro chips. Search result.

```ts
type CalorieCardProps = {
  variant: 'daily-budget' | 'meal-entry' | 'product-result'
  title: string
  calories: number
  macros: { carbs: number; protein: number; fat: number }
  imageUrl?: string
  onQuickAdd?: () => void
}
```

### 2.5 Ingredient Chip

One ingredient in a recipe or a calculated dish.

| Property | Values |
|---|---|
| `state` | `default` · `selected` · `removable` |

| State | Fill | Label | Border |
|---|---|---|---|
| `default` | `bg.sunken` | `text.secondary` | none |
| `selected` | `accent.secondary-muted` | `text.primary` | `border.focus` 1pt |
| `removable` | `bg.sunken` | `text.secondary` | none, + 44pt close target |

- Height 32, radius `radius.full`, padding `space.12`, gap `space.8`.
- The close target is **44pt square with a 16pt glyph** — the frame is the tap area, the
  icon keeps its optical size. An earlier 20pt figure here contradicted composition rule 7
  and shipped as a 24pt target on the dish-calculator rows.
- Optional leading macro dot uses `macro.{m}.indicator` when the chip is
  macro-attributed.

### 2.6 Filter Pill

Smart filters for User Story B.

| Property | Values |
|---|---|
| `state` | `default` · `selected` · `disabled` |
| `count` | `true` · `false` |

6 variants.

| State | Fill | Label |
|---|---|---|
| `default` | `bg.surface` + `border.subtle` | `text.secondary` |
| `selected` | `accent.secondary-muted` | `text.primary` |
| `disabled` | `bg.sunken` | `text.disabled` |

- Height 36, radius `radius.full`, padding `space.16`.
- Count badge sits trailing, `caption-1`, on `bg.inverse` with `text.inverse`.
- Selected state carries a checkmark **in addition to** the fill change — colour is
  never the sole indicator.

---

### 2.7 Hero Gauge

The dashboard focal point. A thin semicircular arc rather than a full ring — it frees the
centre for the number and reads as a gauge rather than a progress donut.

| Element | Token / value |
|---|---|
| Track | `bg.sunken`, 13pt stroke |
| Sweep | gradient `accent.gauge-start → gauge-mid → gauge-end` |
| Value | `display.calorie` (56/58 Heavy Rounded), `text.primary` |
| Caption | `caption-1`, `text.tertiary` |
| End labels | `headline` + `caption-2` at each arc terminus |

- Diameter 300, upper semicircle only (`startingAngle` π → 2π).
- **It is 300 wide inside a 313pt card interior, so its host card must centre its cross
  axis** (`counterAxisAlignItems: CENTER`). Left-aligned it sits 20pt from the left edge and
  33pt from the right — a 13pt lean that is invisible in the layer tree and obvious on the
  canvas. The card's other children (divider, macro column) are already full-width, so
  centring moves nothing but the gauge.
- **The gradient stops are mapped to the drawn arc, not the bounding box.** A 67% sweep
  ends near x=0.75, so a violet stop at position 1.0 would never be painted — the stops sit
  at 0 / 0.34 / 0.58 / 0.76.
- The arc is decorative: the value is always present as text, so the light start stop is
  permitted below 3:1. The mid and end stops clear it anyway.

### 2.8 Recipe Card

Image-led card for discovery.

| Property | Values |
|---|---|
| `match` | `fits` · `tight` · `none` |

| Element | Token |
|---|---|
| Photo | named `photo` layer, 170 × 116 — replace fill with an image paint |
| Content panel | `bg.surface`, padding `space.12`, gap `space.8` |
| Title | `headline` on `text.primary` |
| Calories / time | `metric-inline` on `text.primary`, `caption-1` on `text.secondary` |
| Match tag | `feedback.success-muted` fill, `feedback.success` dot + label |

- 170 wide, radius `radius.xl`, `elevation.2`. **Height hugs its content** — currently 240.
- Text sits on an opaque panel **below** the photo, not on a scrim over it. Legibility is
  therefore independent of the image, and any photo can be dropped in without re-checking
  contrast. (An earlier revision used a bottom scrim with `text.on-media`; the panel
  replaced it and this table lagged behind.)
- **Never give this component a fixed height.** At 224 it clipped the bottom of the match
  tag on every instance whose title ran to two lines — see Figma working agreement 9.
- The match tag carries a dot **and** a label, so colour is never the sole indicator.

## 3. Composition rules

1. **Screen margin is `space.20`.** Cards may bleed to `space.16` only in horizontal scrollers.
2. **Vertical rhythm:** `space.24` between sections, `space.12` within a section,
   `space.8` between tightly-coupled elements.
3. **Bottom safe-area — three tiers, set by what occupies the bottom of the screen.**
   Every scrolling column carries `paddingBottom`:

   | Bottom chrome | `paddingBottom` | Screens |
   |---|---|---|
   | Floating nav bar | `space.96` | 1, 4 |
   | Pinned CTA bar | `space.32` | 2, 3, 5, 5b |
   | Nothing (plain push) | `space.48` | 7, 7b |

   The pinned-CTA tier is smaller on purpose: that bar is opaque and 92–102pt tall, so it
   *is* the bottom chrome. Stacking a 48pt scroll pad on top of it left ~140pt of dead
   space. Without any of the three, the last row ends flush against the bar at scroll-end.
4. **A primary CTA's bottom edge targets y = 808** — 44pt above the screen bottom, which
   clears the home indicator's reserved zone (818–852) with room to spare. Form screens
   differ in height; the button should not.

   Verified 2026-09-01 — all four CTA screens land on 808, and every one of the 24 tappable
   elements below y 700 clears the zone:

   | Screen | How it gets there |
   |---|---|
   | 2 · Calculator | already on target, unchanged |
   | 5 · Recipe Details | bar moved **down** 742 → 756, height 92 → 96 so it reaches the frame bottom |
   | 5b · Nutrition | same |
   | 3 · Dish Calculator | moved **up**; it was the only CTA inside the zone, at 832 |

   Screen 3 needed 24pt to move up, reclaimed without touching row spacing: column rhythm
   `space.16` → `space.12` (16pt, and it matches screen 2), the TOTAL DISH card's vertical
   padding `space.12` → `space.8` (8pt), and the bottom group's own gap `space.12` →
   `space.8` (4pt). It keeps a 14pt gap between the last content row and the group.

   Note the two directions. On 5/5b the bar was too **high** — its button sat at 794 with only
   7pt above it, so moving it down improved both. On 3 the button was too **low**, 14pt inside
   the gesture zone. "Move the CTA down" is not a global instruction; the target is the number.

   The floating tab bar's *frame* ends at 824, inside the zone, but its tap targets — the five
   nav columns — end at 811. The bar is deliberately a floating pill with the home indicator
   in the 28pt gap beneath it.
5. **Screens with a floating nav carry a `bottom-fade` spanning y 696 → 852** — a
   transparent-to-canvas gradient that reaches **full canvas alpha at y 756, the bar's own
   top edge**, and stays solid to the frame bottom. The 60pt ramp above the bar is what
   makes content dissolve; the solid remainder is what stops it reappearing in the 28pt gap
   below the floating bar. A fade that merely *sits behind* the bar (starting at 756, ending
   at 0.86 alpha) does neither — card titles stayed legible through the glass and a second
   line of them rendered under it, beside the home indicator.
6. **One elevation level per stacking context.** A card at `elevation.1` never contains
   another `elevation.1` card — nested surfaces use `bg.raised`.
7. **Touch targets are 44pt minimum**, including scan, stepper and remove controls.
8. **Macro order is always carbs → protein → fat.** Never re-sorted by value.
9. **Numbers are tabular** everywhere they can change.

> **Spacing tokens must exist on the grid.** `setBoundVariable('paddingLeft', undefined)`
> silently *clears* the padding rather than failing, so binding to an off-grid value such as
> `space/14` or `space/10` produces a container with zero padding that still looks
> intentional in the layer tree. This cost 40 containers their padding in one pass. Use a
> guarded setter that throws when the token is missing — the valid steps are
> `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

## 4. Figma library structure

[Open the Figma file](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l)

```
00 · Cover            index and token-pipeline notes
01 · Foundations      colour ramps, semantic groups, macro spine,
                      type specimen, spacing, radius, elevation
02 · Components       10 component sets — 61 variants
03 · Stylescape       brand core · UI atmosphere · product in context
04 · Screens          10 iOS frames @ 393 × 852 (see screens-spec.md)
05 · Flows            2 user-story flow maps
```

**Variable collections**

| Collection | Modes | Count | Scopes |
|---|---|---|---|
| `Primitives` | `Value` | 88 | `[]` — private |
| `Semantic` | `Light`, `Dark` | 47 | role-scoped |

Semantic variables also carry `WEB` and `iOS` code syntax
(`var(--plate-accent-primary)` / `Color.accentPrimary`), so Dev Mode hands engineers
the real token name rather than a hex value.

**Styles:** 13 text styles and 4 effect styles, generated from the same `tokens.json`.

### 2.9 Tab Bar (glass)

A floating pill rather than a full-width bar, inset 20pt from each edge and lifted 28pt off
the bottom so content breathes underneath it.

Built as **two layers**, which is what makes it work:

| Layer | Role |
|---|---|
| `glass-plate` | Carries the glass: `bg.surface` fill, `border.on-media` hairline, `BACKGROUND_BLUR` 20, two drop shadows, all at **node opacity 0.65** |
| `tab-bar (glass)` | Transparent auto-layout on top holding icons and labels at full opacity |

| Element | Value |
|---|---|
| Container | 353 × 68, `radius.full`, inset 20pt, lifted 28pt, items at equal 52pt widths |
| Fill | `bg.surface` @ 65% (node opacity) |
| Backdrop | `BACKGROUND_BLUR` 28 |
| Border | `border.on-media`, 1pt inside |
| Shadow | 0 14 36 −8 @ 20% + 0 2 8 −3 @ 9% (alphas boosted to survive the 0.65 opacity) |
| FAB | 50pt, CTA gradient, seated inside the pill |

**Why two layers, not one.** Node opacity fades a frame's children as well as its fill, so a
single-layer pill would dim its own icons. Splitting the glass onto a plate behind the
content keeps the labels crisp at full opacity. The translucent fill is also what makes the
blur read at all — a fully opaque pill blurs nothing. Content is allowed to scroll under it;
that is the point of the treatment.

**Inactive nav items use `text.secondary`, not `text.tertiary`.** At 65% glass over the
richest patch of aurora, tertiary measures 3.55:1 — acceptable for large text but short of AA
for an 11pt label. Secondary measures 5.36:1.

> **Implementation note — bound paints.** `setBoundVariableForPaint` returns a paint whose
> colour resolves **asynchronously**. Two consequences, both of which shipped a dark tab bar
> before being caught:
>
> 1. Never clone a returned paint to add opacity — the clone re-stores the placeholder and the
>    element renders black while still reporting `bound: true`. Put translucency on the node.
> 2. **Seed the base paint with the variable's real colour**, not a black placeholder:
>    `setBoundVariableForPaint({type:'SOLID', color: WHITE}, 'color', v)`. If the binding has
>    not resolved at paint time, the base colour is what renders.

### 2.10 Macro Stat

Consumed against target for one macronutrient.

| Element | Token |
|---|---|
| Dot | `macro.{m}.indicator` |
| Label | `text.secondary`, `subhead` |
| Value | `text.primary`, `subhead` Semibold — `78 / 120 g` |
| Track / fill | `macro.{m}.track` / `macro.{m}.indicator`, 6pt, `radius.full` |

**Colour is never the only carrier.** Each row states the macro by name and gives both the
consumed figure and the target, so the information survives without colour perception
(WCAG 1.4.1). It replaces the ring badges, which showed a value but never the goal.

### 2.11 Reason Chip

| Property | Values |
|---|---|
| `tone` | `positive` · `neutral` |

`positive` (`feedback.success-surface`) is reserved for calorie/macro fit. `neutral`
(`bg.sunken`) carries attributes — time, diet, protein. Used on recipe cards and in the
Discover recommendation header so the app always says *why* something is suggested.

### Ingredient rows (Recipe Details)

Each row is `icon-well` + name + amount. The well is a 34pt `radius.full` circle filled
`bg.sunken`, holding an 18pt outline icon at 1.35pt stroke in `text.secondary`. The earlier
bare coral icons read as dry; a light well gives the row structure without adding weight.
`bg.raised` was tried first and was invisible against the white sheet.

### Photography

Recipe and meal imagery is real photography, sourced from Pexels (free for commercial use,
no attribution required) and content-matched per dish. Each image layer is named
`photo — <dish>`; swapping one is a single fill change because the scrim and type sit above
it, so legibility never depends on the photograph.
