# HANDOFF — Calculadora de Estancia de Estudiante (visual redesign)

> For the implementing agent. The visual source of truth is
> **`Calculadora de Estancia - Institucional v2.dc.html`** (open it in the preview).
> This document translates that design into tokens, states, and a component map for an
> **Astro 7 + React 19 + Tailwind v4** codebase. **Presentation only** — do not touch
> `calculationService.ts` or change the 30/60-day logic or any copy wording.

---

## 0. What changed vs. the old dark UI

- Dark slate theme → **light, "official tool"** identity (warm paper background, navy primary).
- Wall-of-days table → **hero deadline + vertical milestone timeline + collapsible breakdown**.
- Added: **waiting/empty state**, explicit **error state**, **mobile stacked-card** breakdown,
  **ES/EN/PT-BR** toggle, lead-gen CTAs (email capture + advisor), version timestamp.
- Results update **live** (no "Calcular" click), but a **waiting state** shows until inputs
  are valid — so the empty-state requirement is still satisfied.

---

## 1. Design tokens

### 1.1 Color palette (hex)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#f4f3ee` | Page background (warm paper) |
| `--color-surface` | `#ffffff` | Cards, panels |
| `--color-surface-sunken` | `#fbfaf6` | Inputs, zebra rows |
| `--color-border` | `#e6e2d8` | Card borders |
| `--color-border-input` | `#ddd8cc` | Input borders |
| `--color-ink` | `#1b1f27` | Primary text |
| `--color-ink-2` | `#2b3340` | Headings in body |
| `--color-muted` | `#525a68` | Body copy |
| `--color-muted-2` | `#7b8290` | Secondary copy |
| `--color-faint` | `#9aa0ac` | Captions, hints |
| **Primary** | | |
| `--color-primary` | `#26385f` | Buttons, active toggle, hero bg base |
| `--color-primary-text` | `#28406e` | Primary text on light (links, pills) |
| `--color-primary-grad` | `linear-gradient(155deg,#2b4068,#1f2e4d)` | Hero card |
| `--color-on-primary-label` | `#9db0d6` | Hero eyebrow label |
| `--color-on-primary-sub` | `#aab8d6` | Hero subtext |
| **Accent: success / "go"** | | |
| `--color-success` | `#2f7d52` | Status dot, course-window accent |
| `--color-success-ink` | `#2c6b48` | Success banner text |
| `--color-success-bg` | `#eef6f0` | Success banner / course pill bg |
| `--color-success-border` | `#cfe4d6` | Success banner border |
| **Error** | | |
| `--color-error` | `#b23b3b` | Error icon, urgent pill text |
| `--color-error-ink` | `#9c3a34` | Error banner title |
| `--color-error-bg` | `#fbeeec` | Error banner / urgent pill bg |
| `--color-error-border` | `#eccfcb` | Error banner border |
| **Warning / info (disclaimer + incomplete)** | | |
| `--color-warn-ink` | `#7c6f4a` | Incomplete banner title |
| `--color-warn-bg` | `#faf8f1` | Disclaimer / incomplete bg |
| `--color-warn-border` | `#ece7da` | Disclaimer border |
| `--color-warn-accent` | `#9a7e3c` | Disclaimer "i" glyph |
| **Dark CTA** | | |
| `--color-ink-block` | `#222a36` | Advisor CTA bg, toast |

> **Note for implementer:** the design is **light mode only**. The brief's dark baseline was
> intentionally dropped (confirmed with the client). If you later want dark mode, mirror these
> as a second `@theme` scope — but it is out of scope for this handoff.

### 1.2 Typography

- **Display:** `Newsreader` (serif), weight 500 — H1, hero date, result figures, timeline dates, waiting title.
- **Body / UI:** `Public Sans`, weights 400/500/600/700 — everything else.
- **Mono:** system mono (`ui-monospace, 'SF Mono', Menlo, monospace`) — version timestamp only.
- Load both from Google Fonts (license: SIL OFL 1.1, self-hosting OK). Weights used: Newsreader 400/500/600, Public Sans 400/500/600/700.

| Role | Size (desktop / mobile) | Family / weight |
|---|---|---|
| H1 | 44 / 31px | Newsreader 500 |
| Subtitle | 16.5px | Public Sans 400 |
| Hero date | 38 / 31px | Newsreader 500 |
| Result figure | 26px | Newsreader 500 |
| Section eyebrow | 13px, 700, uppercase, `.07em` | Public Sans |
| Body | 14–15px | Public Sans 400/500 |
| Caption / hint | 12.5–13px | Public Sans 400 |
| Pill / badge | 13px, 700 | Public Sans |
| Version line | 11.5px | mono |

### 1.3 Spacing, radii, shadows

