# Plate — Screens & Flows Specification

**Deliverable 3 of 3.** Eleven iOS frames at **393 × 852pt**, built from the component sets
in [`design-system.md`](design-system.md).

Safe areas: 59pt top, 34pt bottom. Screen margin 20pt. Floating glass tab bar 353 × 68,
inset 20pt and lifted 28pt; content scrolls beneath it.

**Every frame carries the 59pt status bar**, including the two that had been shipping
without one — 5 and 5b. On 5 it sits over the full-bleed hero photo in ink, which the
image's light upper region carries; on 5b the collapsed header already reserved exactly
59pt for it. **Every primary CTA's bottom edge sits at y = 808**, and no tap target on any
frame enters the home indicator's reserved zone (818–852).

| # | Frame | Role |
|---|---|---|
| 1 | Dashboard | Where am I today, and what next |
| 2 | Calculator — Product | User Story 1a: calories for a product |
| 3 | Dish Calculator | User Story 1b: calories for a multi-ingredient dish |
| 4 | Recipe Discovery | User Story 2: personalised recipes |
| 5 | Recipe Details | Decide and log |
| 5b | Recipe Details — Nutrition | The `Nutrition` tab |
| 5c | Recipe Details — Instructions | The `Instructions` tab |
| 6 | Add — action sheet | The central nav action |
| 7 | Diary — empty state | Product realism |
| 7b | Search — loading state | Product realism |
| 8 | Logged — confirmation | Feedback after logging |

---

## User stories

| Story | Path |
|---|---|
| **1a** — calories in a specific product | Dashboard → Add → **Product** → adjust serving → Add to Diary |
| **1b** — calories in a complete dish | Dashboard → Add → **Dish** → add ingredients → set servings → Save to Diary |
| **2** — a recipe that suits me | Dashboard → Discover → filtered by remaining calories → Details → Log |

All three converge on the diary, and every one ends with the confirmation in frame 8.

---

## 1 · Dashboard

Answers four questions in reading order: **how many are left**, how many consumed, what
have I eaten, and what do I do next.

| Region | Content |
|---|---|
| Header | "Today" `Large Title` + date |
| Calorie card | Semicircular gauge. **Remaining leads** at 56pt — it is the number users act on. Consumed (1,240) and Goal (1,850) sit at the arc ends |
| Macros | Three `Macro Stat` rows — dot, label, **consumed / target**, progress bar |
| Primary action | `+ Add food` (solid coral) with a secondary scan target |
| Meals | Grouped **Breakfast / Lunch / Snack** cards, each with a group total and rows carrying photo, name, time, per-macro grams and calories |

**Why remaining leads.** The previous design led with consumed, which tells the user what
already happened. Remaining is the number that drives the next decision.

---

## 2 · Calculator — Product

| Region | Content |
|---|---|
| Mode switch | **Product** / Dish segmented control |
| Search | Field with barcode scan target |
| Recent | Chips for recently used products, favourites starred |
| Selected product | Photo, name, brand, per-100g calories, favourite toggle |
| Serving size | Preset chips `100 g · 150 g · 200 g · Custom` **plus** a stepper with an editable gram value |
| Nutrition | Per-macro grams, calorie contribution and a proportional bar |
| Bottom | Total grouped directly above `Add 142 kcal to Diary` |

**The slider is gone.** A continuous slider cannot express an exact gram value, which is
precisely what this screen exists to capture. Chips cover the common cases in one tap; the
stepper covers the rest.

---

## 3 · Dish Calculator *(new)*

The previous design covered only single products, leaving half of User Story 1 unbuilt.

| Region | Content |
|---|---|
| Mode switch | Product / **Dish** |
| Dish name | Editable field — "Chicken Quinoa Bowl" |
| Ingredients | Four rows: icon, name, amount, calories, remove control |
| Add | Dashed `+ Add ingredient` affordance |
| Servings | Stepper — 2 |
| Totals | **488 kcal total · 2 servings · 244 kcal per serving**, plus macro totals |
| CTA | `Save dish to Diary` |

Per-serving maths is shown explicitly rather than left to the user.

---

## 4 · Recipe Discovery

| Region | Content |
|---|---|
| Header | "Discover" |
| Personalisation | Card directly under the header: **Recommended for you** + `610 kcal left` badge + the reason in plain words |
| Search | Field plus a filter control |
| Filters | Wrapping chips — Fits my calories · High protein · Under 30 min · Vegetarian · Low carb. **Wrap, never clip** |
| Grid | Two-column cards: photo, name, calories, cooking time, reason badge |

**Cards carry no text over the photo.** Name, calories and time sit in a white body below
the image, so legibility never depends on what the photograph looks like.

**Every card states why it is recommended** — "Fits your calories", "Tight fit",
"High protein" — rather than presenting an unexplained ranking.

---

## 5 · Recipe Details

| Region | Content |
|---|---|
| Hero | Edge-to-edge photograph, minimal overlaid back and save controls. A **white `status-scrim`** covers the top 104pt above the photo and below all chrome — see below |
| Summary | Title, ⏱ 15 min, 🍽 2 servings, **480 kcal per serving** |
| Insight | `✓ Fits your daily plan — This serving fits within your 610 kcal remaining today.` |
| Macros | Protein / Carbs / Fat with grams **and** percent of daily goal |
| Ingredients | Icon-well list with amounts. **Five rows** — salmon 140 g, brown rice 80 g, baby spinach 60 g, avocado 50 g, lemon juice 10 g — which is what the `5 items` counter states and what the instruction steps reference. They also sum to ≈477 kcal, reconciling with the stated 480 per serving. Only three and a half fit above the fold; the rest is scroll |
| Section tabs | `Ingredients · Nutrition · Instructions` — **true tab views, one section at a time.** Frames 5, 5b and 5c are the three states |
| **5b — Nutrition** | Per-serving table, nine rows: calories, protein, carbohydrates, sugars, fat, saturated fat, fibre, sodium, cholesterol. The five-row version read as an unfinished panel once it stood on its own tab |
| **5c — Instructions** | Five numbered steps with titles and detail |
| Sticky CTA | Servings stepper + `Log 1 serving to Diary` |

