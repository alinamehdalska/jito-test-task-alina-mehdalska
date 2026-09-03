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
| 3 | Key screens & flows | [`screens-spec.md`](screens-spec.md) + Figma *Screens* page — 11 frames, wired as a clickable prototype, and presented on device in *Presentation* |
| 4 | Coded prototype | [`prototype/`](prototype/README.md) — the 11 frames as a React app generated from the same `tokens.json`, with live data, scrolling and motion |

**Figma file:** https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l
(Cover · [Foundations](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-2) · [Components](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-3) · [Stylescape](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-4) · [Screens](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-5) · [Flows](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=1-6) · [Moodboard](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=163-214) · [Presentation](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l?node-id=271-2))
**Clickable prototype:**
[US1 · Log a meal](https://www.figma.com/proto/lzCgTFcfrlE8qGqYbBTh7l?node-id=67-130&starting-point-node-id=67-130) ·
[US2 · Find a recipe that fits](https://www.figma.com/proto/lzCgTFcfrlE8qGqYbBTh7l?node-id=71-107&starting-point-node-id=71-107)
**Coded prototype:** _live link added after the Vercel deploy_ · [how it is built](prototype/README.md)
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

- **No pure white, no flat wash.** Every screen carries a four-colour aurora mesh — peach,
  lavender, pastel blue and pink at 150–165pt blur. The opacities are a *solved* value: the
  richest setting at which a three-blob overlap still clears AA for secondary text (4.6:1).
  At the strength first tried, that overlap failed at 4.44:1.
- **Depth from shadow, never from borders.** Cards float on two-layer warm shadows — a
  tight contact layer plus a wide ambient one. Heavy grey containers were removed
  throughout: the tab strip, the search field, the product row, the ingredient list.
- **The number is the screen.** The dashboard hero is a thin semicircular gauge with the
  calorie count at 56pt Heavy in its mouth, rather than a thick ring competing with it.
- **Thin outline icons at 1.5pt**, no filled glyphs.
- **A floating glass tab bar** — a translucent, backdrop-blurred pill inset from the edges,
  with content scrolling beneath it.
- **Two calorie scales, not one.** The dashboard hero is 56pt Heavy; figures inside cards
  use a lighter 28pt Semibold so they sit in the hierarchy instead of shouting over it.
- **Gradient is rationed to five uses** — the canvas gradient, the aurora blobs, the calorie gauge sweep, the **photo scrim**
(the recipe card's panel seam and screen 5's status band), and the bottom fade beneath
the floating nav. Primary buttons are solid.
  The CTA gradient was removed in the product pass — decoration on the most-used control made
  the interface read softer than it should.
- **Colour never carries meaning alone.** Every macro states its name and its
  consumed/target figures alongside the colour.

### Both halves of User Story 1

The earlier design calculated calories for a **product** but not for a **dish**, which left
half the first user story unbuilt. The Calculator now opens on a Product / Dish switch, and
a dedicated Dish Calculator lets the user assemble ingredients, set servings and see both
the dish total and the per-serving figure before saving.

The serving-size slider was removed. A continuous slider cannot express an exact gram value,
which is the one thing that screen exists to capture — preset chips plus a stepper replace it.

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

Colour is only half of what a reference set is for. The **`06 · Moodboard`** page holds
sixteen interface references, each carrying a note that records two things: what the
reference actually does, and where that decision landed in Plate. Three are kept as
counter-examples — traffic-light colour coding, four competing statistics panels, and
delivery-app red — where the note says what was rejected and why. A board that only records
agreement is a mood; one that records refusals is an argument.

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

`tokens.json` is generated by script and **validated** by another: 240 leaf tokens,
every `$type` present, every `{alias}` resolving to a literal hex, no cycles. The Figma
variable payloads are emitted *from that same file*, so the design file and the repo
cannot drift — and so is the coded prototype's Tailwind theme
([`prototype/src/tokens`](prototype/src/tokens)), where a test compares the committed CSS
with a fresh generation on every run. Primitive colours get no utility class there at all,
the code equivalent of scoping them `[]` in Figma.

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
| Tailwind | Done in this repo: `prototype/src/tokens/generate.ts` emits a v4 `@theme` from the file |

Structure:

```
primitive/   colour ramps (6 × 10), spacing (14), radius (8), font, size, blur, motion
semantic/    bg · text · accent · macro · feedback · border · control   (54 aliases)
typography/  15 composite tokens, iOS HIG ramp
shadow/      4 warm-tinted, two-layer shadows
theme.dark/  44 dark-mode overrides
```

---

## Repository map

```
README.md               this file
branding-strategy.md    brand personality, colour system, type, tone, contrast audit
design-system.md        component architecture — 12 variant sets + 9 standalone, tokens, states, a11y
screens-spec.md         11 frames @ 393×852, both user stories, the prototype's flow maps
tokens.json             W3C DTCG design tokens (240 tokens) — feeds Figma and the code
tools/                  the Figma Plugin API scripts that built and audited the file
prototype/              the coded prototype (Vite + React + Tailwind v4), see its README
```

---

## Photography

All food imagery is real photography from [Pexels](https://www.pexels.com), free for
commercial use with no attribution required. Each shot was content-matched to its dish and
visually verified before use — a raw-sashimi shot and a non-aubergine grain bowl were both
rejected during selection, and one recipe was renamed to match the photograph rather than
mislabel it.

| Screen | Dish | Pexels ID |
|---|---|---|
| Dashboard | Greek yogurt bowl | `10421049` |
| Dashboard | Chicken & quinoa salad | `9893176` |
| Calculator | Greek Yogurt, 2% | `4601975` |
| Discovery / Details | Lemon Herb Salmon Bowl | `15913488` |
| Discovery | Miso Rice & Egg Bowl | `6823336` |
| Discovery | Chickpea Shakshuka | `6275165` |
| Discovery | Seared Tuna Niçoise | `12173347` |

## Limitations

Stated plainly, because pretending otherwise would be the wrong signal:

- **The Figma prototype navigates; it does not scroll.** All 48 links are wired, but Figma
  splits a frame's children into one scrolling and one fixed section, and *fixed children
  always render on top of scrolling ones* — the aurora backdrop needs to be fixed **and**
  behind the content, which that model cannot express. **The coded prototype closes this:**
  every screen scrolls under its floating chrome there.
- **Motion is built only in code.** `branding-strategy.md` §8 defines the motion language;
  the Figma prototype uses its own push, dissolve and timed transitions, the coded one plays
  them through the View Transitions API.
- **Profile has no screen.** Its tab is inert in Figma and a placeholder in code. The Figma
  prototype resolves all four recipe cards to the single detail frame; the code gives each
  recipe its own.
- **Three numbers in the calculator frame disagree** — 59 kcal per 100 g, 142 kcal for 170 g,
  and a per-macro column that sums to 123. The code computes from real label data (73 kcal
  per 100 g, 124 for the serving); the frame is queued for the same correction.
- **`text.tertiary` appears in small captions** at 3.6–3.9:1 although the contract records it
  as large-text only. Both prototypes reproduce the design as drawn; the fix is a design
  decision, not a code one.
- **19 gradient paints are not variable-bound**, because Figma cannot bind gradients. Their
  values are mirrored by `accent.gauge-*`, `bg.aurora-*` and `bg.canvas-gradient-*` tokens,
  and the audit reports them separately rather than counting them as bound.
- **The component library is not published.** Publishing requires a paid Figma plan; the
  components and variables are local to the file and fully usable there.
- **The coded prototype is a prototype.** In-memory state that resets on reload, a
  twenty-item food database, no accounts and no camera behind the scan targets.

### A note on constraints hit along the way

The reference file sits on a Figma Starter plan, which surfaced three hard limits in
sequence: variable collections capped at one mode, files capped at 3 pages, and — the
blocking one — **20 MCP tool calls per month**, which the research phase consumed.

The work moved to a new file on the Education plan, which lifted all three. That is why
dark mode is live rather than specified, and why the file has six pages. The constraint
and the workaround are both recorded here rather than quietly smoothed over.