- **Spacing scale (px):** 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 48.
- **Section gap:** `22px` between stacked sections; `18px` between grid cells.
- **Radii:** card `16px`; inner controls `10–11px`; pills `7–9px`; badge pill full; toggle track `11px`.
- **Shadows:**
  - Card: `0 1px 2px rgba(23,26,33,.04), 0 8px 24px -16px rgba(23,26,33,.12)`
  - Hero: `0 16px 32px -20px rgba(20,28,48,.7)`
  - Toast: `0 12px 30px -10px rgba(0,0,0,.4)`
  - Focus ring: `0 0 0 3px rgba(40,64,110,.14)`

### 1.4 Tailwind v4 `@theme` block (drop into `src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg: #f4f3ee;
  --color-surface: #ffffff;
  --color-surface-sunken: #fbfaf6;
  --color-border: #e6e2d8;
  --color-border-input: #ddd8cc;
  --color-ink: #1b1f27;
  --color-ink-2: #2b3340;
  --color-muted: #525a68;
  --color-muted-2: #7b8290;
  --color-faint: #9aa0ac;

  --color-primary: #26385f;
  --color-primary-text: #28406e;
  --color-on-primary-label: #9db0d6;
  --color-on-primary-sub: #aab8d6;

  --color-success: #2f7d52;
  --color-success-ink: #2c6b48;
  --color-success-bg: #eef6f0;
  --color-success-border: #cfe4d6;

  --color-error: #b23b3b;
  --color-error-ink: #9c3a34;
  --color-error-bg: #fbeeec;
  --color-error-border: #eccfcb;

  --color-warn-ink: #7c6f4a;
  --color-warn-bg: #faf8f1;
  --color-warn-border: #ece7da;
  --color-warn-accent: #9a7e3c;

  --color-ink-block: #222a36;

  --font-display: "Newsreader", serif;
  --font-sans: "Public Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  --radius-card: 16px;
  --radius-control: 11px;
  --radius-pill: 9px;

  --shadow-card: 0 1px 2px rgba(23,26,33,.04), 0 8px 24px -16px rgba(23,26,33,.12);
  --shadow-hero: 0 16px 32px -20px rgba(20,28,48,.7);
}
```

The hero gradient isn't a token — apply inline:
`background: linear-gradient(155deg, #2b4068, #1f2e4d);`

---

## 2. Layout & responsive

- **Container:** `max-width: 880px`, centered. Page padding desktop `32px 24px 72px`, mobile `20px 16px 56px`.
- **Breakpoint:** single break at **`max-width: 640px`** (`sm`). Below it:
  - Input fields grid `1fr 1fr` → `1fr`.
  - Results grid `1.25fr 1fr` → `1fr` (hero stacks above the two stat cards).
  - Daily breakdown **switches from a 4-col `<table>` to stacked cards** (see §3.E).
  - H1 44→31px, hero date 38→31px.

---

## 3. Sections & states

### Order on the page
1. Utility bar (badge + language toggle)
2. Header (H1 + subtitle)
3. Input card
4. Status banner (always visible — info / error / success)
5. **Either** waiting state **or** results block
6. Advisor CTA
7. Disclaimer
8. Version timestamp

### A. Language toggle
Segmented control, 3 options (ES / EN / PT-BR). Active = `--color-ink-block` bg, white text. Inactive = transparent, `--color-faint` text. **Default ES.** Switching re-renders all copy + date formats live.

### B. Input card
- Mode toggle (segmented, 2 options): "Por duración (días)" / "Por fecha de salida". Active = primary bg.
- Always: **Fecha de llegada** (`type=date`).
- Duration mode → **Duración de la estancia (días)** (`type=number`, min 1).
- Departure mode → **Fecha de salida (turista)** (`type=date`) + helper line when valid:
  *"Duración de la estancia calculada: N días."*
- Inputs: height **48px** (≥44px tap target), `--color-surface-sunken` bg, `--color-border-input` border.

### C. Status banner — three variants
| Variant | When | bg / border / icon |
|---|---|---|
| **Incomplete (info)** | inputs missing/invalid | `--color-warn-bg` / `#e1dccd` / `!` amber |
| **Error** | stay too short (no valid 60-day window) | `--color-error-bg` / `--color-error-border` / `✕` |
| **Success** | valid plan | `--color-success-bg` / `--color-success-border` / `✓` |

### D. Waiting / empty state
Shown whenever results are **not** feasible (missing inputs OR stay too short), in place of the results block. Dashed-border card, centered: calendar glyph, *"Esperando tus fechas"* + helper text. (Keeps the brief's "Esperando Cálculo" intent while results are live.)

### E. Results block (only when feasible) — `animation: fadeUp .35s`
- **Hero card** (navy gradient): eyebrow "Fecha límite para presentar", big date (long format), short `dd/mm/aaaa`, a chip with the days-available count, and the governing-rule note (30-day vs 60-day).
- **Two stat cards:** tourist departure (+ total days), course-start window.
- **Timeline:** 4 milestones, numbered dots + connector line. Milestone 2 (deadline) uses primary dot; milestone 3 (course) uses success dot.
- **Lead CTA** (`.no-print`): email capture form → success confirmation; secondary buttons **Descargar PDF** (`window.print()`) and **Compartir enlace** (clipboard + toast).
- **Daily breakdown** (collapsible):
  - Header button toggles open/closed (chevron ▼/▲).
  - **Desktop:** 4-col table — Fecha de presentación · Días rest. (pill) · Ventana inicio del curso · Días turista. Zebra rows. Pill is **red** when ≤7 days left, else navy outline.
  - **Mobile:** one **card per row** — date + days-left pill on top; two big number stats (*Días p/ presentar*, *Días de turista*); a green highlighted course-start range.

### F. Advisor CTA + Disclaimer + Version
- Advisor CTA: dark `--color-ink-block` block, white button. (Lead-gen.)
- Disclaimer: warn-styled box, "i" glyph — **keep legal copy verbatim**.
- Version: mono line, e.g. *"Versión de página cargada: dd/mm/aaaa hh:mm"*.

### Interactive state recipes
- **hover** (buttons): darken primary ~6%, or surface→sunken on ghost buttons.
- **focus-visible:** `box-shadow: 0 0 0 3px rgba(40,64,110,.14)` + `border-color: #26385f`. Keep on every input/button.
- **active:** translateY(1px) optional.
- **disabled:** opacity .5, `cursor:not-allowed` (e.g. submit with empty email).
- **loading** (Astro island `slot="fallback"`): show the input card skeleton + a spinner; `@keyframes spin{to{transform:rotate(360deg)}}`. Banner/results render once hydrated.

---

## 4. Accessibility notes

- **Contrast (WCAG AA):**
  - Body `#525a68` on `#f4f3ee` ≈ 6.2:1 ✓
  - Ink `#1b1f27` on white ≈ 15:1 ✓
  - White on primary `#26385f` ≈ 9.4:1 ✓
  - Success ink `#2c6b48` on `#eef6f0` ≈ 5.1:1 ✓ ; Error ink `#9c3a34` on `#fbeeec` ≈ 6.0:1 ✓
  - Hero eyebrow `#9db0d6` on navy — decorative label; keep ≥14px/700. The actual date (white) carries the meaning.
- **Tap targets:** all buttons/inputs ≥ 44px tall.
- **Focus order:** language toggle → mode toggle → arrival → conditional field → (results) email → send → PDF → share → breakdown toggle → advisor. Don't trap focus; visible ring everywhere.
- **Labels:** every input has a real `<label>`. Add `aria-live="polite"` to the status banner so the result/error is announced on change. The breakdown toggle is a `<button>` with `aria-expanded`.
- **Color is never the only signal:** banners pair color with an icon + text; urgent pills use red **and** a low number.
- **Lang:** set `lang` on `<html>` (or the island root) to match the active toggle so screen readers pronounce dates/words correctly.

---

## 5. Assets

- **Fonts:** Newsreader, Public Sans (Google Fonts / SIL OFL 1.1). Load in `Layout.astro`.
- **Icons:** the mock uses a few unicode glyphs (✓ ✕ ! ⬇ ↗ ✦ 🗓️ i ▼). Swap for inline SVGs in `IconComponents.tsx` — recommended set: check, x, alert-triangle, download, share, sparkle/star, calendar, info, chevron-down. SVG preferred, 1.5px stroke, `currentColor`. No raster assets, no logo needed.

---

## 6. Component map (Astro/React)

| Design piece | Lands in |
|---|---|
| Page shell, container, bg | `src/pages/index.astro` + `Layout.astro` |
| Header (H1 + subtitle) | `Header.astro` (static) |
| Disclaimer + version line | `Disclaimer.astro` (version via existing `is:inline` script) |
| Language toggle | new state in `Calculator.tsx` (or keep ES-only — see note) |
| Input card (toggle + fields + helper) | `DataEntryForm.tsx` + `FormLayout.tsx` |
| Status banner | `Calculator.tsx` (derived from form/result state) |
| Waiting state | `Calculator.tsx` (render when result not feasible) |
| Hero + stat cards + timeline | `ResultsTable.tsx` (or split a `ResultsSummary.tsx`) |
| Daily breakdown (table + mobile cards) | `ResultsTable.tsx` |
| Calendar picker | `CalendarPicker.tsx` — **kept native `<input type=date>` in this design**; if you keep your custom picker, style its day states with the tokens (default = ink-2; hover = surface-sunken; selected = primary bg/white; today = primary-text ring). |
| Icons | `IconComponents.tsx` |
| Loading | island `slot="fallback"` in `index.astro` |

**Language note:** the mock includes EN + PT-BR per the client's request. If the production
scope is Spanish-only, drop the toggle and ship the `es` strings — every label in the design
already has its final Spanish wording.

---

## 7. Don'ts (from the brief)

- Don't change the date math or the 30/60-day rules (`calculationService.ts`).
- Don't reword the legal copy (subtitle, captions, disclaimer).
- No heavy animation/UI libraries — CSS only.
- Tailwind **v4** syntax only: `@import "tailwindcss"` + `@theme`. No `tailwind.config`, no `@tailwind` directives.
- Verify with `pnpm check` (0/0/0) + `pnpm build`. pnpm only.
