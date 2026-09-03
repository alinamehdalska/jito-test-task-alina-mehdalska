# Plate — Project Guide

## What this repo is

A **design deliverable**, not an application. It is the submission for the Jito UX/UI test
task: branding, a design system, and key screens for **Plate**, a calorie-tracking mobile app.

There is no application code, no package manager, no build, lint, typecheck or test step.

> **Note on the global config.** `~/.claude/CLAUDE.md` imports `java.md` and `react.md` and
> defines a "run lint → typecheck → test → build before commit" workflow. **Neither stack is
> in use here and that workflow does not apply.** The verification steps for this repo are in
> *Definition of done* below. Everything else in the global config — scope discipline, honest
> reporting, no secrets, conventional commits — still applies.

## Designer persona

Senior UI/UX designer working mobile-first: information hierarchy, design-system token
architecture, and visual craft (glassmorphic surfaces, mesh gradients, layered elevation).
The recurring challenge is balancing **dense numeric data** — calorie budgets, macro targets,
calculator forms — against a calm, airy, trustworthy interface.

Prioritise **usability and product logic over decoration.**

## Deliverables

| File | Contents |
|---|---|
| `README.md` | Overview, UX rationale, AI-native workflow, photo credits, limitations |
| `branding-strategy.md` | Brand personality, colour derivation, type, tone, full contrast matrix |
| `design-system.md` | Token architecture, 21 component specs, composition rules, Figma traps |
| `screens-spec.md` | 11 frames, both user stories, navigation, accessibility |
| `tokens.json` | **Source of truth.** W3C DTCG. Counts live here, not in prose |

**Figma:** `lzCgTFcfrlE8qGqYbBTh7l` — pages `00 Cover · 01 Foundations · 02 Components ·
03 Stylescape · 04 Screens · 05 Flows · 06 Moodboard · 07 Presentation`.
`07` holds iPhone 15 Pro mockups of all 11 screens — **script-generated clones**, not the
live frames: bezelling the originals would nest every prototype destination. Regenerate
with `tools/figma-device-mockups.js` rather than editing it by hand.
**Reference/brief file:** `G4Zl3VtgSh7nRAJ3rcC1vy` (the brief itself is image nodes `4:3` / `4:6`).

## Design system contract

**Two tiers.** `primitive.*` → `semantic.*` → components. Components consume **semantic
tokens only**. Primitives are scoped `[]` in Figma — invisible in every picker — so the
semantic layer cannot be bypassed.

