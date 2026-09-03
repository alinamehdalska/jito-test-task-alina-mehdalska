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
| Text style | `Title 1` | `typography.title-1` | — |
| Effect style | `Shadow SM` | `shadow.sm` | — |
| Component set | `Button` | — | `variant=primary, size=lg` |

Slash-delimited in Figma (produces folder grouping), dot-delimited in DTCG.

**Dimension scales name themselves.** `space/*` and `radius/*` are both keyed by their own
value — `space/12`, `radius/20` — so a token's name and what it does are the same fact. The
two scales must not disagree: a `radius/lg` beside a `space/16` is two conventions in one
picker, and forces a lookup to answer "how big is large?". The single exception is
`radius/full`, whose 9999 is a sentinel rather than a step.

**Styles are flat and spelled out.** Grouping a text style as `title/1` renders it in the
picker as a bare `1` — the folder name is not visible at the point of use, so the style
arrives with no meaning attached. Every text and effect style is therefore a complete
Title Case phrase: `Title 1`, `Display Calorie`, `Shadow SM`. The DTCG side keeps the
kebab-case slug, which is the convention there; the two map one-to-one.

Text style names follow the **iOS HIG type ramp** — `Large Title`, `Title 1–3`, `Headline`,
`Body`, `Callout`, `Subhead`, `Footnote`, `Caption 1–2` — because the product is an iOS app
and those names are what an engineer building it will already have in their editor.
`Display Calorie` and `Metric Card` are the two additions the HIG ramp has no slot for.

**The ramp carries Emphasized weights, because the screens do.** An audit found 105 text
nodes on the Screens page with no style at all, and 81 of them were Semibold at 15/20 or
12/16 — sizes the ramp had only in Regular. They were not mislabelled; the system was
missing a row. The HIG defines an Emphasized weight at every size, so `Subhead Emphasized`
and `Caption 1 Emphasized` were added and every unstyled node now points at a style. Adding
the two changed nothing visually: they were authored to match what was already rendering.

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

Twenty-one components — twelve variant sets and nine standalone, 93 variants in all.
Every fill, gap, and radius is variable-bound; the token column below is the binding
contract, not a suggestion.

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
| `primary` | solid `accent.primary` | `text.primary` | none | `shadow.xs` |
| `secondary` | `bg.surface` | `accent.primary-strong` | `border.subtle` 1pt | `shadow.xs` |
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
| Shadow | `shadow.xs` |
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

### 2.3 Macro Stat — the linear bar that replaced the ring

One macro's consumed-vs-target as a horizontal bar: dot, name, `consumed / target`, and a
track beneath.

| Property | Values |
|---|---|
| `macro` | `carbs` · `protein` · `fat` |

3 variants, 313 × 34.

| Element | Token |
|---|---|
| Dot | `macro.{m}.indicator` |
| Name | `text.primary`, `Subhead` |
| Value | `text.primary`, `Subhead Emphasized` |
| Track | `macro.{m}.track` |
| Fill | `macro.{m}.indicator` |

- Indicator tints are the 600-step, which clear 3:1 (WCAG 1.4.11). The 400-tints measure
  ~2.1 and do not.
- **Colour never carries the meaning alone.** Every bar shows a dot *and* a name *and*
  consumed/target as text.
- **Over-target does not turn red.** The fill completes and the excess draws in
  `feedback.warning`; `feedback.danger` is reserved for destructive actions.

> **Removed: `Macro Progress Ring`.** The system shipped with a circular version — eight
> variants, `macro` × `size` — and by the end it appeared in exactly one place: an unused
> `Calorie Card` variant modelling an older dashboard. Every live screen had moved to the
> linear bar, because at 64pt a ring gives a number about 30pt of width and the value has to
> shrink to fit, while a bar gives it the full row and puts the target beside it. The ring is
> deleted rather than deprecated: a component nobody instances is a drawing on the library
> page, and it drifts from the product unobserved.

