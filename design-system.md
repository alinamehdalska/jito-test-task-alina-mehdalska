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

| Variant | Fill | Label | Border |
|---|---|---|---|
| `primary` | `accent.primary` | `text.primary` | none |
| `secondary` | `accent.primary-muted` | `accent.primary-strong` | none |
| `tertiary` | transparent | `accent.primary-strong` | none |
| `destructive` | `feedback.danger-surface` | `feedback.danger` | none |

**Why primary uses `text.primary`, not `text.inverse`:** white on coral fails WCAG at
every usable tint. See `branding-strategy.md` §4.

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
| Container fill | `bg.sunken` |
| Border (rest) | `border.interactive` |
| Border (focus) | `border.focus`, 2pt, 2pt offset |
| Placeholder | `text.tertiary` |
| Value | `text.primary` |
| Icons | `text.secondary` |

- Height 52, radius `radius.lg`, gap `space.12`.
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

- Stroke `sm` 6pt / `lg` 14pt, round caps, 12 o'clock start, clockwise.
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

- `daily-budget` — `lg` total ring + three `sm` macro rings. Dashboard hero.
- `meal-entry` — thumbnail, name, kcal, macro bar, quick-add. List row.
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
02 · Components       the 6 component sets below — 52 variants
03 · Stylescape       brand core · UI atmosphere · product in context
04 · Screens          4 iOS screens @ 393 × 852
05 · Flows            2 user-story flow maps
```

**Variable collections**

| Collection | Modes | Count | Scopes |
|---|---|---|---|
| `Primitives` | `Value` | 78 | `[]` — private |
| `Semantic` | `Light`, `Dark` | 38 | role-scoped |

Semantic variables also carry `WEB` and `iOS` code syntax
(`var(--plate-accent-primary)` / `Color.accentPrimary`), so Dev Mode hands engineers
the real token name rather than a hex value.

**Styles:** 12 text styles and 4 effect styles, generated from the same `tokens.json`.
