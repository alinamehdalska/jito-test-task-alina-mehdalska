# Plate — Branding & Stylescape Strategy

> A calorie calculator that leads with the dish, not the deficit.

**Deliverable 1 of 3** for the Jito design test task. This document defines the brand
foundation that `tokens.json` encodes and the Figma library implements.

---

## 1. How this direction was derived

The reference Figma file contained no existing design — one empty artboard and a
32-image moodboard of pastel-gradient nutrition and wellness apps. Rather than eyeball
a palette from those images, the colours were **extracted programmatically**:

1. Twelve representative moodboard images were sampled at 80×80px.
2. K-means clustering (k=10, then k=12 restricted to chromatic pixels) found the
   dominant hues across the combined ~77k pixel set.
3. The surviving anchors — coral `#F9A172`, periwinkle `#A19DE7`, sky `#B2D4ED`,
   blush `#FBEAE8`, lavender-grey `#DEDDE4` — became the ramp seeds.
4. Full 50–900 ramps were generated in **OKLCH** for perceptual evenness, then
   gamut-mapped back to sRGB by reducing chroma until each step was in range.
5. Every resulting pair was **contrast-tested against WCAG 2.2**, and the palette was
   adjusted where it failed. Those adjustments are documented in §5 — they changed
   real design decisions, not just numbers.

The scripts are in the repo history; the output is `tokens.json`.

---

## 2. Brand personality

### Positioning

> **Plate is for people who want to understand their food, not police it.**
> It answers "what am I actually eating?" in under five seconds, and "what could I eat
> instead?" without ever implying the first answer was a failure.

Most calorie apps are built on a deficit metaphor: a budget you overspend, turning red
when you fail. Plate is built on a **composition metaphor** — a plate you fill. The
same data, inverted emotionally. That single decision drives the colour system (no
punitive red), the copy, and the shape language.

### Five attributes

| Attribute | What it means | How it shows up |
|---|---|---|
| **Warm** | Food is pleasure, not arithmetic | Coral leads; warm-biased greys; blush surfaces |
| **Precise** | The numbers are correct and legible | Tabular figures, per-gram breakdowns, real portions |
| **Calm** | Never alarms, never nags | No red overage state; wide spacing; soft elevation |
| **Effortless** | Three taps to log anything | Scan-first entry, quick-add on every card |
| **Honest** | Shows the estimate's confidence | "≈" on inferred values, source on every product |

### Voice & tone

- **Plain, second person, present tense.** "You've logged 1,240 kcal." Not "Your daily
  consumption total currently stands at…"
- **Numbers lead sentences** when a number is the point.
- **Neutral about overages.** "180 over" — never "You exceeded your limit!"
- **No exclamation marks.** Ever. Enthusiasm reads as pressure in this category.

### What Plate is *not*

These are hard constraints on the system, not stylistic preferences:

- **No shame language.** No "cheat", "guilt", "sinful", "burn it off", "earn it".
- **No red for being over budget.** Over-budget uses `feedback.warning` (amber) at most.
  `feedback.danger` is reserved for destructive actions — deleting a log entry.
- **No streak-breaking.** Missing a day does not destroy anything the user built.
- **No body imagery.** Photography is food, hands, kitchens — never bodies or scales.
- **No green = good / red = bad.** Macro colours are identity, not judgement.

### Naming rationale

**Plate** — the object food actually arrives on. It is concrete where competitors are
abstract (*MyFitnessPal*, *Lose It!*, *Cronometer*), it contains no verb and no
imperative, and it carries zero diet-culture baggage. It also gives the interface a
natural container metaphor: the daily ring *is* the plate, filling as you eat.

---

## 3. Colour system

The palette is a **five-ramp system**: three chromatic accents that carry meaning, one
warm surface neutral, and one ink ramp.


#### Coral

*Primary — energy, warmth, appetite. Carries the brand.*

