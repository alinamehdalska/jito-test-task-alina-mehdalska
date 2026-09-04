# Plate — coded prototype

The eleven Figma frames of [Plate](../README.md), running. React 19 + TypeScript, Vite,
Tailwind v4, React Router — and one input the Figma file shares: [`../tokens.json`](../tokens.json).

- **Live:** https://jito-test-task-alina-mehdalska.vercel.app — Vercel, Root Directory `prototype`, built from `main` on every push
- **Figma:** [`lzCgTFcfrlE8qGqYbBTh7l`](https://www.figma.com/design/lzCgTFcfrlE8qGqYbBTh7l) — page `04 · Screens`
- On a viewport of 768px and up the app renders inside an iPhone 15 Pro outline; below that it
  fills the screen and follows the device's safe areas, so it is also usable on a real phone.

## Run

```bash
nvm use            # Node 22.22 — jsdom 30 and lint-staged 17 refuse the Homebrew 23
corepack enable    # pnpm 10, pinned in package.json
pnpm install
pnpm dev
```

| Script                                                      | What it does                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm preview`                  | Vite                                                                                    |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` | The gate before every commit (also run by lint-staged and CI)                           |
| `pnpm test:e2e`                                             | Playwright: both user stories, axe on every route, 44pt targets, chrome geometry        |
| `pnpm tokens` / `pnpm tokens:check`                         | Regenerate `src/styles/tokens.generated.css` from `../tokens.json` / fail if it drifted |
| `pnpm images`                                               | Resize the exported Pexels sources in `assets-src/` (git-ignored) to the committed WebP |

## One source of truth

`tokens.json` already generates the Figma variable collections. `src/tokens/generate.ts`
turns the same file into the Tailwind theme, and a test compares the committed CSS with a
fresh generation on every run, so the design file and the code cannot drift.

The generator enforces the design contract the only way CSS can:

- every token becomes a `--plate-*` custom property, but **only the layers a component may
  consume are re-exported inside `@theme inline`** — semantic colours (`text-text-primary`,
  `bg-bg-surface`), the spacing and radius scales (`p-20`, `rounded-20`), shadows, fonts and
  control sizes (`h-control-cta`, `size-control-button`). Primitive colours get no utility at
  all, which is what scoping them `[]` in Figma achieves for the pickers there;
- Tailwind's default palette and numeric scales are wiped, so an off-grid value is not
  expressible without an arbitrary `[…]` — and the linter refuses those, along with any
  `--plate-color-*` reference;
- the 15 text styles become `type-*` utilities named exactly like the Figma styles:
  `Title 1` and `type-title-1` are the same decision;
- `theme.dark` is emitted under `[data-theme="dark"]` but nothing switches it on: the screens
  were designed in Light, and the aurora, scrims and fades are authored for it.

Building the prototype surfaced what the design had kept in prose, so `tokens.json` gained
`primitive.size` / `semantic.control` (the four control heights and the icon glyph),
`blur.glass`, `blur.scrim`, `motion.duration.*`, `bg.aurora-pink` and `text.inverse-secondary`,
all mirrored into Figma by scripts under [`../tools`](../tools). Re-measuring every colour
pair the prototype renders also re-solved `feedback.success` from `#30815E` to `#2C7757`:
the original measured 4.22:1 on the surface it actually sits on as 11–15pt text.

Fonts: SF Pro and SF Pro Rounded are Apple-licensed, so the stacks ask the platform for
them first and fall back to self-hosted Inter and Nunito elsewhere. `ui-rounded` resolves
to SF Pro Rounded in Safari only. Numerals are tabular everywhere.

## Frames → routes → components

| Figma frame                        | Route                                                 | Chrome                                                        | Feature                                                                                      |
| ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1 · Dashboard                      | `/`                                                   | tab bar, nav fade                                             | `features/diary` — `HeroGauge` (SVG meter), `MacroStat`, `MealGroupCard`                     |
| 1b · Dashboard — over budget       | `/` once consumed passes the goal                     | same                                                          | `HeroGauge` over state: sweep capped, amber arc from the goal end, `390 · over today's goal` |
| 2 · Calculator — Product           | `/add/product/:productId?`                            | back / `Breakfast · Today ▾` / close, total + CTA             | `features/calculator/product-screen`, `MealPickerTrigger`                                    |
| 3 · Dish Calculator                | `/add/dish`                                           | back / close, total + CTA                                     | `features/calculator/dish-screen`                                                            |
| 4 · Recipe Discovery               | `/discover`                                           | tab bar, discovery fade                                       | `features/discover/discovery-screen`, `RecipeCard`, `FilterPill`, `ReasonChip`               |
| 4b · Discovery — planning tomorrow | `/discover` once nothing fits tonight, or after 20:00 | same                                                          | same screen — `recommendationMode`, `rankRecipes` in `domain/match`                          |
| 5 · Recipe Details                 | `/recipes/:slug`                                      | hero + status scrim, `Log to` row, stepper + CTA, detail fade | `features/discover/recipe-details-screen`                                                    |
| 5b · Nutrition                     | `/recipes/:slug?tab=nutrition`                        | same; the tabs stick under the status bar                     | same screen, `SectionTabs` — the panel swaps, the summary stays                              |
| 5c · Instructions                  | `/recipes/:slug?tab=instructions`                     | same                                                          | same screen                                                                                  |
| 6 · Add — action sheet             | not a route: `<dialog>` in the root layout            | scrim + blur                                                  | `features/add-sheet`                                                                         |
| 7 · Diary — empty state            | `/diary?day=YYYY-MM-DD`                               | tab bar                                                       | `features/diary/diary-screen`, `WeekStrip`                                                   |
| 7b · Search — loading              | `/add/search?mode=product\|ingredient&q=`             | back                                                          | `features/calculator/search-screen`                                                          |
| 7c · Search — no results           | `/add/search?q=kefir`                                 | back                                                          | same screen — `EmptyState` with `Create a food` and `Scan a barcode`                         |
| 8 · Logged — confirmation          | toast on `/` after any log                            | —                                                             | `features/toast`                                                                             |
| 9 · Edit entry                     | not a route: `<dialog>` from any meal row             | scrim + blur                                                  | `features/diary/edit-entry-sheet` — amount, meal, time, delete with undo                     |
| Meal picker (2, 3, 5, 7b)          | not a route: `<dialog>` from the pull-down            | scrim + blur                                                  | `features/diary/meal-picker`, `log-target-store`                                             |

Shared chrome lives in `src/shared/chrome` (device frame, screen, status bar, tab bar,
bottom fades, sticky CTA); shared controls in `src/shared/ui` (button, icon set, chip,
filter pill, stepper, segmented control, search input, section tabs, empty state).

## What is live

- **Logging changes the budget.** Every "… to Diary" action adds an entry, the gauge and macro
  bars recompute, the toast offers Undo, and Discovery re-ranks its reasons against what is left.
- **Every log names its meal and day.** `Breakfast · Today ▾` under the title on the form
  screens and a `Log to` row on the recipe screens open the same picker; the default comes
  from the clock, and the day the diary has open carries into the flow.
- **Entries can be corrected.** Tapping a meal row opens the edit sheet: amount rescales the
  nutrition, meal and time move the entry, delete offers an undo. The toast holds 5 s.
- **Over budget is a state, not a minus sign.** The gauge sweep caps at the goal, an amber
  arc inset from the goal end draws the excess, the hero reads `390 · over today's goal`, and
  the macro bars complete in amber.
- **The diary is a calendar** with a dot under every day that has entries. Today carries the
  dashboard's meals; any other day of the week shows frame 7's empty state, and `+ Add food`
  there logs into that day.
- **The calculators compute.** Per-100 g label data scaled to a preset or a typed gram value,
  each macro's share of the serving's energy, dish totals split over servings. The label
  serving leads the presets — `1 pot · 170 g` before `100 g`.
- **Search behaves like a lookup:** skeleton rows for the latency, then matches, and on a miss
  the two recoveries (`Create a food`, `Scan a barcode`) rather than a dead end; in ingredient
  mode a pick joins the dish draft and returns to it.
- **Discover never opens empty.** Fit is a sort, not a default filter; every reason carries the
  margin (`Fits · 130 to spare`); once nothing fits tonight, or after 20:00, the tab plans
  tomorrow against the full goal, lightest first.
- **Recipe details are three tab panels under one summary**, deep-linkable; the tabs stick
  under the status bar and swap only the panel, so the fit verdict never leaves the reader.
  The servings stepper moves in halves and multiplies what gets logged. All four recipes are
  complete.
- **Motion is built:** push / pop / dissolve route transitions through the View Transitions
  API, the sheet and toast through `@starting-style`; all of it collapses under
  `prefers-reduced-motion`.

## Where the code departs from the frames, and why

- **The time row is a native `<input type="time">`** where frame 9 draws a value with a
  chevron: the platform picker is the right control, and the chevron stays as the affordance.
- **The meal picker is a sheet**, not the iOS pull-down menu the subtitle imitates: a
  `<dialog>` is what the prototype can render inside the device frame on every platform.
- **The avatar is initials.** The portrait in the file has no licence record, and the design
  keeps people out of its imagery anyway.
- **The recipe macro row runs carbs → protein → fat** (composition rule 8) where frame 5 has
  protein first.
- **The add sheet is a non-modal `<dialog>`.** `showModal()` puts the dialog in the top layer,
  which ignores ancestor transforms and clips and would escape the desktop device frame; the
  sheet brings its own scrim, Escape handling and focus return, and marks the rest of the
  screen `inert`.
- **The scan targets route to the product calculator**, as the sheet's "Scan a barcode" does
  in the Figma prototype; there is no camera.
- **Profile is a placeholder.** The brief covers logging and discovery.
- **Each recipe card opens its own recipe.** The Figma prototype resolves all four to one screen.

## Accessibility

The gauge and macro bars are meters with the same numbers AT reads; the section tabs are a
tablist with arrow keys; serving presets and the week strip are radio groups; the tab bar
carries `aria-current`; every tappable element offers a 44pt target or sits in a row that
does, and Playwright measures that. The focus ring is `border.focus` at 2pt with a 2pt
offset (3.87:1). axe runs on every route in the e2e suite and fails on serious findings.

Nothing under 20pt is set in `text.tertiary` any more: the 2026-09-04 audit moved every
small caption, placeholder and inactive tab label to `text.secondary`, in Figma and here.

## Photography

Pexels, free for commercial use, content-matched per dish, exported once from the Figma
file into `assets-src/` and sized by `scripts/build-images.ts` at twice the rendered size.

| Use                   | Dish                   | Pexels ID                                 |
| --------------------- | ---------------------- | ----------------------------------------- |
| Dashboard thumbnail   | Greek yogurt bowl      | `10421049`                                |
| Dashboard thumbnail   | Chicken & quinoa salad | `9893176`                                 |
| Dashboard thumbnail   | Trail mix (almonds)    | not recorded in the design file's credits |
| Product result        | Greek Yogurt, 2%       | `4601975`                                 |
| Discovery card + hero | Lemon Herb Salmon Bowl | `15913488`                                |
| Discovery card + hero | Miso Rice & Egg Bowl   | `6823336`                                 |
| Discovery card + hero | Chickpea Shakshuka     | `6275165`                                 |
| Discovery card + hero | Seared Tuna Niçoise    | `12173347`                                |

## Layout

```
prototype/
  scripts/        build-tokens.ts · build-images.ts
  e2e/            log-a-meal · find-a-recipe · a11y (axe, targets, geometry)
  src/
    app/          router, root layout (device frame, sheet, toast), tab layout, error screen
    styles/       app.css → tokens.generated.css · base · layout (frame geometry) · chrome · view-transitions
    tokens/       DTCG reader, CSS generator, drift + contract tests
    domain/       nutrition maths, recipe matching — pure, tested
    data/         products (per 100 g), recipes, seed diary, photo manifest
    shared/       chrome, ui, lib, test helpers
    features/     diary · calculator · discover · add-sheet · toast · profile
    assets/photos WebP at 2×
```
