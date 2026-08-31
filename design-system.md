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
| `primary` | gradient `coral/300 → coral/500` | `text.primary` | none | `elevation.2` |
| `secondary` | `bg.surface` | `accent.primary-strong` | `border.subtle` 1pt | `elevation.1` |
| `tertiary` | transparent | `accent.primary-strong` | none | none |
| `destructive` | `feedback.danger-surface` | `feedback.danger` | none | none |

**Why primary uses `text.primary`, not `text.inverse`:** white on coral fails WCAG at
every usable tint. The gradient was chosen so the ink label clears AA at *both* stops —
8.07:1 at the start, 4.65:1 at the end. A `coral/400 → coral/600` sweep looks similar but
drops the label to 3.37:1 and fails.

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
| `removable` | `bg.sunken` | `text.secondary` | none, + 20pt close target |

- Height 32, radius `radius.full`, padding `space.12`, gap `space.8`.
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
| Photo | named `photo` layer — replace fill with an image paint |
| Scrim | vertical gradient, ink 0 → 0.86 |
| Title / calories | `text.on-media` |
| Match tag | `border.on-media` fill 18%, stroke 75% |

- 170 × 232, radius `radius.xl`, `elevation.2`.
- Title and calories sit **on the scrim**, so legibility is guaranteed by the overlay rather
  than by the photograph — any image can be dropped in without re-checking contrast.
- The match tag is a thin outline, not a filled badge.

## 3. Composition rules

1. **Screen margin is `space.20`.** Cards may bleed to `space.16` only in horizontal
   scrollers.
2. **Vertical rhythm:** `space.24` between sections, `space.12` within a section,
   `space.8` between tightly-coupled elements.
3. **One elevation level per stacking context.** A card at `elevation.1` never contains
   another `elevation.1` card — nested surfaces use `bg.raised` instead.
4. **Touch targets are 44pt minimum**, including the scan button and chip close buttons.
5. **Macro order is always carbs → protein → fat.** Never re-sorted by value.
6. **Numbers are tabular** everywhere they can change.

---

## 4. Figma library structure

[Open the Figma file](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l)

```
00 · Cover            index and token-pipeline notes
01 · Foundations      colour ramps, semantic groups, macro spine,
                      type specimen, spacing, radius, elevation
02 · Components       the 8 component sets below — 56 variants
03 · Stylescape       brand core · UI atmosphere · product in context
04 · Screens          4 iOS screens @ 393 × 852
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

| Element | Value |
|---|---|
| Container | 353 × 68, `radius.full` |
| Fill | `bg.surface` at 72% |
| Backdrop | `BACKGROUND_BLUR` 24 |
| Border | `bg.surface` at 65%, 1pt inside |
| Shadow | 0 10 28 −6 @ 10% + 0 2 6 −2 @ 5% |
| FAB | 50pt, CTA gradient, seated inside the pill |

The translucent fill is what makes the blur read — a fully opaque pill would blur nothing.
Content is allowed to scroll under it; that is the point of the treatment.

### Photography

Recipe and meal imagery is real photography, sourced from Pexels (free for commercial use,
no attribution required) and content-matched per dish. Each image layer is named
`photo — <dish>`; swapping one is a single fill change because the scrim and type sit above
it, so legibility never depends on the photograph.