| Step | Hex | HSL |
|---|---|---|
| `coral/50` | `#FFF4EF` | hsl(19 100% 97%) |
| `coral/100` | `#FFE7DC` | hsl(19 100% 93%) |
| `coral/200` | `#FFD1BA` | hsl(20 100% 86%) |
| `coral/300` | `#FEB691` | hsl(20 98% 78%) |
| `coral/400` | `#F0986A` | hsl(21 82% 68%) |
| `coral/500` | `#DB7E49` | hsl(22 67% 57%) |
| `coral/600` | `#C06530` | hsl(22 60% 47%) |
| `coral/700` | `#9B4D1E` | hsl(23 68% 36%) |
| `coral/800` | `#723610` | hsl(23 75% 25%) |
| `coral/900` | `#4A2006` | hsl(23 85% 16%) |

#### Periwinkle

*Secondary — calm, considered. Balances coral's heat.*

| Step | Hex | HSL |
|---|---|---|
| `periwinkle/50` | `#F6F6FF` | hsl(240 100% 98%) |
| `periwinkle/100` | `#EBEBFF` | hsl(240 100% 96%) |
| `periwinkle/200` | `#D9D8FF` | hsl(242 100% 92%) |
| `periwinkle/300` | `#C3C1FF` | hsl(242 100% 88%) |
| `periwinkle/400` | `#ABA7F2` | hsl(243 74% 80%) |
| `periwinkle/500` | `#948EDF` | hsl(244 56% 72%) |
| `periwinkle/600` | `#7C76C4` | hsl(245 40% 62%) |
| `periwinkle/700` | `#615C9F` | hsl(244 27% 49%) |
| `periwinkle/800` | `#464175` | hsl(246 29% 36%) |
| `periwinkle/900` | `#2B284C` | hsl(245 31% 23%) |

#### Sky

*Tertiary — cool, clinical, trustworthy.*

| Step | Hex | HSL |
|---|---|---|
| `sky/50` | `#F0F8FE` | hsl(206 88% 97%) |
| `sky/100` | `#E1EFF9` | hsl(205 67% 93%) |
| `sky/200` | `#C9E0F1` | hsl(206 59% 87%) |
| `sky/300` | `#ACCEE7` | hsl(205 55% 79%) |
| `sky/400` | `#8DB7D5` | hsl(205 46% 69%) |
| `sky/500` | `#72A0C1` | hsl(205 39% 60%) |
| `sky/600` | `#5A87A7` | hsl(205 30% 50%) |
| `sky/700` | `#446B86` | hsl(205 33% 40%) |
| `sky/800` | `#2F4D62` | hsl(205 35% 28%) |
| `sky/900` | `#1B303F` | hsl(205 40% 18%) |

#### Blush

*Warm neutral surface — softens white without tinting content.*

| Step | Hex | HSL |
|---|---|---|
| `blush/50` | `#FEF4F3` | hsl(5 85% 97%) |
| `blush/100` | `#F9E8E6` | hsl(6 61% 94%) |
| `blush/200` | `#F1D5D1` | hsl(8 53% 88%) |
| `blush/300` | `#E6BEB9` | hsl(7 47% 81%) |
| `blush/400` | `#D4A39E` | hsl(6 39% 73%) |
| `blush/500` | `#BF8B85` | hsl(6 31% 64%) |
| `blush/600` | `#A5736E` | hsl(5 23% 54%) |
| `blush/700` | `#845955` | hsl(5 22% 43%) |
| `blush/800` | `#603F3C` | hsl(5 23% 31%) |
| `blush/900` | `#3E2725` | hsl(5 25% 19%) |

#### Neutral

*Ink and structure. Warm-biased so greys never read clinical.*

| Step | Hex | HSL |
|---|---|---|
| `neutral/50` | `#FBFBFC` | hsl(240 14% 99%) |
| `neutral/100` | `#EDECF0` | hsl(255 12% 93%) |
| `neutral/200` | `#DCDBE2` | hsl(249 11% 87%) |
| `neutral/300` | `#C9C7D1` | hsl(252 10% 80%) |
| `neutral/400` | `#B1AFBB` | hsl(250 8% 71%) |
| `neutral/500` | `#9A98A5` | hsl(249 7% 62%) |
| `neutral/600` | `#82808C` | hsl(250 5% 53%) |
| `neutral/700` | `#6E645C` | hsl(27 9% 40%) |
| `neutral/800` | `#51473F` | hsl(27 12% 28%) |
| `neutral/900` | `#362B23` | hsl(25 21% 17%) |
#### Sand

