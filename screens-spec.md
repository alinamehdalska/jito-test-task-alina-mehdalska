# Plate — Screens & Flows Specification

**Deliverable 3 of 3.** Four iOS screens at **393 × 852pt** (iPhone 16 Pro logical
size), built from the component sets in [`design-system.md`](design-system.md).

Safe areas: 59pt top (status + Dynamic Island), 34pt bottom (home indicator).
Screen margin 20pt. Floating glass tab bar 68pt, inset 20pt horizontally and lifted 28pt
off the bottom edge; content scrolls beneath it.

---

## User stories covered

| Story | Screens |
|---|---|
| **A** — "calculate the calories in a dish or product" | 1 Dashboard → 2 Calculator |
| **B** — "find a recipe that fits my calorie limit and goals" | 1 Dashboard → 3 Discovery → 4 Recipe Detail |

Both stories terminate in the same action — **Log to Diary** — which returns the user
to the Dashboard with the ring updated. That shared endpoint is why the two stories
belong in one app rather than two.

---

## Screen 1 — Dashboard / Calorie Tracker

**Purpose:** answer "where am I today?" in under two seconds, and offer the fastest
possible path to logging something.

### Layout

| Region | Y | Content |
|---|---|---|
| Header | 59 | "Today" `large-title` · date `subhead` `text.secondary` · avatar 40pt |
| Budget block | 128 | `CalorieCard variant=daily-budget` — no card chrome; gauge + macro badges sit on the canvas |
| — hero gauge | | `HeroGauge` — 300pt semicircular arc, orange→violet sweep, centre `1,240` `display-calorie` |
| — macro row | | three `MacroRing size=sm` — Carbs 142g/210 · Protein 78g/120 · Fat 41g/62 |
| Quick actions | 428 | two 1⁄2-width `Button size=lg`: "Scan" (primary, barcode icon) · "Search" (secondary) |
| Today's meals | 500 | `title-3` + "Edit" tertiary button |
| Meal list | 540 | 3 × `CalorieCard variant=meal-entry`, 8pt gap |
| Tab bar | 756 | Floating glass pill, 353×68, inset 20pt — Home · Discover · **+** · Diary · Profile |

### Behaviour & states

- The **+** tab is a 50pt gradient FAB seated inside the glass pill. It opens the log sheet.
- **Empty state** (nothing logged): rings at zero, meal list replaced by a
  `bg.raised` panel — "Nothing logged yet. Scan a barcode or search for a food."
- **Over budget:** the total ring completes and draws the excess as an inset arc in
  `feedback.warning`. Copy reads "180 over" in `text.secondary`. No red, no alert.
- **Loading:** ring tracks render, values are `bg.sunken` skeleton bars.

### Rationale

The budget card is a single card, not four. Three separate macro cards would imply the
macros are independent goals; they are components of one total. Nesting the three small
rings inside the same surface as the total states the relationship structurally.

---

## Screen 2 — Dish & Product Calorie Calculator *(User Story A)*

**Purpose:** get an accurate calorie and macro figure for a specific product at a
specific portion.

### Layout

| Region | Y | Content |
|---|---|---|
| Nav bar | 59 | back chevron · "Add food" `headline` · close |
| Search | 108 | `SearchInput scan=true`, 353×52 |
| Segmented | 172 | All · Products · My meals · Recent |
| Result head | 216 | Product card: image 72pt, "Greek Yogurt, 2%", brand `footnote`, "≈" confidence marker |
| Portion | 316 | `title-3` "Portion" · stepper · **slider 0–500g**, value `170 g` |
| Breakdown | 420 | 3 macro rows: bar + gram value + kcal contribution |
| Total | grouped with CTA | `metric-card` **142** + "per 170 g serving" — sits directly above the button rather than stranded mid-screen |
| CTA | 752 | `Button variant=primary size=lg fullWidth` — "Add to Diary" |

### The portion slider is the whole screen

Every value above the fold recalculates live as the slider moves — macro bars, gram
values, and the total. This is the screen's single interaction and the reason it exists:
competitors make portion a buried secondary field, which is precisely where accuracy is
lost.

- Slider track 3pt `bg.sunken`, fill `accent.primary-hover`, thumb 20pt white with a hairline.
- Snaps to 5g increments; the stepper adjusts by 10g.
- Common portions ("1 cup", "1 container") appear as `IngredientChip` presets below.

### States

- **Searching:** three skeleton rows.
- **No result:** "No match for 'xyz'." + "Add it manually" tertiary button.
- **Scan failure:** sheet — "Couldn't read that barcode." + Retry / Search instead.
- **Estimated data:** the `≈` marker is tappable and explains the source. This is the
  "Honest" brand attribute made concrete.