```ts
type MacroStatProps = {
  macro: 'carbs' | 'protein' | 'fat'
  consumed: number
  target: number
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
| Radius | `radius.20` (20) |
| Padding | `space.20` |
| Shadow | `shadow.xs` |
| Title | `text.primary`, `Title 2` |
| Meta | `text.secondary`, `Footnote` |

- `daily-budget` — the dashboard hero: `bg.surface` card at `radius.20`, Hero Gauge above a
  hairline, then three `Macro Stat` bars. It described something else entirely until this
  pass — no card chrome, and three macro *rings* — because the screen had moved on and the
  component had not. It is now built from the live card rather than towards it, and the
  Dashboard holds an instance of it, which is the only thing that keeps the two in step.
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
- Count badge sits trailing, `Caption 1`, on `bg.inverse` with `text.inverse`.
- Selected state carries a checkmark **in addition to** the fill change — colour is
  never the sole indicator.

---

**The pill is as wide as its label.** It was fixed at 120pt, which is narrower than
`Under 400 kcal` at 15pt plus its 16pt padding — the label overflowed by 2pt without a
count and the badge sat 34–56pt outside the pill with one. All six variants hug.

**Selected uses `accent.primary-muted`, not a macro tint.** It was periwinkle/100, which
is the protein colour: selection would have been borrowing a meaning the macro spine
already owns. Ink on the coral tint measures 11.6:1, `accent.primary-strong` 5.1:1.

### 2.7 Hero Gauge

The dashboard focal point. A thin semicircular arc rather than a full ring — it frees the
centre for the number and reads as a gauge rather than a progress donut.

| Element | Token / value |
|---|---|
| Track | `bg.sunken`, 13pt stroke |
| Sweep | gradient `accent.gauge-start → gauge-mid → gauge-end` |
| Value | `display.calorie` (56/58 Heavy Rounded), `text.primary` |
| Caption | `Caption 1`, `text.tertiary` |
| End labels | `Headline` + `Caption 2` at each arc terminus |

- **Diameter 313 — it fills the card interior exactly**, upper semicircle only
  (`startingAngle` π → 2π). Its terminals, the divider and the macro bars all span the same
  40 → 353, and the `Consumed` / `Goal` end labels sit flush with the macro rows' left and
  right edges. Centring alone is not enough here: at the old 300 the remainder was 13pt,
  which Figma splits **7 left / 6 right** because it rounds to whole points. That 1pt is
  invisible in isolation, but the 6.5pt inset against a full-width divider directly beneath
  reads as a lean. A zero remainder removes both.
- **Widening it means editing the component, not the instance.** Instance children reject
  `relative-transform` overrides outright, and every child here is pinned `MIN/MIN`, so a
  bare `resize()` would leave the arc 300 wide and genuinely left-aligned — the very defect
  it was meant to cure. Scale the component's children explicitly; do **not** use
  `rescale()`, which would drag the 56pt value off `display.calorie`.
- **The gradient stops are mapped to the drawn arc, not the bounding box.** A 67% sweep
  ends near x=0.75, so a violet stop at position 1.0 would never be painted — the stops sit
  at 0 / 0.34 / 0.58 / 0.76.
- The arc is decorative: the value is always present as text, so the light start stop is
  permitted below 3:1. The mid and end stops clear it anyway.

**The gauge leads with what is left.** It showed consumed as the centre figure while every
instance showed remaining — the master had been left behind. The product counts down, which
is the whole no-shame position, so the centre is `610 · kcal left` and the two termini carry
`1,240 Consumed` and `1,850 Goal`.

### 2.8 Recipe Card

Image-led card for discovery.

| Property | Values |
|---|---|
| `match` | `fits` · `tight` · `none` |

| Element | Token |
|---|---|
| Photo | named `photo` layer, 170 × 116 — replace fill with an image paint |
| Photo scrim | `photo-scrim`, 170 × 24, absolute, bottom-aligned to the photo — `bg.surface` 0% → 100% |
| Content panel | `bg.surface`, padding `space.12`, gap `space.8` |
| Title | `Headline` on `text.primary` |
| Calories / time | `Subhead` on `text.primary`, `Caption 1` on `text.secondary` |
| Match tag | `feedback.success-surface` fill, `feedback.success` dot + label |

- 170 wide, radius `radius.20`, `shadow.sm`. **Height hugs its content** — currently 240.
- Text sits on an opaque panel **below** the photo, not on a scrim over it. Legibility is
  therefore independent of the image, and any photo can be dropped in without re-checking
  contrast. (An earlier revision used a bottom scrim with `text.on-media`; the panel
  replaced it and this table lagged behind.)
- **The `photo-scrim` softens the seam, it does not carry text.** The photo's last 24pt
  dissolve into `bg.surface`, reaching full opacity exactly on the photo's bottom edge, so
  there is no edge left to see. Frame 5 gets the same effect geometrically — its content
  panel overlaps the hero photo by 24 with a `radius.32` top — but at 170pt wide that reads
  fussy and costs photo height, so the card matches the *effect* rather than the mechanism.
- The scrim is `layoutPositioning: 'ABSOLUTE'`; in the card's vertical auto-layout a flow
  child would push the content panel down instead of overlaying the photo.
- **It is one of the five rationed gradients and cannot bind to a variable.** Its stops are
  `bg.surface`'s Light value at 0% and 100% alpha, hardcoded like the aurora and the
  bottom-fade. In Dark mode `bg.surface` becomes `neutral/800`, so the scrim would need its
  stops re-authored; binding audits count it separately.
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
   | 5 · Recipe Details | controls moved **down** 742 → 756; the bar's fill and shadow are gone, they float on the fade |
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
5. **Any screen with floating bottom chrome carries a `bottom-fade`** — a
   transparent-to-canvas gradient ending at y 852, behind the chrome and above the content.
   That covers the nav screens *and* the two recipe-detail screens, whose stepper and CTA
   now float on the fade rather than on an opaque bar.

   Two constraints govern the geometry, and they pull against each other:

   - **It must reach full canvas alpha at or before the chrome's top edge.** Anything still
     translucent behind 65% glass stays legible through it — the defect the fade exists to
     prevent.
   - **The ramp must not start inside something you want read.** It should cut through an
     image or a neutral band, never a text panel. A ramp that dies halfway down a card's
     title block leaves a washed-out white panel with unreadable text, which reads as *"this
     card has no title"* rather than *"this scrolls"*.

   So the ramp is tuned per screen, not shared:

   | Screen | Ramp | Solid at | Cuts through |
   |---|---|---|---|
   | 1 · Dashboard, 6, 8 | 25 | 756 | below the meal header's label (ends 725), so it stays crisp |
   | 4 · Discovery | 24 | 737 | only the last 24pt of row 2's photo |
   | 5, 5b · Details | 60 | 752 | the ingredient list / instruction steps |

   The dashboard's ramp is short because its chrome sits at 756 while the header it must
   spare ends at 725: there is only 31pt to fade in. Widening the ramp there washes out the
   header; raising it is impossible without leaving content visible through the glass.

   **Discovery's ramp is short for a different reason, and it is the more useful lesson.** A
   grid row cannot be *half* shown well: cut it in the photo and the fade must be heavy
   enough to erase a title panel further down; cut it in the panel and you get washed-out
   unreadable text. So position the grid rather than lean on the gradient — its second row's
   photo bottom edge now lands on y 756, the nav bar's own top edge. The whole photo is
   visible and crisp, the title panel below it is hidden by the *bar* rather than by a
   gradient, and the fade only has to stop that panel showing through 65% glass. Crisp
   photo went from 27pt of 116 to 91 of 116.

   Note it goes solid at **737, not 756** — at the title panel's top edge rather than the nav
   bar's. The 19pt of plain canvas between them costs nothing, and buying the cut that way
   instead of by pushing the grid down returns 20pt of vertical space to the top of the
   screen, where it is worth far more.

   Two complete rows will not fit. That needs the grid to start at y 264 against its current
   369, and the only block big enough to reclaim 105pt is the "Recommended for you" card —
   the personalisation payload of User Story 2. Not a trade worth making.
6. **One elevation level per stacking context.** A card at `shadow.xs` never contains
   another `shadow.xs` card — nested surfaces use `bg.raised`.
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
02 · Components       12 component sets + 9 standalone — 93 variants
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

**Styles:** 16 text styles and 4 effect styles. Fifteen are the type ramp; the sixteenth is
`Wordmark` — 128pt Bold, the Plate logotype. It is a brand asset rather than a step on the
ramp, and it exists as a style for one reason: the mark was set at 128 on the cover and 108
on the brand-core stylescape, which is the same logotype at two arbitrary sizes.

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

**Variant: `Active = Home | Discover | Diary | Profile`.** The lit destination is set on the
instance, not by editing it. Two properties carry the state, and the second is easy to miss:
the label's `fills` **and the icon's `strokes`** — these glyphs are stroked outlines with an
empty `fills` array, so a state copy that only moves fills produces a grey label beside a
coloured glyph, which passes a structural audit unchanged.

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
| Label | `text.secondary`, `Subhead` |
| Value | `text.primary`, `Subhead` Semibold — `78 / 120 g` |
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

### 2.12 Screen chrome

Five structures repeated on every screen and were maintained by hand on each. They are
components now, so a change lands once rather than up to eleven times.

| Component | Instances | Notes |
|---|---|---|
| Status Bar | 11 | **Apple Design Resources**, "Status bar · iPhone", resized from the 402pt device to our 393. Carries the Dynamic Island |
| Home Indicator | 11 | **Apple Design Resources**, resized 144 → 140. Marks the reserved gesture zone y 818–852 that no content may enter |
| Aurora Backdrop | 8 | 393 × 852, four blobs at the canvas layer |
| Bottom Fade | 7 | `Context = Nav \| Discovery \| Detail` |
| Section Tabs | 3 | `Active = Ingredients \| Nutrition \| Instructions` |

### 2.12a Control sizes and touch targets

Every interactive control resolves to one of four heights. The scale is short on purpose:
a fifth size is a decision someone has to justify, and unjustified sizes are how a system
drifts into `56 · 52 · 50 · 46 · 44 · 36` — which is what an audit of this file found.

| Height | Role | Where |
|---|---|---|
| **56** | Floating action button | `log-fab`, one per screen with a tab bar |
| **52** | Primary and sticky CTA | `Button size=lg` — "Log 1 serving to Diary", "Save dish to Diary" |
| **44** | Standard button | `Button size=md`, icon buttons, list-row actions |
| **36** | Chip and filter pill | `Filter Pill`, `Ingredient Chip` |

**Where each may be used, and where it may not**

- **56** is reserved for the FAB. It is the only control allowed to overlap the tab bar,
  and there is never more than one on a screen.
- **52** is one per screen, and only for the action the screen exists to perform. A second
  52 on the same screen means the screen has two primary actions and needs rethinking.
- **44** is the floor for anything tappable, per iOS HIG. It is a *target*, not a look: a
  36pt chip is legal because its row gives it 44 of vertical target, and a 24pt icon is
  legal inside a 44pt frame.
- **36** never appears alone — only as a chip inside a row that supplies the target.

**The four heights are tokens, not prose.** `primitive.size.24 · 36 · 44 · 52 · 56` hold the
values (24 is the icon glyph that sits inside a 44 target) and `semantic.control.icon · chip ·
button · cta · fab` say which control gets which. Components — in Figma and in the coded
prototype — consume `control/*`; a fifth height would have to be added to the scale first,
which is the friction the short scale is meant to create.

**Two targets were smaller than they looked.** Tab bar items were a 41pt cluster inside a
68pt bar, and section tabs were a 30pt strip. Both now fill their container — 68 and 44
respectively — which grows the target without moving a pixel of what is drawn, because the
contents stay centred and the section-tab underline is padded from above only.

### 2.11a Reason Chip — and why an unused component is a liability

`Reason Chip` existed with exactly the variants the product needed — `tone=positive` for
"Fits your calories", `tone=neutral` for "Tight fit" and "High protein" — and nothing
instanced it. The Recipe Card carried its own hand-built copy instead, and the five filter
chips on Discovery were plain frames with padding 12 beside a Filter Pill specifying 16.

That is worse than having no component. Two implementations of one idea drift apart
silently, and the one on the library page is the one nobody sees. Both are instances now.

### 2.12d What the consistency audit exempts

A sweep that flags everything is a sweep nobody runs. Four things fail a naive audit; three
of them should, and the file documents why:

| Exempt | Why |
|---|---|
| `glass-plate` shadow | Authored inline at 0.20 / 0.09 because node opacity 0.65 divides the alphas. Binding it to a shared style halves the shadow |
| aurora `blob` fills | Unbound solids carrying measured opacities — 4.78:1 worst case for `text.secondary` |
| `Dynamic Island` | Black because it is a hardware cutout where the screen is off, not a themed surface |
| Apple status bar internals | Vendor geometry — `padding 2.33 / 9` is Apple's, not ours to snap to a 4pt grid |

Everything else resolves: 0 unstyled text, 0 off-grid spacing, 0 off-scale radii and 0
type-named layers across all seven pages.

### 2.12b Effects, and one deliberate exception

Depth is a system decision, so every drop shadow resolves to `Shadow XS · SM · MD · LG`.
Two things are correctly outside that:

- **Layer blurs.** The aurora blobs carry a 150–165 blur. A blur is not elevation; there is
  no effect style for it and there should not be one.
- **The glass plate.** Its shadow is authored inline at alpha `0.20` and `0.09` rather than
  bound to a style, because the node sits at `0.65` opacity and that multiplies the alphas
  down. Binding it to a shared style halves the shadow — which happened once during this
  pass, and the docs are the only reason it was caught.

### 2.12c Orphan lines

A wrapped line ending in a single short word is a defect in a UI label and a matter of
taste in prose. Labels were rewritten until the tail carries at least two words:
`"These recipes fit your remaining calories and macros for today."` became
`"Matched against the calories and macros you have left."` and now sets on one line.

Two dish titles and three instruction bodies still break to a short tail. They are left
alone on purpose: `Lemon Herb Salmon Bowl` is 22 characters on a 170pt card and will wrap
whatever is done to it, and rewriting recipe method to control a line break makes the copy
worse to win a typographic nicety. Figma has no balanced-wrap; the honest fix would be a
shorter dish name, which is a content decision rather than a system one.

### 2.13 Icon

**Phosphor Icons, regular weight** — [phosphor-icons/core](https://github.com/phosphor-icons/core),
MIT. One `Icon` component set, 22 glyphs, built from the project's own SVG path data so the
geometry is the real thing rather than a redrawing of it.

| Group | Glyphs |
|---|---|
| Navigation | `house` `compass` `notebook` `user` |
| Controls | `plus` `minus` `x` `check` `caret-left` `caret-right` |
| Actions | `magnifying-glass` `scan` `sliders-horizontal` `heart` `star` |
| Content | `clock` `circle-half` `fish` `grains` `leaf` `avocado` `bowl-food` |

- Drawn on a 256 viewBox, placed at **24 × 24**; the tap target around them is 44.
- Default fill is `text.secondary`; instances override to `accent.primary-strong` when
  active, `text.primary` in ink contexts.
- **Regular weight is fill-based, not stroked.** Colour lives on `fills`. Any state logic
  that switches icon `strokes` will change nothing — that mistake left a coral `house`
  beside a grey `Discover` label and passed a structural audit.

### 2.13a Content rows

| Component | Instances | Notes |
|---|---|---|
| Nutrition Row | 9 | Label left, value right. Hairline dividers live in the parent card, not the row |
| Instruction Step | 5 | Index badge, title, body. The number is content — renumber if steps are reordered |
| Dashboard | 3 | The whole home screen. Frames 6 and 8 present overlays on top of an instance |

**The Dashboard existed three times.** Frames 6 and 8 each carried a full copy — 133
descendants against the original's 135, all forty text strings identical. That is the
"sixty edits instead of one" problem in its most literal form, and it is why frame 1 holds
an instance too: without that step the component is merely a fourth copy, and an edit to
frame 1 still never reaches the other two. The trade is that the screen **is** the
component and is edited there rather than on the frame.

A component owns the shape; each instance keeps its own words. Nutrition rows and
instruction steps carry their text as instance overrides, so nine rows do not all read
`Calories · 480 kcal`.

**Native chrome comes from Apple, not from us.** The status bar and home indicator were
hand-built to spec, which was accurate and unattributable — the review's actual complaint
about icons applies identically here. They are now instances of Apple Design Resources.
Two adjustments were needed and both are worth knowing:

- The kit ships the **402pt device** (iPhone 16 Pro); these frames are 393 (15 Pro). The
  status bar reflows correctly because Apple builds it as auto-layout with `Time` and
  `Levels` on FILL either side of a fixed Dynamic Island — the 9pt difference is absorbed
  by the two ends, not by squashing the middle.
- Its internals carry Apple's own colour variables. Time and indicators are **rebound to
  `text.primary`** so the bar stays inside this token system. The Dynamic Island keeps its
  black: it is a hardware cutout where the screen is off, not a themed surface, and it is
  one of only two things on the Screens page exempt from the binding audit.

**The canvas is a gradient and the aurora carries it.** `bg.canvas` is documented as
white → `sand/100`, top to bottom, and the `canvas-gradient-start` / `-end` tokens exist for
it — but the frames were painted flat `sand/100` and the gradient had never been applied.
The consequence was visible rather than theoretical: the four blobs span y −155 to 640, so
below 640 there was no atmosphere at all, and 212pt of dead flat colour sat under every
screen looking like a pod welded to the bottom edge. The gradient now lives on the Aurora
Backdrop component, which puts it under every screen that uses one.

Frames 5, 5b and 5c have no aurora — their surface is white, because a photo occupies the
top and the content panel below it is `bg.surface`. Their fade therefore lands on **white**;
landing it on `sand/100` painted a warm band belonging to nothing above it.

**Aurora opacities are load-bearing.** `0.35 / 0.32 / 0.31 / 0.26` is the richest setting at
which a three-blob overlap still clears 4.6:1 for `text.secondary`; the next step up fails at
4.44. They are also the reason the four blob fills are the only unbound solid fills on the
Screens page — `bg.aurora-*` tokens mirror them, but rebinding changes the paint and so
demands a re-measure. Left as-is, deliberately.

**Bottom Fade cannot be one component.** The ramp has to satisfy two constraints that pull
apart: solid **at or before** the chrome's top edge, or content stays legible through 65%
glass; and it must not **start** inside something that has to be read. Where the chrome sits
and what sits above it differs per layout, so the ramp does:

| Context | Height | Solid at | Ramp |
|---|---|---|---|
| Nav — Dashboard, 6, 8 | 121 | 756 | 25 |
| Discovery | 139 | 737 | 24 |
| Detail — 5, 5b, 5c | 160 | 752 | 60 |

**Section Tabs carries four properties, not one** — label `fontName`, label `fills`, the
indicator's `layoutSizingHorizontal`, and the indicator's own `fills`. Copying a subset
yields an indicator measuring the right width with no paint on it, beside a deselected label
still set in Semibold. The three variants were cloned from the three working states rather
than rebuilt, which carries the bindings and avoids constructing a paint at all.

**The active indicator is `accent.primary-strong`, not `accent.primary`.** It was the
lighter tint, which measured **2.23:1** on surface — below the 3:1 non-text floor this
document sets for indicators in §2.3, and the same 400-tint trap already documented for the
gauge and the macro bars. State is also carried by label weight and colour, so it was never
colour-alone, but the underline is the primary affordance and had to clear the floor on its
own. It now measures **6.04:1** on surface and 5.85:1 on canvas. The underline reads a shade
deeper; that is the whole cost.

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