*Warm neutral introduced in the airy refactor. Carries the canvas gradient, raised
surfaces and hairlines — it replaces the cooler grey that made the interface read as
clinical.*

| Step | Hex |
|---|---|
| `sand/50` | `#FDFCFA` |
| `sand/100` | `#F9F6F3` |
| `sand/200` | `#F2EFEA` |
| `sand/300` | `#E6E2DD` |
| `sand/400` | `#D4D0CA` |
| `sand/500` | `#BAB7B1` |
| `sand/600` | `#95928C` |
| `sand/700` | `#6E6B67` |
| `sand/800` | `#4C4A46` |
| `sand/900` | `#2F2E2B` |


### The macro spine

The single most important decision in the system: **the three moodboard accents map
one-to-one onto the three macronutrients.**

| Macro | Hue | Track | Indicator | Label |
|---|---|---|---|---|
| **Carbs** | Coral | `coral/100` | `coral/600` | `coral/700` |
| **Protein** | Periwinkle | `periwinkle/100` | `periwinkle/600` | `periwinkle/700` |
| **Fat** | Sky | `sky/100` | `sky/600` | `sky/700` |

Because this mapping is fixed, a user learns it once and reads it everywhere — the
dashboard ring, the calculator breakdown, a recipe card's macro preview, an ingredient
chip. No legend required after first use.

Each macro carries **three roles**, and the distinction is what makes the system
accessible rather than merely pretty:

- **Track** — the pale unfilled portion of a ring or bar. Decorative; no contrast floor.
- **Indicator** — the filled portion. This carries the meaning, so it must clear
  **3:1** against its background (WCAG 1.4.11). The pale 400-tints from the moodboard
  measured 2.06–2.16:1 and were **rejected**; the 600-tints are used instead.
- **Label** — the text. Must clear **4.5:1** on its own pale surface.

Colour is never the sole carrier: every ring and chip is always paired with a text
label and a gram value.

### Semantic assignments

| Token | Resolves to | Purpose |
|---|---|---|
| `bg.canvas` | `neutral/50` | App background |
| `bg.surface` | `white` | Cards, sheets |
| `bg.raised` | `blush/50` | Nested surfaces inside a card |
| `bg.sunken` | `neutral/100` | Wells, ring tracks, skeletons |
| `text.primary` | `neutral/900` | Body and headings |
| `text.secondary` | `neutral/700` | Supporting copy |
| `text.tertiary` | `neutral/600` | Metadata — large sizes only |
| `accent.primary` | `coral/400` | Primary button fill |
| `accent.primary-strong` | `coral/700` | Coral *text* on pale surfaces |
| `border.interactive` | `neutral/600` | Control boundaries |
| `border.focus` | `periwinkle/600` | 2pt focus ring |

---

## 4. Two decisions the contrast audit forced

Worth stating plainly, because both overrode the aesthetic instinct:

**1. Primary buttons are coral with *ink* text, not white text.**
White-on-coral fails at every usable tint — 2.96:1 at `coral/500`, 4.08:1 at
`coral/600`. Pushing coral dark enough for white text (`coral/700`, 6.04:1) produces a
muddy brown that abandons the moodboard entirely. Coral/400 with `text.primary` gives
**6.16:1** and looks like the reference. The accessible answer was also the prettier one.

**2. The focus ring moved from `periwinkle/500` to `periwinkle/600`.**
The original measured 2.82:1 — below the 3:1 that WCAG 2.4.11 requires of focus
indicators. This is the kind of defect that ships invisibly and fails an audit later.

---

## 5. Contrast verification

Every pair below was computed from the actual token values, not estimated. The canvas
figure uses `sand/100` — the **darkest end** of the background gradient, i.e. the worst case.

