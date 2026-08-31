# Plate — Calories Calculator

**Jito design test task** — branding, design system, and key screens for a calorie
calculator mobile app, produced with an AI-native workflow using Claude Code.

> **Plate is for people who want to understand their food, not police it.**

---

## Deliverables

| # | Deliverable | Artefact |
|---|---|---|
| 1 | Branding & stylescape | [`branding-strategy.md`](branding-strategy.md) + Figma *Stylescape* section |
| 2 | Design system | [`tokens.json`](tokens.json) · [`design-system.md`](design-system.md) + Figma variables & components |
| 3 | Key screens & flows | [`screens-spec.md`](screens-spec.md) + Figma *Screens & Flows* page |

**Figma file:** https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l
(Cover · [Foundations](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-2) · [Components](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-3) · [Stylescape](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-4) · [Screens](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-5) · [Flows](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-6))
**Video walkthrough:** _<!-- paste your Loom / Google Drive link here -->_

---

## UX rationale

### The composition metaphor

Most calorie apps run on a **deficit** metaphor — a budget you overspend, turning red
when you fail. Plate runs on a **composition** metaphor: a plate you fill. Identical
data, inverted emotionally.

That single decision propagates everywhere:

- There is **no red over-budget state**. Exceeding the target draws an inset amber arc
  and the words "180 over". `feedback.danger` is reserved for deleting a log entry.
- Recipes outside your budget are **not hidden and not marked negatively** — they simply
  carry no match badge.
- Copy has no exclamation marks and no shame vocabulary.

### The macro spine

The three accents pulled from the reference moodboard map **one-to-one** onto the three
macronutrients — coral is carbohydrate, periwinkle is protein, sky is fat — and that
mapping never changes. Learn it once on the dashboard ring and it reads identically on a
recipe card, an ingredient chip, and the calculator breakdown. No legend needed after
first use.

Each macro carries three distinct roles (track / indicator / label) precisely because
accessibility demands it: the pale moodboard tints are beautiful but measure ~2.1:1, so
they are used only for decorative tracks, while the meaning-bearing indicator uses a
600-step that clears the WCAG 3:1 floor.

### Light and airy, on purpose

The interface was refactored against a set of reference designs toward a lighter, more
premium feel. The rules that carry it:

- **No pure white.** Every screen is a vertical gradient from `#FFFFFF` to `sand/100`.
  Imperceptible on its own, but it is what stops white cards from dissolving into the page.
- **Depth from shadow, never from borders.** Cards float on two-layer warm shadows — a
  tight contact layer plus a wide ambient one. Heavy grey containers were removed
  throughout: the tab strip, the search field, the product row, the ingredient list.
- **The number is the screen.** The dashboard hero is a thin semicircular gauge with the
  calorie count at 56pt Heavy in its mouth, rather than a thick ring competing with it.
- **Thin outline icons at 1.5pt**, no filled glyphs.
- **Gradient is rationed** to three places: the canvas wash, the primary CTA, the gauge sweep.

### "Fits your day" beats a number

Screen 3's match badge is computed against the user's **remaining** calories and macros,
not a static "under 400 kcal" threshold. A 520 kcal recipe is a great choice at 8am and
a poor one at 9pm; a fixed ceiling cannot express that, and it is the difference between
a filter and an actual recommendation.

---

## AI-native workflow

The interesting part of this task was not "ask an AI for a palette". It was building a
**verifiable chain** from reference material to shipped design tokens, where each link
is checked by a script rather than by eye.

### 1. Reference extraction, not inspiration

The reference Figma file contained the task brief and a 32-image moodboard — no existing
design. Instead of eyeballing colours, Claude Code:

- sampled 12 representative moodboard images via the Figma MCP,
- ran **k-means clustering** over the combined ~77k-pixel set (`k=10`, then `k=12`
  restricted to chromatic pixels) to find dominant hues,
- surfaced five anchors: coral `#F9A172`, periwinkle `#A19DE7`, sky `#B2D4ED`,
  blush `#FBEAE8`, lavender-grey `#DEDDE4`.

Those five numbers are measurements of the reference, not opinions about it.

### 2. Ramps generated in OKLCH

Full 50–900 ramps were generated in **OKLCH** — perceptually uniform, so a `600` step
means the same visual weight in every hue — then gamut-mapped to sRGB by reducing chroma
until each step was in range. Hand-picking 50 hex values cannot achieve this consistency.

### 3. Contrast checking that changed the design

