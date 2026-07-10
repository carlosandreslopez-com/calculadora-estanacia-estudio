# DESIGN BRIEF — Calculadora de Estancia de Estudiante

> **For the designer (e.g. Claude Design):** this is self-contained — you do **not** need
> access to the codebase. It describes the whole product, its content, and the hard
> constraints your proposal must respect. Please deliver a visual redesign proposal; **our
> team will adapt it into the codebase** (Astro). You don't need to write or run any project
> code, and nothing here gets committed by you.

---

## 1. What the product is

A **single-page web calculator** (no routing, no login) that helps a tourist in Spain work
out the legal deadlines to file a **student-residence application** ("estancia de
estudiante"). The user enters their **arrival date** and how long their tourist stay lasts;
the app returns the valid window of dates to file the application.

- **Language:** **Spanish only**, formal *usted* tone. (All copy below is final/legal — keep
  it; restyle freely, but don't change wording or remove the rule explanations / disclaimer.)
- **Dates:** always `dd/mm/aaaa`.
- **Audience:** people navigating Spanish immigration deadlines — **often on mobile, mixed
  digital literacy, high-stakes/anxious context.** Prioritize **clarity, trust, legibility,
  large tap targets, and unmistakable error/result states** over decoration.

## 2. The two rules the UI exists to explain (keep this copy)

- The application must be filed within the **first 30 days** after arrival.
- The course must start **at least 60 days** after filing, and still before the tourist stay
  legally ends.

## 3. Page structure & content (everything that's on the one screen)

**A. Header**

- H1: **"Calculadora de Estancia de Estudiante"** (currently a sky→emerald gradient).
- Subtitle (verbatim): *"Calcula tus plazos clave. La solicitud debe presentarse dentro de
  los primeros **30 días** de tu llegada. Además, el curso debe iniciar al menos **60 días**
  después de tu solicitud, pero siempre antes de que finalice tu estancia legal como turista."*

**B. Input panel — "Ingresa los Detalles del Cálculo"**

1. **Mode toggle** — label *"Define tu estancia de turista:"* with two segmented options:
   **"Con Duración (días)"** and **"Con Fecha de Salida"**. (Mutually exclusive; one active.)
2. **"Fecha de Llegada"** — text field, placeholder `dd/mm/aaaa`, with a **calendar-picker
   button** (icon) that opens a custom date picker.
3. **Conditional field** depending on the toggle:
   - duration mode → **"Duración Estancia (días)"** numeric input (min 1).
   - date mode → **"Fecha de Salida de Turista"** text field + calendar picker. When valid,
     shows a helper line: *"Duración de la estancia calculada: N días."*
4. **"Calcular"** button (primary action, with a calculator icon).
5. **Error state** (when input is invalid / no valid window): a red alert box with an icon
   and a Spanish message.

**C. Custom calendar picker** (popover over the field)

- Month grid, **Spanish month & weekday names** (Enero…Diciembre; Dom, Lun, Mar, Mié, Jue,
  Vie, Sáb), prev/next month arrows. States needed: **default day, hover, selected, today.**

**D. Results — "Resultados del Cálculo"** (replaces an empty/waiting state)

- **Empty/initial state:** calendar icon + *"Esperando Cálculo"* + *"Ingresa tus datos
  arriba y haz clic en 'Calcular' para ver tus fechas límite."*
- **"Nuevo Cálculo"** reset button (secondary action, refresh icon).
- **Two summary cards:**
  - **Highlighted/primary:** *"Fecha Límite Máx. de Presentación"* + a date (the key answer).
  - Secondary: *"Fecha de Salida de Turista Calculada"* + a date.
  - Caption: *"*La fecha límite es la que ocurra primero: 30 días desde la llegada o 60 días
    antes de la salida."*
- **"Desglose Diario de Presentación"** — a per-day breakdown, with caption about the 60-day
  estimate being common but not a strict legal requirement. **Two responsive layouts:**
  - **Desktop:** a 4-column table — *Fecha de Presentación · Días Restantes (Presentación) ·
    Rango de Fecha de Inicio del Curso · Días Restantes (Turista)*. "Días restantes
    (presentación)" is shown as a small badge/pill.
  - **Mobile:** the same rows as **stacked cards** (presentation date on top; two big number
    stats "Días P/ Presentar" and "Días de Turista"; a highlighted course-start date range).

**E. Disclaimer (legal — keep)**

- A distinct **caution-styled** box (currently yellow): heading *"Descargo de
  Responsabilidad"* + the legal paragraph (orientativo, no es asesoría legal…), and a muted
  line: *"Próximamente: Encuentre profesionales de inmigración recomendados aquí."*

**F. Footer**

- A tiny monospace line showing the page-load version timestamp:
  *"Versión de página cargada: …"*.

## 4. Current look (starting reference — feel free to elevate)

Dark theme: **slate-900** background; translucent **slate-800** panels with **slate-700**
borders and soft shadows; **sky-blue** primary actions/accents; **emerald/cyan** for the
highlighted result; **yellow** for the disclaimer; **red** for errors. Default sans-serif.
Subtle fade-in and a custom slim scrollbar. It's clean but generic — we'd love a more
distinctive, trustworthy, "official tool" identity.

## 5. Hard constraints (please design within these)

- **Responsive, mobile-first.** Many users are on phones; the breakdown already has a
  dedicated mobile card layout — keep a great small-screen experience.
- **Accessibility:** strong contrast, visible focus states, large tap targets, clear labels.
  This is a public tool used under stress — err toward legibility over subtlety.
- **Lightweight & mostly static.** The page is static HTML except for the interactive
  calculator (form + results + calendar). Effects should be CSS-based; please **don't** rely
  on heavy animation/UI libraries.
- **Dark mode is the current baseline** — tell us if you're proposing light mode (or both).
- **Don't change the logic or the wording** — layout/visuals only. Same fields, same
  results, same Spanish copy.

## 6. What we need back (so we can implement it)

In rough priority:

1. **Design tokens / values** — color palette (hex), type scale + **font family** (and
   whether to self-host or use a web font), spacing, radii, shadows. A simple token list is
   perfect; we'll translate it.
2. **High-fidelity mockups of every section above**, at **mobile and desktop** widths.
3. **All interactive states**: default / hover / focus / active / disabled, plus the
   **empty (waiting)**, **error**, and **loading** states, and the calendar day states.
4. **Assets as files** — any icons (SVG preferred), fonts (with license), logo/imagery.
5. **Accessibility notes** — focus order and contrast ratios for key text/controls.

> **Format note:** if you can express it as **utility-class-based markup it's easiest for us
> to adapt; if you produce Figma/screenshots, include redline specs (sizes, paddings,
> colors). We build with a utility-first CSS approach, so token-based output adapts best.**

---

## 7. Internal implementation notes (for our team — not for the designer)

> Where each piece lands when we adapt the proposal. The designer can ignore this section.

- **Stack:** Astro 7 + React 19 (single `client:only` island) + **Tailwind v4** (compiled via
  `@tailwindcss/vite`; **no `tailwind.config` — use a `@theme` block** in
  `src/styles/global.css`). Watch for designer output in **Tailwind v3** syntax (config file
  / `@tailwind` directives) and convert to v4 (`@import "tailwindcss"` + `@theme`).
- **Static `.astro` (zero JS):** `Header.astro`, `Disclaimer.astro` (+ version `is:inline`
  script), page shell in `src/pages/index.astro`, shell in `src/layouts/Layout.astro`.
- **React island:** `Calculator.tsx` (state) → `DataEntryForm.tsx`, `ResultsTable.tsx`,
  `CalendarPicker.tsx`, `FormLayout.tsx`, `IconComponents.tsx`. All interactive states live
  here. Loading state = the `slot="fallback"` on the island in `index.astro`.
- **Do not touch** `src/services/calculationService.ts` (UTC date math, 30/60-day rules) —
  presentation only. If a new font is added, load it in `Layout.astro` and define tokens in
  `global.css`. Verify with `pnpm check` (0/0/0) + `pnpm build`. **pnpm only.**