| Foreground | Background | Ratio | Grade |
|---|---|---|---|
| `text.primary` `#362B23` | `bg.canvas (gradient end)` `#F9F6F3` | **12.78:1** | AAA |
| `text.primary` `#362B23` | `bg.surface` `#FFFFFF` | **13.76:1** | AAA |
| `text.secondary` `#6E645C` | `bg.canvas` `#F9F6F3` | **5.36:1** | AA |
| `text.secondary` `#6E645C` | `bg.surface` `#FFFFFF` | **5.77:1** | AA |
| `text.tertiary` `#82808C` | `bg.canvas` `#F9F6F3` | **3.6:1** | AA-lg |
| `text.primary` `#362B23` | `accent.cta-gradient-start` `#FEB691` | **8.07:1** | AAA |
| `text.primary` `#362B23` | `accent.cta-gradient-end` `#DB7E49` | **4.65:1** | AA |
| `accent.primary-strong` `#9B4D1E` | `bg.canvas` `#F9F6F3` | **5.61:1** | AA |
| `macro.carbs.label` `#9B4D1E` | `macro.carbs.surface` `#FFF4EF` | **5.6:1** | AA |
| `macro.protein.label` `#615C9F` | `macro.protein.surface` `#F6F6FF` | **5.52:1** | AA |
| `macro.fat.label` `#446B86` | `macro.fat.surface` `#F0F8FE` | **5.3:1** | AA |
| `feedback.success` `#30815E` | `bg.surface` `#FFFFFF` | **4.74:1** | AA |

**Non-text contrast** (WCAG 1.4.11 — 3:1 for meaningful graphics):

| Element | Background | Ratio | Grade |
|---|---|---|---|
| `gauge sweep — mid` `#C06530` | `bg.surface` `#FFFFFF` | **4.08:1** | PASS |
| `gauge sweep — end` `#7C76C4` | `bg.surface` `#FFFFFF` | **4.0:1** | PASS |
| `macro.carbs.indicator` `#C06530` | `bg.surface` `#FFFFFF` | **4.08:1** | PASS |
| `macro.protein.indicator` `#7C76C4` | `bg.surface` `#FFFFFF` | **4.0:1** | PASS |
| `macro.fat.indicator` `#5A87A7` | `bg.surface` `#FFFFFF` | **3.85:1** | PASS |
| `border.interactive` `#82808C` | `bg.surface` `#FFFFFF` | **3.88:1** | PASS |
| `border.focus` `#7C76C4` | `bg.canvas` `#F9F6F3` | **3.72:1** | PASS |

**`text.disabled` is intentionally below AA.** WCAG 1.4.3 exempts disabled controls. It is
never used for enabled content, and disabled states always carry a second signal.

**The hero gauge's lightest stop sits below 3:1 on purpose.** The gauge is decorative —
the calorie value is always present as text beside it — so WCAG 1.4.11 does not apply.
The mid and end stops clear 3:1 anyway, which is why the sweep reads as rich rather than pale.

## 6. Typography

**SF Pro** — verified present in the Figma file, so the design file and the iOS build
share one typeface with no substitution drift. **SF Pro Rounded** is used only for
large numerics, where its softer terminals suit the ring readouts.

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-calorie` | 56 / 58 | Heavy | −1.6 | Dashboard hero readout only (Rounded, tabular) |
| `metric-card` | 28 / 32 | Semibold | −0.4 | In-card calorie figures (Rounded, tabular) |
| `large-title` | 40 / 44 | Bold | −1.0 | Screen titles — expressive |
| `title-1` | 28 / 34 | Bold | +0.36 | Section heroes |
| `title-2` | 22 / 28 | Semibold | +0.35 | Card titles |
| `title-3` | 20 / 25 | Semibold | +0.38 | Subsection headers |
| `headline` | 17 / 22 | Semibold | −0.43 | List leads, emphasised body |
| `body` | 17 / 22 | Regular | −0.43 | Default reading size |
| `callout` | 16 / 21 | Regular | −0.31 | Secondary body |
| `subhead` | 15 / 20 | Regular | −0.23 | Chips, supporting copy |
| `footnote` | 13 / 18 | Regular | −0.08 | Metadata |
| `caption-1` | 12 / 16 | Regular | 0 | Ring and icon labels |
| `caption-2` | 11 / 13 | Regular | +0.06 | Densest auxiliary text |

Sizes and tracking follow the iOS HIG type ramp so the app inherits Dynamic Type
behaviour for free. **All numerals use tabular figures** — a calorie count that
reflows its width while incrementing reads as unstable.

---

## 7. Space, shape, elevation

**Grid — 4/8pt.** Steps: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. `2` is the only
sub-grid value and exists solely for optical nudges (icon baselines against text).

**Screen margin is 20pt**, not 16pt — the wider gutter is what makes the interface feel
calm rather than dense, and it matches the moodboard's generous framing.

**Radius.** `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 · `full`.
Cards use `xl` (20), sheets `3xl` (32), pills and rings `full`. Generous radii are the
single strongest carrier of the moodboard's soft-UI character.