---

## Screen 3 — Recipe Discovery & Smart Search *(User Story B)*

**Purpose:** surface recipes that fit **today's remaining budget**, not a generic
calorie ceiling.

### Layout

| Region | Y | Content |
|---|---|---|
| Header | 59 | "Discover" `large-title` |
| Search | 116 | `SearchInput scan=false`, "Search recipes" |
| Filter rail | 180 | horizontal `FilterPill` scroller, 8pt gap, 20pt bleed |
| Budget banner | 232 | `bg.raised` strip — "610 kcal left today" + "Fits my day" toggle |
| Results | 292 | 2-column grid, 12pt gutter, `RecipeCard` 170×236 |
| Tab bar | 769 | — |

### Filters

`Under 400 kcal` · `High protein` · `Vegetarian` · `Under 30 min` · `Low carb` ·
`Uses what I have`

Selected pills use `accent.secondary-muted` **plus a checkmark**. Filters are additive
and the count badge shows matches.

### The match badge — the screen's core idea

Each card carries a badge computed against the user's *remaining* macros, not a fixed
threshold:

| Badge | Condition | Token |
|---|---|---|
| **Fits your day** | within remaining kcal *and* no macro exceeded | `feedback.success` on `feedback.success-surface` |
| **Tight fit** | within kcal, one macro over | `feedback.warning` on `feedback.warning-surface` |
| *(none)* | outside budget | — |

A recipe that is over budget is **not** marked negatively and **not** hidden — it simply
carries no badge. Consistent with §2 of the brand strategy: the app informs, it does not
police.

### Recipe card anatomy

Image 170×120 (`radius.lg` top) → title `headline` 2-line clamp → kcal `title-3` +
"per serving" `caption-1` → macro preview as three 4pt bars in macro colours → quick-add
28pt circular button, bottom-right.

---

## Screen 4 — Recipe Details

**Purpose:** everything needed to decide and log, without scrolling to decide.

### Layout

| Region | Y | Content |
|---|---|---|
| Hero | 0 | Full-bleed image 393×280, scrim bottom 40%, back + save floating |
| Sheet | 248 | `bg.surface`, `radius.3xl` top, overlaps hero by 32 |
| Title | 288 | "Lemon Herb Salmon Bowl" `title-1` · 25 min · 4.8 · 2 servings |
| Match | 372 | Badge + "Fits your day — 610 kcal left" |
| Servings | 420 | Stepper. **Recalculates everything below.** |
| Breakdown | 484 | `MacroRing size=lg total` + three `sm` rings, per serving |
| Ingredients | 700 | `title-3` + count → `IngredientChip` wrap, macro-dotted |
| Method | — | Numbered steps, `body`, 12pt gap |
| Nutrition | — | Collapsible full table per serving / per 100g |
| Sticky CTA | 768 | `bg.surface` bar + `elevation.3`, `Button primary lg fullWidth` — "Log to Diary" |

### Behaviour

- The servings stepper drives the rings, the ingredient quantities, and the CTA label
  ("Log 1 serving" → "Log 2 servings"). Same live-recalculation principle as Screen 2.
- The CTA is sticky from first paint — the decision to log should never require
  scrolling back.
- On log: sheet dismisses, Dashboard ring animates from old to new value over 320ms.

---

## Flow maps

### Story A — Calculate a dish or product

```
Dashboard
   ├── [Scan] ──▶ Camera ──▶ barcode found ──▶ Calculator (pre-filled)
   │                     └── not found ──▶ Manual search
   └── [Search] ─▶ Calculator (empty)
                      │
                      ▼
              Search → select product
                      │
                      ▼
              Adjust portion  ◀── live recalculation loop
                      │
                      ▼
              [Add to Diary] ──▶ Dashboard (ring updated)
```

### Story B — Find a recipe that fits

```
Dashboard ──▶ Discover
                 │
                 ├── apply filters ──┐
                 ├── toggle "Fits my day" ──┤
                 │                          ▼
                 └──────────────▶  Matched results
                                          │
                                          ├── [quick-add] ──▶ Dashboard (logged)
                                          │
                                          └── [open] ──▶ Recipe Detail
                                                            │
                                                            ├── adjust servings
                                                            │
                                                            └── [Log to Diary] ──▶ Dashboard
```

Both flows are **three taps from intent to logged**, and both converge on the Dashboard
with visible feedback. Quick-add exists so Story B can complete without ever opening the
detail screen.
