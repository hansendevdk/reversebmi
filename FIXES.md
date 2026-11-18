# Fix & polish handover — Reverse BMI Comparison

Scope: static site, `index.html` + `js/script.js`. **Do not redesign.** The current look (dark gray-900 background, gray-800 cards, blue-600 accent, form centered in a 3×2 grid surrounded by the five physique cards) is intentional and must be preserved. Work through the items in order. After each phase, load the page and verify in the browser at desktop AND 375px mobile width.

---

## Phase 1 — Bugs (must fix)

### 1.1 Mobile layout is broken (blocker)
The grid in `index.html` is hard-coded `grid-cols-3 grid-rows-2`, so at 375px each column is ~93px and everything is crushed.

- Change the container to `grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 items-start`.
- Remove the inline `style="min-height: 600px;"` (replace with `md:min-h-[600px]` if the desktop composition needs it).
- On mobile the form must appear FIRST, then the five cards. Use order utilities: give the form `order-first md:order-none` (the empty result divs collapse before calculation, but after calculation the DOM order would put Brad Pitt above the form on mobile without this).
- Verify: at 375px the form is full-width and usable; after Calculate, cards stack vertically below the form. At desktop width the layout is pixel-identical to today.

### 1.2 Number formatting bug — Math.abs applied after toFixed
In `js/script.js` (~line 163), `Math.abs(fatToLoseDisplay)` runs on an already-`.toFixed(1)` string, coercing it back to a number and dropping trailing zeros → output shows "lose 4 kg fat" next to "lose 5.7 kg fat".

- Fix: take `Math.abs()` on the raw number first, then `.toFixed(1)` last. Same for `muscleToGainDisplay`. Pattern:
  ```js
  const fatAbs = Math.abs(unitToggle.checked ? fatToLose / 0.453592 : fatToLose).toFixed(1);
  ```
- Verify: every displayed weight has exactly one decimal (e.g. "4.0 kg", never "4 kg").

### 1.3 Weight input accepts 0 / negative values
`#weight` in `index.html` only has `required`. Submitting 0 or a negative number produces nonsense cards.

- Add `min="20" max="300" step="0.1"` to the weight input (covers both kg and lbs ranges acceptably; if you want to be precise, set min/max dynamically in the unit-toggle handler: kg 20–300, lbs 45–660).

### 1.4 Placeholder inconsistency
Initial placeholder is "Weight in kilograms" (`index.html`), but the toggle handler sets "Weight in kg" / "Weight in lbs" (`js/script.js` ~lines 60, 68).

- Change the HTML placeholder to `Weight in kg` so it matches.

### 1.5 Metric/imperial height range mismatch
Metric select covers 160–200 cm; imperial covers 4'0"–7'11" (≈122–243 cm). A 155 cm user can only use the site in imperial.

- Widen the metric loop in `js/script.js` to 130–220 cm, keep 177 as default selected.

### 1.6 Dead code cleanup
In `js/script.js`:
- Lines ~2–3: `resultsLeft` / `resultsRight` look up IDs `results-left` / `results-right` that don't exist in the HTML. Delete both lines.
- The toggle-thumb JS hack (the `style.transform` lines in the change handler and the whole `DOMContentLoaded` block, ~lines 62–83): the `peer-checked:translate-x-5` class on the thumb never fires because the thumb is not a sibling of the checkbox. Pick ONE mechanism: simplest is to keep the JS transform and delete the dead `peer-checked:translate-x-5` class from the HTML, plus delete the redundant `classList.add/remove('peer-checked:bg-blue-600')` lines (that class is static in the HTML and works on its own — adding/removing it via JS does nothing useful).
- Verify after cleanup: toggling Metric/Imperial still slides the thumb and recolors the track.

### 1.7 Copy fixes
- Jake Gyllenhaal card: the movie is "Road House" (two words), not "Roadhouse" (`js/script.js` physiques array).
- Unify naming: `<title>` says "BMI Compare", the h1 says "BMI Comparison". Use "BMI Comparison" for both.

---

## Phase 2 — Production readiness

### 2.1 Replace the Tailwind CDN
`cdn.tailwindcss.com` is a dev-only tool: it logs a console warning and compiles CSS in the browser on every page load. Options, in order of preference:
1. Run the Tailwind CLI once to generate a small static `css/style.css` containing only the used classes, and link that instead of the CDN script. Remove the inline `tailwind.config` block.
2. If no build step is wanted, at minimum pin the CDN version.

Keep all class names as-is — the visual result must be unchanged.