Every token pair was measured against WCAG 2.2 before anything was drawn. Two results
overrode the aesthetic instinct:

- **White-on-coral fails at every usable tint** (2.96:1 at `coral/500`). Primary buttons
  became coral fill with *ink* text — 6.16:1, and closer to the moodboard anyway.
- **The focus ring measured 2.82:1**, below the 3:1 that WCAG 2.4.11 requires. It moved
  from `periwinkle/500` to `periwinkle/600`.
- The macro indicator tints moved from 400 to 600 for the same reason.

This is the part that is genuinely hard to do by hand and genuinely easy to do with a
script in the loop.

### 4. One source of truth, pushed both directions

`tokens.json` is generated by script and **validated** by another: 210 leaf tokens,
every `$type` present, every `{alias}` resolving to a literal hex, no cycles. The Figma
variable payloads are emitted *from that same file*, so the design file and the repo
cannot drift.

### 5. Steering, and what it cost

Claude Code was steered rather than trusted:

- **Plan first.** The Figma write path was probed with a throwaway page before any real
  work — which immediately revealed the plan tier.
- **Non-destructive by contract.** The reference page and its 31 nodes were never
  modified.
- **Constraints found by hitting them.** The Figma Starter plan surfaced three limits in
  sequence: single variable mode, 3-page cap, and a 20-tool-call *monthly* quota. Each
  forced a documented adaptation rather than a silent workaround — see *Limitations*.

---

## Inspecting the design tokens

`tokens.json` follows the [W3C Design Tokens Community Group format](https://tr.designtokens.org/format/)
— `$value` / `$type` / `$description`, with semantic tokens aliasing primitives.

```bash
# validate structure and resolve every alias
python3 -c "import json; d=json.load(open('tokens.json')); print(len(d), 'top-level groups')"

# see the macro spine
python3 -c "import json; print(json.dumps(json.load(open('tokens.json'))['semantic']['macro'], indent=2))"
```

**Consuming them:**

| Target | How |
|---|---|
| Figma | Import via Tokens Studio, or the generated variable collections already in the file |
| CSS / iOS / Android | [Style Dictionary](https://amzn.github.io/style-dictionary/) — DTCG is supported natively |
| Tailwind | Style Dictionary with a JS-object formatter |

Structure:

```
primitive/   colour ramps (5 × 10), spacing (12), radius (8), font
semantic/    bg · text · accent · macro · feedback · border   (38 aliases)
typography/  12 composite tokens, iOS HIG ramp
elevation/   4 warm-tinted shadows
theme.dark/  20 dark-mode overrides
```

---

## Repository map

```
README.md               this file
branding-strategy.md    brand personality, colour system, type, tone, contrast audit
design-system.md        component architecture — 6 sets, tokens, states, a11y, props
screens-spec.md         4 screens @ 393×852 + 2 flow maps
tokens.json             W3C DTCG design tokens (210 tokens)
```

---

## Limitations

Stated plainly, because pretending otherwise would be the wrong signal:

- **Recipe and hero imagery are placeholders, not photography.** The Figma image API is not
  available through this toolchain, so the `photo` layers carry warm gradient fills. They are
  built to be swapped: the scrim and type sit above the image layer, so replacing a single
  fill with an image paint needs no other change and no contrast re-check.
- **Screens are static specifications.** No prototype wiring and no motion implementation —
  motion is specified in `branding-strategy.md` §8 but not built.
- **Ingredient and navigation icons are hand-drawn SVG**, not SF Symbols. Production would
  use the real symbol set; these exist so the screens read correctly without external assets.
- **19 gradient paints are not variable-bound**, because Figma cannot bind gradients. Their
  values are mirrored by `accent.cta-gradient-*`, `accent.gauge-*` and `bg.canvas-gradient-*`
  tokens, and the audit reports them separately rather than counting them as bound.
- **The component library is not published.** Publishing requires a paid Figma plan; the
  components and variables are local to the file and fully usable there.
- **No production code.** This is a design deliverable; `tokens.json` is the handoff boundary.

### A note on constraints hit along the way

The reference file sits on a Figma Starter plan, which surfaced three hard limits in
sequence: variable collections capped at one mode, files capped at 3 pages, and — the
blocking one — **20 MCP tool calls per month**, which the research phase consumed.

The work moved to a new file on the Education plan, which lifted all three. That is why
dark mode is live rather than specified, and why the file has six pages. The constraint
and the workaround are both recorded here rather than quietly smoothed over.