Instructions were missing entirely; the recipe could not actually be cooked from the screen.

**Why the hero needs a scrim.** This is the only screen whose status bar sits on a photograph
rather than on the canvas gradient, and `9:41` plus the signal/wifi/battery glyphs are
`text.primary` — dark ink measuring roughly 4.2:1 over the salmon, close to illegible. The
scrim's alpha is **solved, not chosen**: 0.578 is the floor at which white composited over a
*black* photo still clears 4.5:1 for this ink, so 0.62 at the glyph band guarantees
**5.14:1 for any image**, not just this one. It ramps 0.74 → 0.62 → 0 across 104pt, clearing
the glyphs by y=44, so there is no band edge to see.

**Why three frames rather than one scrolled state.** These tabs were originally specified as
scroll-spy anchors over a single long page, which is why 5b rendered the nutrition table and
the instructions together. An underline indicator reads as a segmented control, so that looks
like a bug whatever the intent — the active tab said `Nutrition` while instructions sat
directly beneath it. They are now true tab views, one section each.

Splitting them exposed two content gaps that the stacked layout had hidden: a five-row
nutrition table and a three-step method, each of which left its tab half empty. Step 3 was
also doing two jobs (`Add rice, spinach, salmon and avocado. Finish with a squeeze of
lemon.`) while nothing covered slicing the avocado the ingredient list carries. Both were
completed rather than padded.

---

## 6 · Add — action sheet

The central nav button opens three routes: **Add a product**, **Scan a barcode**,
**Create a dish**. This is what makes the Dish Calculator reachable and gives the `+`
a defined job rather than an ambiguous one.

---

## 7 · Diary — empty state · 7b · Search — loading state

Split into two frames so each state is shown properly rather than stacked. The empty card is
vertically centred with equal 179pt gaps above and below; 7b shows a partially-typed query
with skeleton rows. Neither is decorative — an empty tracker is the first thing a new user sees.

---

## 8 · Logged — confirmation

A dark toast — `✓ Added to today's diary`, the item and its calories, and **Undo**. It
confirms without interrupting, and the undo makes logging feel safe to do quickly.

---

## Navigation

`Home · Discover · Add · Diary · Profile`, consistent across every screen that carries it.
The active item is marked by **both** icon and label colour.

The bar belongs to the three **root destinations** — 1 Dashboard, 4 Discovery, 7 Diary —
and to 8, which is the dashboard wearing a toast. Screens 2, 3, 5 / 5b / 5c and 7b are
**push contexts**: a sticky CTA replaces the bar. Screen 6 is a **modal** over the
dashboard, so the bar is present but dimmed behind the scrim and inert.

> Screen 7 carried no bar until the prototype pass, which is what surfaced it: as a root
> destination with no way out, it dead-ended the flow. It now carries the same three chrome
> layers as every other root screen at identical geometry — `Context=Nav` fade at y=731,
> glass plate and `Active=Diary` bar at y=756.

## Prototype

Two flows, one per user story. Figma prototype links are **per-page**, so every reaction
lives on the Screens page rather than on the Tab Bar and Section Tabs components — see
`tools/README.md` → *figma-prototype-wiring.js*.

**US1 · Log a meal** — starts at 1 Dashboard

```
1 ──[Add food]──▶ 2 Product ──[Add … to Diary]──▶ 8 Logged ──after 3s──▶ 1
1 ──[+ FAB]────▶ 6 Add sheet ─┬─[Add a product]──▶ 7b Search ──after 1.2s──▶ 2
                              ├─[Scan a barcode]─▶ 2 Product
                              └─[Create a dish]──▶ 3 Dish ──[Save dish]──▶ 8
2 ⇄ 3   Product / Dish segment switches between the two calculators
6       tap the scrim to dismiss · 7 Diary ──[+ Add food]──▶ 6
```

**US2 · Find a recipe that fits** — starts at 4 Recipe Discovery

```
4 ──[any Recipe Card]──▶ 5 Details ──[Log 1 serving]──▶ 8 Logged
5 ⇄ 5b ⇄ 5c            section tabs switch view without leaving the recipe
5 / 5b / 5c ──[back]──▶ whichever screen you arrived from
```

**Transitions.** Push-left for forward navigation, dissolve for modals, confirmations and
tab-view switches, instant for the tab bar — a tab switch that animates reads as a page
change. Back carets use Figma's `BACK` action rather than a fixed destination, because
screen 2 is reachable from three different places and only `BACK` returns to the right one;
the close **X** is a separate action that dismisses to the dashboard.

**Deliberately inert.** Profile has no screen. Heart, scan and the filter pills are states,
not destinations. All four recipe cards resolve to the one detail screen that exists.

**The coded prototype** in [`prototype/`](prototype/README.md) runs the same eleven frames as
routes, with what Figma cannot express here: content scrolling under the floating chrome,
live totals that move when something is logged, and the motion language from
`branding-strategy.md` §8.

## Accessibility

- Macros always pair colour with a **label and a numeric value**, never colour alone.
- Primary buttons use ink-on-coral at 6.16:1; white-on-coral fails at every tint of this hue.
- Touch targets are 44pt minimum, including scan, stepper and remove controls.
- Full contrast matrix in [`branding-strategy.md`](branding-strategy.md) §5.