### 2.2 Meta description
Add `<meta name="description" content="See how much weight you'd need to gain or lose to match famous movie physiques, using reverse BMI.">` to the head.

---

## Phase 3 — Interface polish (keep the current look — refine, don't restyle)

Design intent: the page's signature is the composition — *your inputs in the center, the physiques surrounding you*. Everything below sharpens that; nothing replaces it. Palette stays gray-900 / gray-800 / white / blue-600. No new fonts, no new colors beyond the shades noted.

### 3.1 First-load state (biggest visual win)
Before Calculate, the grid is 5 empty cells around a floating form — the page looks broken/unfinished on load.

- On page load, render all five cards immediately in their grid positions, but in a "preview" state: same card markup, image with `grayscale opacity-50`, name + movie + Target BMI shown, and where the result sentence goes, a single muted line: `Enter your stats to compare.` (text-gray-500).
- On Calculate, re-render the cards in full color with results (existing behavior).
- Implementation: extract a `renderCard(p, resultsHtml, isPreview)` function used by both the load path and the submit path — the five `if (i === 0) ...` assignments can become a lookup array of the five container elements.
- This makes the landing view read as intentional and previews the payoff without changing the layout.

### 3.2 Make the key number scannable
The result is buried mid-sentence. Keep the sentences, but pull the headline delta out:
- Above the sentence(s), add one emphasized line per card: the total change as a figure, e.g. `+19.0 kg` / `−6.1 kg`, styled `text-2xl font-bold` with a small `text-xs text-gray-400 uppercase tracking-wide` label under it ("to match this BMI"). Use `text-blue-400` for the figure — one accent, both directions (do NOT introduce red/green; gaining weight isn't "bad" here).
- The existing explanatory sentences stay below, unchanged.

### 3.3 Unit toggle: show the active side
Both "Metric" and "Imperial" labels are always white, so the current unit isn't obvious at a glance.
- Give the inactive label `text-gray-500`, the active one `text-white font-medium`. Swap in the existing change handler.

### 3.4 Focus states (accessibility floor)
Inputs, selects, and the button have no visible keyboard focus.
- Add `focus:outline-none focus:ring-2 focus:ring-blue-500` to `#weight`, `#bodyfat`, all three selects, and the Calculate button.
- The hidden checkbox toggle is not keyboard-reachable at all: replace `class="hidden"` on the checkbox with `class="sr-only"` and add a focus ring on the track via `peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500` (the track IS a sibling of the peer, so this works).

### 3.5 Motion (subtle, one moment)
- On Calculate, fade/slide the cards in: a small CSS class (`opacity-0 translate-y-2` → transition to visible, staggered ~60ms per card). One orchestrated reveal, nothing else.
- Add a gentle hover on cards: `transition-shadow hover:shadow-lg`.
- Wrap the reveal animation in `@media (prefers-reduced-motion: no-preference)` (or check `matchMedia` in JS) so reduced-motion users get instant results.

### 3.6 Layout tidy
- Move the disclaimer paragraph out of the form and into a `<footer>` at the bottom of the page (`text-xs text-gray-500 text-center max-w-md mx-auto mt-8`). It currently crowds the form's center cell.
- Button label: "Calculate" → "Compare" (the page compares; the toast-level result is a comparison). Keep size/color.

---

## Phase 4 — Housekeeping (needs the owner's decision, don't do silently)

- **Celebrity images**: the five JPGs are likely unlicensed web images. For a public portfolio site, swap for licensed/promotional images or stylized silhouettes. Flag this to the owner; don't delete anything.
- **Stray folder**: `check this folder and see if it's worth keeping or relevant or not/` contains an abandoned, unfinished React scaffold (untracked in git). Owner has confirmed it's superseded — safe to delete when instructed.

---

## Verification checklist (run after all phases)

1. Desktop ≥ 1024px: layout identical to the original composition (form centered, 5 cards around it).
2. 375px mobile: form first, full-width; cards stack below; no horizontal scroll.
3. Metric, 177 cm / 75 kg / 15% bodyfat → Brad Pitt card says lose 5.7 kg fat, lose 0.3 kg muscle, total −6.1 kg.
4. Imperial, 5'10" / 165 lbs / 15% → Brad Pitt total −11.7 lbs.
5. All weights show one decimal place everywhere.
6. Toggle works with keyboard (Tab + Space), focus visible on every control.
7. No console warnings/errors on load.
8. Weight 0 or negative is rejected by the browser before submit.