**Spacing — the only valid steps:** `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.
Screen margin 20. `2` is optical-nudge only; `80`/`96` are layout-level only (bottom safe-area).

**Radius:** `4 · 8 · 12 · 16 · 20 · 24 · 32 · full` — keyed by value, same tone of voice as
`space/*`. `full` (9999) is the one sentinel. Cards use `radius/20`, sheets `radius/32`,
pills/rings `radius/full`.

**Control sizes are tokens too:** `primitive.size.24 · 36 · 44 · 52 · 56` keyed by value, and
`semantic.control.icon / chip / button / cta / fab` naming which control gets which. Components
consume `control/*`, never `size/*`. `blur/glass` (28) and `motion/duration/press · state ·
sheet` (120 / 200 / 320 ms) live beside them, so the coded prototype has no magic numbers.

**Type:** SF Pro / SF Pro Rounded (both verified present in the file). 16 styles — the HIG
ramp carries an **Emphasized** weight at every size it is used at, so `Subhead Emphasized`
and `Caption 1 Emphasized` exist rather than leaving Semibold text unstyled.
`Display Calorie` 56/58 Heavy is the **dashboard hero only**; in-card figures use
`Metric Card` 28/32 Semibold. One style must not do both jobs.

**Shadow:** four levels — `Shadow XS · SM · MD · LG` — each **two layers** (tight contact +
wide ambient), warm-tinted with `neutral/900` rather than black. Depth comes from shadow,
never from a border.

**Style names are flat and spelled out.** A style grouped as `title/1` renders in the picker
as a bare `1`, which is what the naming review flagged. Text styles follow the iOS HIG ramp
(`Large Title`, `Title 1–3`, `Headline`, `Body`, `Callout`, `Subhead`, `Footnote`,
`Caption 1–2`) plus `Display Calorie` and `Metric Card`. DTCG keeps the kebab slug.

**Control sizes — four heights, no fifth:** `56` FAB · `52` primary/sticky CTA · `44`
standard button and the touch-target floor · `36` chip. 44 is a *target*, not a look: a
36pt chip is legal when its row supplies the target. See design-system.md 2.12a.

**Native chrome:** Apple Design Resources — status bar and home indicator are instances,
resized from the kit's 402pt device to our 393. Time and indicators rebound to
`text.primary`; the Dynamic Island stays black because it is a hardware cutout.

**Icons:** Phosphor regular (MIT), one 22-glyph `Icon` variant set built from the real
path data. Regular weight is **fill-based, not stroked** — colour lives on `fills`, and
state logic that switches `strokes` silently does nothing.

**The macro spine.** Coral = carbs, periwinkle = protein, sky = fat — fixed everywhere.
Each macro has three roles: `track` (decorative), `indicator` (**≥3:1**, WCAG 1.4.11), and
`label` (**≥4.5:1**).

## Verified constraints — do not "improve" these away

Each was measured. Changing one without re-measuring will break accessibility.

| Rule | Number | Why |
|---|---|---|
| Primary CTA is **solid coral with an ink label** | 6.16:1 | White-on-coral fails at *every* tint of this hue. `coral/700` + white passes (6.04) but abandons the warm accent |
| Gauge sweep and macro indicators use the **600-tints** | 3.85–4.08:1 | The prettier 400-tints measure ~2.1:1 and fail the non-text floor |
| Aurora opacities `0.35 / 0.32 / 0.31 / 0.26` | 4.78:1 worst case | The **richest** setting where a blob overlap still clears AA for `text.secondary`. Raising it fails. Measured against the canvas gradient; on the flat sand it had been 4.6 |
| Glass tab bar 65% + blur 28; **inactive nav = `text.secondary`** | 5.63:1 | `text.tertiary` measures 3.79 behind 65% glass — still short of AA for an 11pt label |
| `text.tertiary` is **large-text only** | 3.6:1 | Never for body copy |
| Focus ring `periwinkle/600`, 2pt | 3.87:1 | `periwinkle/500` measured 2.82 and failed WCAG 2.4.11 |
| **Colour never carries meaning alone** | — | Every macro shows a dot **and** a name **and** consumed/target values |
| Section-tab indicator is `accent.primary-strong` | 6.04:1 | `accent.primary` is the 400-tint and measured 2.23 — under the 3:1 non-text floor. The underline is the primary affordance and has to clear it alone |
| Screen 5's status band carries a **white scrim**, alpha 0.62 at the glyph band | 5.14:1 | The only status bar sitting on a photo instead of the canvas; unaided it measured ~4.2:1. 0.578 is the solved floor for 4.5:1 over a *black* photo, so the number holds for any image, not just this one |
| Meal macros reconcile with the header | P78 · C142 · F41 | The per-meal P/C/F must sum to the dashboard totals **and** reproduce each meal's own kcal. They did not: P summed to 66 against a stated 78 |
| `feedback.success` is **`#2C7757`**, not the original `#30815E` | 4.81:1 on `success-surface` | The original measured 4.22 on the surface it actually sits on (badge 11pt, chips 12pt, banner 15pt); on white alone it had passed at 4.74, which is how it slipped through |
| The toast's detail line is **`text.inverse-secondary`** (`neutral/300`) | 8.24:1 | It had been `text.tertiary` on `bg.inverse` — 3.55:1 for 11pt text. There was no token for secondary text on an inverse surface; now there is, and it is the value Dark mode already uses for `text.secondary` |

**The canvas is a gradient, not a flat fill.** `bg.canvas` is white → `sand/100` top to
bottom, held on the Aurora Backdrop component. It was specified from the start and never
applied: the frames were flat `sand/100`, so the blobs simply stopped at y=640 and 212pt
of dead colour followed — read as a pod welded to the bottom of every screen.

**Gradient is rationed** to five uses: canvas, aurora blobs, calorie gauge sweep, **photo
scrim** (recipe-card panel seam *and* screen 5's status band), bottom fade under the
floating nav. Primary buttons are solid.

**No shame language.** No red for being over budget (amber at most); `feedback.danger` is
reserved for destructive actions. No body imagery — food, hands, kitchens only.

## Figma working agreements

Load the `figma-use` skill before **every** `use_figma` call. Beyond it, these have each cost
real rework on this file:

1. **Seed bound paints with the variable's real colour.**
   `setBoundVariableForPaint` resolves colour **asynchronously**. A black placeholder base
   renders black if resolution lags — this shipped a dark tab bar twice while still reporting
   `bound: true`.
2. **Never clone a returned paint to add opacity.** The clone re-stores the placeholder. Put
   translucency on the **node** (`node.opacity`), not the paint.
3. **Only bind spacing tokens that exist — this applies to `itemSpacing` as much as padding.**
   `setBoundVariable(prop, undefined)` silently *clears* the property, so an off-grid value
   produces a container with **zero** gap or padding that still looks deliberate in the layer
   tree. It has bitten this file twice: first 40 containers lost padding, then a second wave
   lost their gaps — dots ended up touching their labels (`●32 g`, `●610 kcal left`) and the
   serving-size chips collapsed into circles because their horizontal padding vanished.
   **Snap to the grid rather than inventing a step:** 3→4, 5/6/7→8, 10→12, 14→16, 18→16 or 20.
   Use a guarded setter that throws on a missing token, and after any spacing pass, audit for
   auto-layout frames with `itemSpacing === 0` and more than one child.
4. **`resize()` before setting sizing modes** — resize resets them to `FIXED`, which silently
   collapses hugging columns.
5. **Gradients cannot bind to variables.** Mirror their stops in `accent.gauge-*` /
   `bg.aurora-*` and report them separately in binding audits.
6. **One `setCurrentPageAsync` per call.** Fan multi-page work out in parallel calls.
7. **Node opacity fades children too** — that is why the glass bar is two layers (a
   `glass-plate` behind a transparent content pill).
8. Screens 2, 3, 5 and 6 are push/modal contexts: sticky CTA, **no tab bar** — this is
   deliberate, not an omission.
9. **A fixed-height component silently clips instances that outgrow it.** Editing an
   instance's content (or restoring a gap on it) grows the instance while the *component*
   stays the old height, so the extra content renders outside the card with no error and no
   layer-tree symptom. The Recipe Card lost the bottom of its "Fits your calories" chip this
   way: component 224, instance content 240. **Fix the component, not the instance** — set
   the component's `layoutSizingVertical = 'HUG'`, then re-measure every row that holds its
   instances, because hugging changes their height too.
10. **A bottom fade that starts at the bar's top edge cannot mask anything.** Its first stop
    is transparent exactly where the content needs to be hidden, so scrolled text stays
    legible through the glass *and* in the band below it. The ramp must start above the bar
    and reach full canvas alpha **by** the bar's top edge — see composition rule 5.
11. **A tab's selected state is four properties, not one.** Label `fontName` **and** label
    fills **and** the indicator's `layoutSizingHorizontal` **and** the indicator's own
    `fills`. Copying a subset produces a half-lit tab that passes a structural audit — an
    indicator that measures the right width but has no paint, next to a deselected label
    still set in Semibold. Copy the arrays wholesale from a known-good tab rather than
    rebuilding paints; that carries the variable bindings and sidesteps the async
    bound-paint trap in item 1.
12. **Prototype links are per-page.** A reaction on a component on `02 · Components`
    cannot point at a frame on `04 · Screens`, so interactions cannot be authored once on
    the Tab Bar or Section Tabs component and inherited. Every reaction lives on a
    Screens-page node, and the tab bar is wired three times over. Two payload shapes are
    rejected outright: singular `{ action: … }` (*"update the `actions` field instead"*)
    and any `ON_DRAG` trigger paired with `BACK` **or** a `NODE` navigate. A rejection
    aborts the write loop partway, so resolve every node lookup **before** the first
    `setReactionsAsync`, and re-run the whole pass to repair — the setter overwrites.
13. **Frames cannot scroll with fixed chrome here.** `scrollBehavior` is absent from this
    Plugin API build, and `numberOfFixedChildren` puts fixed children **on top of**
    scrolling ones — so the aurora backdrop cannot be both fixed and behind the content.
    `overflowDirection` stays `NONE` on all 11 frames; scrolling is the coded prototype's job.
14. **Instance children reject `relative-transform` overrides** — *"This property cannot be
    overridden in an instance"*. Anything that repositions a component's internals must be
    done on the **component**; the instance then takes only a root `resize()`. And if those
    children are pinned `MIN/MIN`, resizing without repositioning them leaves the contents
    at their old size, anchored to one corner.

## Definition of done

1. `python3 -c "import json; json.load(open('tokens.json'))"` plus a DTCG shape check —
   every leaf has `$value`/`$type`, every `{alias}` resolves, no cycles.
2. **Re-measure contrast** for any pair you changed. Do not eyeball it.
3. **Screenshot readback** of every frame you touched, and actually look at it — several
   regressions here passed structural checks while visibly broken.
4. **Binding audit** on the Screens page: solid fills and strokes should be 100%
   variable-bound; gradients counted separately.
5. Keep `tokens.json` and the Figma variables in sync — both are generated from one source.
6. Conventional commit, imperative subject, body explaining *why*. Do not push without asking.

## Submission requirements — pass/fail

From the brief, and easy to miss:

- Everything must be verifiable **in incognito**. The Figma file and the GitHub repo must both
  be publicly link-shared, or the submission is discarded.
- All deliverables **in English**.
- A **video walkthrough** covering all three parts (branding, design system, screens).

## Open items

- Figma link-sharing → *Anyone with the link can view* (MCP cannot set this).
- Replace the Loom placeholder in `README.md`.
- **Figma prototype — done** (2026-09-03): 48 reactions, 11 frames, two flow starting
  points, no dangling destinations and no unreachable frames. **Coded prototype still open.**
  Jito asked for it: *"немає ніякого сенсу в статичних скрінах коли є можливість швидко
  робити прототип"*. Note that building it makes this file's "no application code, no build"
  statement false and activates `~/.claude/react.md`'s lint → typecheck → test → build gate.
- ~~105 of 319 text nodes carry no text style~~ — **closed.** `04 · Screens` now measures
  323 text nodes, 0 unstyled. The remaining 44 unbound solid fills are all documented
  exemptions and not work items: 32 aurora `blob` fills (measured opacities — rebinding
  needs a re-measure), 11 `Dynamic Island` fills (hardware cutout), 1 modal scrim.