**Elevation.** Four levels, each built from **two** layers — a tight contact shadow plus a
wide ambient one — and all warm-tinted: they use `neutral/900` (`#362B23`) rather than
black, so they stay inside the palette instead of greying it.

| Level | Contact layer | Ambient layer | Use |
|---|---|---|---|
| `1` | 0 1 2 @ 3% | 0 4 12 −2 @ 5% | Resting cards |
| `2` | 0 2 4 −1 @ 3% | 0 8 20 −4 @ 7% | Raised cards, slider thumbs |
| `3` | 0 4 8 −2 @ 4% | 0 16 32 −8 @ 9% | Sheets, tab bar, sticky CTAs |
| `4` | 0 8 16 −4 @ 5% | 0 24 48 −12 @ 11% | The log FAB |

Negative spread keeps the shadow tucked under the card. The two-layer construction is what
makes cards read as *floating* rather than outlined — depth comes from shadow, never from
a border.

---

## 8. Visual tone

**Surfaces.** White cards on a near-white canvas, separated by radius and soft shadow
rather than borders. Blush (`bg.raised`) marks nesting one level deep.

**Background.** Never pure white, and never a flat wash. Every screen carries a
four-colour **aurora mesh** over a `sand/50` base — peach (`coral/200` at 35%), lavender
(`periwinkle/200` at 32%), pastel blue (`sky/200` at 31%) and pink (`blush/200` at 26%),
each at 150–165pt layer blur.

**Those opacities are a solved value, not a taste call.** They are the richest setting at
which a *three-blob overlap* — the worst case on the canvas — still clears AA for secondary
text. At the originally-tried strength the same overlap measured 4.44:1 for `text.secondary`
and 2.98:1 for `text.tertiary`, both failures. Scaled to 77% they measure **4.6:1 and 3.09:1**,
with `text.primary` at 10.97:1.

**Gradient.** Four sanctioned uses and no others: the aurora canvas, the calorie gauge sweep,
the recipe-card scrim, and the bottom fade beneath the floating nav. Primary buttons are
solid — decoration on the most-used control made the interface read softer than it should.
Figma cannot bind gradients to variables, so each is mirrored by `accent.gauge-*` and
`bg.aurora-*` tokens holding the same values.

**Iconography.** SF Symbols, Regular weight, 24pt nominal. Icons inherit `text.secondary`
unless they carry macro identity.

**Photography.** Food, overhead or three-quarter, natural light, warm cast, shallow
depth of field. Hands and kitchens are welcome. **Bodies, scales, and before/after
framing are prohibited** — see §2.

**Motion.** 200ms ease-out for state changes, 320ms for sheet presentation. Rings
animate their sweep on first paint only. Nothing pulses or bounces; the brand is calm.

---

## 9. Dark mode

Dark mode is **live** in Figma as the `Dark` mode of the `Semantic` variable collection,
and mirrored in `tokens.json` under `theme.dark`. Both are generated from the same source,
so they cannot drift. Switch the mode in Figma's variables panel and every screen reflows.

The inversion is not mechanical:

- Surfaces lift from `neutral/900` to `neutral/800` rather than sinking to pure black.
- **Macro indicators move *up* the ramp** (600 → 400) because contrast requirements
  reverse against a dark ground. Verified: carbs 4.05:1, protein 4.11:1, fat 4.25:1 —
  all clear the 3:1 non-text floor.
- Macro chips invert to a 900-tint surface with a 300-tint label, measuring 8.2:1.
- Feedback colours swap roles: the pale tint becomes the text, on a neutral raised surface.

35 semantic tokens carry a dark override.
