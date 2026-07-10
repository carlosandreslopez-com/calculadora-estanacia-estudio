# IMPLEMENTATION PLAN — UX/UI redesign + code hardening

> **For the executing agent.** Follow phases in order; each phase ends with a verification
> gate and a commit. Visual source of truth: `.docs/handoff/Calculadora de Estancia -
> Institucional v2.dc.html` (open in a browser; `support.js` is only its preview runtime —
> never ship it). Token/component spec: `.docs/handoff/HANDOFF.md`. Constraints recap:
> CLAUDE.md + `DESIGN-BRIEF.md` §7.
>
> Written 2026-07-05. Decisions below were confirmed with the owner — do not re-litigate them.

---

## 0. Locked scope decisions (owner-confirmed 2026-07-05)

| # | Decision | Choice |
|---|---|---|
| D1 | Calculation flow | **Live results** — remove the "Calcular" button. Results recompute on every input change; a status banner (incomplete / error / success) is always visible; a waiting card shows in place of results until inputs produce a valid plan. |
| D2 | Languages | **Spanish only for this redesign.** Do NOT build the ES/EN/PT-BR toggle now — it is a separate follow-up phase (the EN/PT strings live in the mock for when that happens). Use the final ES strings from the mock. |
| D3 | Lead-gen | **PDF + Share in the redesign PR; email capture as its own follow-up phase.** Implement "Descargar PDF" (`window.print()` + print styles) and "Compartir enlace" (clipboard + toast) in Phase 3. Advisor CTA = static block. Email capture ("Enviar a mi correo") is IN scope but ships separately with its privacy/compliance work — see **Phase 5**. *(Amended by owner 2026-07-05; originally deferred.)* |
| D4 | Date inputs | **Native `<input type="date">`** per the mock. Delete `CalendarPicker.tsx`. Convert values at the form boundary (`yyyy-mm-dd` → `dd/mm/aaaa`) before calling the service. |

> **AMENDMENT (owner, 2026-07-10) — month-based FLMP.** The owner changed the deadline
> rule: `maxPresentationDate` is now the earlier of **(arrival + 1 month)** and
> **(exit − 2 months)**, computed "de fecha a fecha" with month-end clamping — no longer
> min(arrival+29d, exit−60d). Implemented on branch `flmp-month-rule` together with the
> Phase-1 Vitest safety net (pulled forward; 17 tests exist). The daily breakdown is still
> day-based pending the lawyer's confirmation (demo highlights the month-rule row); "Step B"
> makes the table fully month-consistent — see WORKLOG 2026-07-10 for the open legal
> questions. **Consequences for this plan:** the "never modify calculationService" rule
> below is softened to "no behavior changes beyond the confirmed month rule, always
> test-covered"; Phase 1.1–1.2 are done; every place the redesign restates "30 días / 60
> días" (Header copy, result captions, mock `es` strings, Phase 3/4 QA numbers) must use
> the month wording instead once the lawyer confirms. Also: repo is in **local-only mode**
> (no pushes) per the owner, so Phase 0.2/0.3 (push, bump-node-24) are on hold.

## Hard rules (from CLAUDE.md / HANDOFF §7 — violations = failed task)

- **Never modify `src/services/calculationService.ts`.** Do not port the mock's inline JS date
  math (`plan()`, `fmt*` in the `.dc.html`) — it exists only to make the mock interactive.
  All numbers/dates come from the existing `calculateStudyStayBreakdown()`.
- Legal copy verbatim: header subtitle, the two result captions (30/60-day notes), the full
  disclaimer paragraph, "Próximamente: Encuentre profesionales…". New UI strings (banner,
  waiting state, timeline labels, buttons) come verbatim from the mock's `es` string set.
- **pnpm only.** Tailwind **v4** only (`@import "tailwindcss"` + `@theme` in
  `src/styles/global.css`; no `tailwind.config`, no `@tailwind` directives).
- Keep the islands model: exactly one React island (`Calculator`, `client:only="react"`);
  header/disclaimer/shell stay `.astro` with zero JS (the version line's `is:inline` script
  is fine).
- Explicit `.ts`/`.tsx` import extensions; no `import React` unless a `React.*` type is used.
- Gate for every commit: `pnpm check` → **0 errors / 0 warnings / 0 hints**, `pnpm build`
  passes. (After Phase 1: `pnpm test` passes too.)
- If unsure about an Astro API, consult the `astro-docs` MCP (`search_astro_docs`) — don't guess.

---

## Phase 0 — Housekeeping (repo state)

Current state: local `main` is **1 commit ahead** of `origin/main` (`49ba965`), with
uncommitted changes (`.vercelignore`, `DESIGN-BRIEF.md`) and untracked `.docs/`.

1. Commit the pending work as-is: `.vercelignore` (adds `.docs`), the `DESIGN-BRIEF.md`
   trim, the `.docs/handoff/` deliverable, and this plan. Suggested message:
   `docs: receive design handoff (tokens + mock) and implementation plan`.
2. Push `main` (this deploys — it's docs-only relative to `a1d45e0`, safe).
3. Resolve `bump-node-24` (open item since June): **merge it and align** — Node 24 is the
   active LTS and Vercel supports it. Update `package.json` `engines` to `24.x`, confirm the
   Vercel project's Node setting matches, then delete the branch (local + remote). If the
   branch has conflicts or looks stale beyond the version bump, delete it instead and do the
   bump fresh. Either way the item closes.
4. Update `WORKLOG.md` (see §"WORKLOG corrections" at the bottom) — resume block is stale.
5. **Domain (parallel track, owner-driven):** the owner is still choosing a name
   (2026-07-05). Once bought: add it to the Vercel project, make it the canonical URL.
   It is a **hard prerequisite for Phase 5** (Resend needs DNS-verified SPF/DKIM to send
   the results email from the real domain) and matters for the share link + SEO. Naming
   guidance: Spanish, says what the tool does, avoids implying it's a government service
   (legal/confusion risk — the tool is explicitly *orientativo*). Shortlist to check:
   `calculadoraestancia.es`, `calculatuestancia.es`, `estanciaestudiante.es`,
   `plazosextranjeria.es` (broader — room to grow into more immigration-deadline
   calculators, good for the lead-gen ambition), `misplazos.es`.

**Gate:** `git status` clean, `main` pushed, Vercel deploy green, `bump-node-24` gone.
(Domain may resolve later; just don't start Phase 5 without it.)

## Phase 1 — Safety net + refactors (before touching visuals)

The redesign rewrites every component around the domain logic. Lock the logic down first.

1. **Add Vitest** (devDependency; native Vite/Astro fit — do not add Jest):
   `pnpm add -D vitest`, script `"test": "vitest run"`. No config needed for pure-TS tests.
2. **Unit-test `calculationService.ts`** (tests in `src/services/calculationService.test.ts`;
   this tests the file, doesn't modify it). Cover at least:
   - 90-day duration from a fixed arrival: breakdown has 30 rows (or fewer per the rule),
     `maxPresentationDate` = min(arrival+29, exit−60); assert exact dates.
   - Duration mode vs exit-date mode give identical results for equivalent inputs
     (exit = arrival + duration − 1).
   - `remainingPresentationDays` counts down to 1; `remainingTouristDays` of the first row
     equals the total stay length.
   - Stay of exactly 61 days → exactly 1 valid row; 60 days → throws the "Imposible cumplir
     los plazos" error; too-short stay throws.
   - Invalid inputs throw the right Spanish messages: bad format, nonexistent date
     (31/02/2026), exit before arrival, duration ≤ 0, missing arrival.
   - DST/timezone insensitivity: dates spanning a DST change (e.g. late March Europe) still
     step exactly 1 UTC day per row.
3. **Extract shared date utils** to a new `src/utils/dateUtils.ts`: `parseSpanishDateUTC`,
   `formatDateToSpanish`, `diffInDays`, `addDays` — plus new `isoToSpanish` /
   `spanishToIso` (`yyyy-mm-dd` ↔ `dd/mm/aaaa`, needed for D4). Have
   `calculationService.ts` … **exception to the "never modify" rule:** replacing its private
   helper definitions with imports from `dateUtils.ts` is allowed **only if** the moved code
   is character-identical in behavior and the Phase-1 tests pass before AND after. No other
   edits. If in doubt, leave the service untouched and only de-duplicate the component side.
   Remove the duplicated helpers from `DataEntryForm.tsx` / `ResultsTable.tsx` and import.
4. **Delete the DOM style injection** at the bottom of `CalendarPicker.tsx` (lines ~113–129)
   — it appends a `<style>` at import time. (The whole file is deleted in Phase 3; if Phase 3
   is deferred, move those keyframes into `global.css` instead.)
5. Also update CLAUDE.md's "Date handling" note (the helpers are no longer duplicated) and
   add the `pnpm test` command.

**Gate:** `pnpm test` green, `pnpm check` 0/0/0, `pnpm build` OK. Commit
(`test: add calculation service tests; refactor shared date utils`).

## Phase 2 — Design tokens, fonts, static shell

1. **Fonts — self-host** (audience is EU; avoid the Google Fonts CDN for GDPR):
   `pnpm add @fontsource/newsreader @fontsource/public-sans`. In `Layout.astro` import the
   used weights only (Newsreader 400/500/600; Public Sans 400/500/600/700). If the
   `@fontsource` subpath imports fight `astro check`, fall back to downloading the two
   families as woff2 into `public/fonts/` + `@font-face` in `global.css` (license: SIL OFL,
   include OFL.txt).
2. **`src/styles/global.css`:** replace contents with `@import "tailwindcss";` + the exact
   `@theme` block from HANDOFF §1.4. Add: `body { background: var(--color-bg); color:
   var(--color-ink); font-family: var(--font-sans); }`, the `fadeUp` and `spin` keyframes,
   a light-theme scrollbar (replace the current slate one: track `#eceae3`, thumb `#cfcabc`,
   hover `#b8b2a2`), and a `@media print` block: hide `.no-print` (buttons, toggles, advisor
   CTA, toast), force white bg, expand the breakdown if collapsed.
3. **`Layout.astro`:** drop `bg-slate-900` from `<body>` (theme comes from CSS); add
   `<meta name="description" content="Calculadora de plazos para la solicitud de estancia
   por estudios en España: fecha límite de presentación según las reglas de 30 y 60 días.">`
   and a favicon (`public/favicon.svg` — simple calendar glyph, `--color-primary` on
   transparent; reference it in `<head>`). Keep the `APP_VERSION` inline script.
4. **`index.astro`:** replace the dark shell with the mock's: centered container
   `max-width:880px`, page padding per HANDOFF §2, order per HANDOFF §3 (utility bar →
   header → island → advisor CTA → disclaimer → version). The old `<main>` card wrapper
   disappears — the input card / results are their own cards inside the island. Utility bar:
   render only the left badge ("Herramienta orientativa · España" per the mock) as static
   `.astro`; **no language toggle (D2)**. Update the island's `slot="fallback"` to the light
   theme: input-card-shaped skeleton + spinner (HANDOFF §3 "loading").
5. **`Header.astro`:** H1 in Newsreader 500, `--color-ink` (gradient text is gone), sizes
   44/31px; subtitle in Public Sans, `--color-muted`, **copy unchanged**.
6. **`Disclaimer.astro`:** restyle to the warn tokens (`--color-warn-bg/border/ink/accent`),
   "i" glyph per mock; legal copy + "Próximamente" line unchanged; version line stays mono
   via `--font-mono`. The advisor CTA (dark `--color-ink-block` block, white button, static;
   button can be a plain anchor placeholder or omitted action per D3) lives in `index.astro`
   or its own small `.astro` component, `class="no-print"`.

**Gate:** `pnpm dev` — page shell, header, disclaimer match the mock at 375px and 1280px
(island still old-styled inside; that's expected). `pnpm check`/`build`/`test` green. Commit.

## Phase 3 — The island (form, banner, waiting, results)

Rewrite the island's internals per HANDOFF §3. Keep the one-island architecture; suggested
file split (all under `src/components/`):

- `Calculator.tsx` — state + derivation. Replace submit flow with **derived live state
  (D1)**: keep raw input state (arrival ISO, mode, duration string, exit ISO) here (lifted
  from the form), derive the result with `useMemo`: inputs incomplete → `{ status:
  'incomplete' }`; complete → call `calculateStudyStayBreakdown` in try/catch → `{ status:
  'success', result }` or `{ status: 'error', message }`. No stale-state resets needed;
  "Nuevo Cálculo"/reset button is gone (mock has none — clearing inputs returns to waiting).
- `DataEntryForm.tsx` — input card: mode toggle ("Por duración (días)" / "Por fecha de
  salida" — new labels from the mock), arrival + conditional field as native date/number
  inputs (48px tall, sunken bg, focus ring per HANDOFF), calculated-duration helper line.
  No `<form>`/submit needed; it's controlled inputs reporting up. Delete the Calcular button.
- `StatusBanner.tsx` — the three variants (incomplete/error/success) per HANDOFF §3.C, with
  `aria-live="polite"` and icon + text (never color alone). Error text: use the service's
  thrown Spanish message.
- `WaitingCard.tsx` — dashed-border empty state ("Esperando tus fechas" + helper, mock copy).
- `ResultsSummary.tsx` — hero card (navy gradient inline style, eyebrow, long-format Spanish
  date — build the long format presentation-side from the `Date`, e.g. "12 de agosto de
  2026", plus `dd/mm/aaaa` short line), days-available chip (= `breakdown.length`),
  governing-rule note (30-day rule governs when `maxPresentationDate` = arrival+29, else
  60-day — derive, don't recompute); two stat cards (salida + total days; course window =
  `breakdown[0].courseStartDateMin` → `exitDate`); the 4-milestone timeline (arrival /
  deadline / earliest course start / departure — values all from `CalculationResult`).
  PDF + Share buttons (D3): `window.print()`; `navigator.clipboard.writeText(location.href)`
  in try/catch + toast ("Enlace copiado…" per mock). Toast = small `useState`/timeout,
  `role="status"`, `.no-print`. **Do not build the email form in this phase** — leave the
  lead-CTA card rendering only the PDF/Share row; the email input + button from the mock
  are added in Phase 5 (they need the consent checkbox + backend first). Build the toast
  and card layout so the form slots in without rework.
- `ResultsTable.tsx` — collapsible "Desglose diario" card: header `<button>` with
  `aria-expanded` + chevron; desktop 4-col zebra table / mobile stacked cards (same data as
  today, new tokens); days-left pill red when ≤ 7, navy outline otherwise. **Keep both
  legal captions verbatim** (the "*La fecha límite es la que ocurra primero…" and the
  60-day-estimate caption). Results block wrapper gets `animation: fadeUp .35s`.
- `IconComponents.tsx` — replace with the HANDOFF §5 set as inline SVGs (check, x,
  alert-triangle, download, share, calendar, info, chevron-down; 1.5px stroke,
  `currentColor`). Delete unused icons.
- **Delete `CalendarPicker.tsx` (D4)** and `FormLayout.tsx` if the new grid makes it trivial
  (a 13-line div wrapper — inline it).
- Native-date boundary (D4): inputs give `yyyy-mm-dd`; convert with `isoToSpanish` before
  calling the service so its dd/mm/aaaa contract is untouched. Display formats stay
  dd/mm/aaaa everywhere.
- Accessibility per HANDOFF §4: real `<label>`s, ≥44px targets, focus-visible ring
  everywhere, `aria-pressed` on toggle buttons (coerce to real boolean — `x != null &&` —
  @types/react 19 gotcha), no `React.FormEvent` (deprecated; you likely won't need form
  events at all now).

**Gate:** manual QA vs the mock (dev server, 375px + 1280px): waiting → success → error
(set a 45-day stay) → back; banner announces via screen-reader tooling if available; print
preview sensible; share copies. `pnpm check` 0/0/0, `build`, `test` green. Commit.

## Phase 4 — Ship

1. Full pass of the QA checklist:
   - [ ] Arrival + 90 days duration → 30-row breakdown, deadline = arrival+29.
   - [ ] Same dates via exit-date mode → identical output + duration helper line.
   - [ ] 61-day stay → 1 row; 60-day stay → error banner with the service's message.
   - [ ] Incomplete inputs → info banner + waiting card (no crash, no flash of results).
   - [ ] Mobile: breakdown renders as stacked cards; no horizontal page scroll at 320px.
   - [ ] Keyboard-only walkthrough: visible focus ring on every control, logical order.
   - [ ] Print (Descargar PDF): white bg, no buttons/toast, breakdown visible.
   - [ ] Footer version timestamp still fills in.
   - [ ] No console errors; built `dist/index.html` still has exactly one `<astro-island>`.
2. Update **CLAUDE.md** (styling section: light theme + tokens; component list; live-flow
   description; test command) and **README** if it describes the UI.
3. Add a **WORKLOG entry** (done/why/verified/pending) and refresh the resume block.
4. Commit, push to a branch, **open a PR** (the tuned `claude-code-review.yml` runs on PRs)
   rather than pushing straight to `main` — this is the biggest visual change since the
   migration and preview deploys are free.
5. **Client approval gate (owner-confirmed 2026-07-05):** send the Vercel **preview URL**
   to the client and get their explicit OK on the new look **before merging**. Do not merge
   to `main` on QA alone. After the OK: merge, verify the production deploy, note the
   previous deployment as the Instant-Rollback point.
6. Once merged, enable **Vercel Web Analytics** on the project (cookieless — needs no
   consent banner; see Phase 6 before adding anything cookie-based). Add
   `@vercel/analytics` per its Astro instructions so page views + the future email-submit
   conversion are measured from day one.

## Phase 5 — Email capture + privacy compliance (own branch/PR, after Phase 4 ships)

The mock's feature is **"Enviar a mi correo"** — email the user their computed deadlines.
That is a *transactional* send (the user requests it) **plus** optional lead capture.
Those are two different legal bases — build them as such. Compliance targets:
**GDPR/LOPDGDD** (EU/Spain), **LGPD** (Brazil — the audience includes PT-BR speakers),
**CCPA/CPRA + CAN-SPAM** (US).

**Business model (owner, 2026-07-05):** the tool's main purpose is generating **leads for
immigration lawyers / gestores colegiados**, and/or **selling them ad placements**. The two
monetization paths have very different compliance costs — the implementation must keep them
distinct:

- **Path A — sponsored placements/ads on the site** (lawyers pay to be shown; user data never
  leaves us): no extra consent needed. As long as ads are static/sponsored listings (no ad
  network, no tracking scripts), there is still no cookie banner requirement. **Start here.**
- **Path B — passing/selling the captured leads to lawyers** (user data is disclosed to third
  parties): under GDPR/LGPD this requires **explicit consent that names the recipients** —a
  generic "receive info" checkbox does NOT cover it. Under CCPA this is a "sale/share" of
  personal information (notice + right to opt out; the privacy policy cannot claim "we do not
  sell"). The consent checkbox and privacy-policy wording below are written for Path B so the
  leads are legally usable for it from day one — collecting consent correctly now is far
  cheaper than re-permissioning a list later.

### 5.0a Design coverage note (owner asked 2026-07-05)

The handoff/mock fully covers Phases 0–4; **nothing in the redesign waits on the designer.**
The pieces below were never in the design scope — the agent derives them from the existing
token system (HANDOFF §1) rather than inventing new styles. If pixel-perfect consistency is
wanted, the owner can request a small design addendum from Claude Design *before Phase 5
starts* (it is optional, not a blocker):

| Not in the mock | How to derive it |
|---|---|
| The two **consent checkboxes** (mock has a bare email input) | Standard checkbox at 20–22px, `--color-border-input` border, `--color-primary` when checked, focus ring per HANDOFF; caption-size label (`--color-muted`). |
| **`/privacidad` page** | Text page: reuse Layout, container, card + type tokens. |
| **Results / DOI confirmation emails** (HTML) | Simple single-column email: paper bg, navy headings, table of the key dates; email clients ignore most CSS anyway — keep it near-plain. |
| **`/api/confirm` landing state** | Reuse the success-banner card style on a minimal page. |
| **Cookie banner** (Phase 6) | Theme CookieConsent v3's CSS variables with the §1.4 tokens. |
| **Favicon** | Simple calendar glyph in `--color-primary` (Phase 2.3). |
| Future **ad placements** (Path A) | Not designed at all — request designs when monetization starts. |

### 5.0 Chosen stack (owner asked for the best free / open-source options)

| Concern | Choice | Why |
|---|---|---|
| Server endpoint | **`@astrojs/vercel` adapter** + `POST /api/subscribe` with `export const prerender = false` (pages stay static) | Already on Vercel; zero extra infra. CLAUDE.md's "add the adapter only if server endpoints are introduced" moment is now. |
| Storage (emails + consent records) | **Neon** free tier (owner's choice 2026-07-05; Supabase equally viable, not required) | Serverless Postgres, open-source engine (Apache-2.0), free tier, **native Vercel Marketplace integration** (install via the Vercel dashboard → `DATABASE_URL` is auto-provisioned into the project env). Pick an **EU region** (e.g. AWS `eu-central-1` Frankfurt) at creation so data stays in the EU. Query from the API route with **`@neondatabase/serverless`** (HTTP driver, made for serverless functions — no connection-pool headaches). The connection string lives **server-side only**; nothing DB-related ever reaches client code. For this feature (one server-side INSERT + one UPDATE) plain Postgres is simpler than Supabase's SDK/RLS machinery. |
| Sending the email | **Resend** free tier (3,000/mo, 100/day) | Pragmatic choice; not OSS. The fully-open-source path (self-hosted **Listmonk**, AGPL — built-in double opt-in, consent records, GDPR-minded) needs a VPS ≈ €4/mo, so it's not *free*; note it in WORKLOG as the upgrade path if volume or ownership needs grow. |
| EU vs US vs BR detection | **Vercel's request geolocation header** (`request.headers.get('x-vercel-ip-country')`) read inside the API route | Free, no database, no IP processing on our side. **Do NOT ship an IP-geolocation database or call an IP-info API** (the repos the owner saw — e.g. `sapics/ip-location-db`, ipinfo's free country DB — solve this for non-Vercel hosts, but here they'd be extra moving parts, and doing your own IP lookups means *you* process IP addresses, which are personal data under GDPR — the opposite of minimization). |
| Cookie-consent banner (CMP) | **CookieConsent v3** (`orestbida/cookieconsent`, MIT, ~50 KB, no deps, GDPR + CCPA modes) — but only lands in **Phase 6**, together with GA4/Pixel | Through Phases 2–5 the site sets **zero cookies and no trackers** (fonts self-hosted, Vercel Web Analytics is cookieless) — no banner needed, no friction. The owner wants GA4 and possibly a Meta Pixel (2026-07-05); those DO require prior opt-in consent in the EU/Brazil, so the banner ships in the same PR as the first tracker — never before, never after. |

### 5.1 Tasks

1. **Adapter:** `pnpm astro add vercel` (verify with astro-docs MCP that static pages remain
   prerendered by default in Astro 7 and only the API route opts out). Confirm the build
   still emits static HTML for `/`.
2. **Privacy policy page** — new static `src/pages/privacidad.astro` (Spanish, reuse
   Layout + tokens): who the controller is (the client — get their legal name/contact),
   what is collected (email, chosen dates, country code, consent timestamp), purposes
   (send the requested results; optional: **sharing contact data with collaborating
   immigration lawyers / gestores colegiados so they can offer their services** — name this
   recipient category plainly), legal bases (consent for both), retention, processors
   (Vercel, Neon, Resend), and rights — access/rectification/erasure/portability
   (GDPR arts. 15–20, LGPD art. 18) with a contact email. **CCPA note:** because leads may
   be sold/shared (Path B), do NOT write "we do not sell personal information" — instead
   state that contact data may be shared with partner professionals only with the user's
   opt-in consent, and that users may withdraw it anytime via the contact email (that
   consent-first design satisfies the CCPA opt-out concept; CCPA thresholds likely don't
   even apply at this scale, but don't write falsehoods). Link the page from the email form
   and the disclaimer footer. **This page needs the client's sign-off before the phase
   ships** — ideally reviewed by one of the immigration lawyers the client works with.
3. **Form UI** (in the Phase-3 lead-CTA card, per the mock + additions):
   - Email input + "Enviar a mi correo" button (mock styles, 48px, focus ring).
   - **Unticked checkbox (required):** consent to receive the results email + privacy-policy
     link. Short Spanish label, e.g. *"He leído la política de privacidad y acepto recibir
     mis resultados por correo."*
   - **Second unticked checkbox (optional, unbundled):** the lead-gen consent. Because the
     business model is passing leads to third parties (Path B), the label must disclose the
     sharing explicitly, e.g.: *"Acepto que mis datos de contacto sean compartidos con
     abogados y gestores colegiados especializados en inmigración para que puedan ofrecerme
     sus servicios."* (GDPR/LGPD: consent must name the categories of recipients; a vague
     "receive info" label would make the leads unusable for Path B.) Final wording needs the
     client's/lawyer's sign-off together with the privacy policy.
   - Disabled submit until email valid + required box ticked; success state per mock
     (`emailOk` string); error toast on API failure. All `.no-print`.
4. **`POST /api/subscribe`** (`src/pages/api/subscribe.ts`, `prerender = false`):
   - Validate email server-side; honeypot field + basic same-origin check (cheap spam guard).
   - Read `x-vercel-ip-country`; store **only the 2-letter country code** — never the IP.
   - Insert consent record into Neon (via `@neondatabase/serverless`): email, country,
     `lead_sharing_consent` boolean, consent-text version, timestamp, and the calculated
     dates payload. One `subscribers` table; schema in a checked-in `db/schema.sql`
     (Neon free tier has no migration tooling — keep the canonical DDL in the repo).
   - Send the results email via Resend: the deadline summary (hero date, salida, course
     window — rendered server-side from the posted payload; **re-derive nothing** — the
     client posts the already-calculated dd/mm/aaaa strings), a link back to the site, the
     mandatory footer: controller identity + unsubscribe/erasure contact (CAN-SPAM + GDPR).
   - If `lead_sharing_consent` was ticked, send a **double-opt-in confirmation** ("confirma
     tu autorización" link → `GET /api/confirm?token=…` flips a `confirmed_at` column).
     DOI isn't strictly mandated by GDPR but is the standard proof of consent in
     Spain/Germany/Brazil practice — and since these leads will be handed to third parties,
     verifiable consent records are exactly what protects the client. **Only `confirmed_at
     IS NOT NULL` rows may ever be shared with lawyers.**
   - Env vars via Vercel (`DATABASE_URL` — auto-set by the Neon Marketplace integration —
     and `RESEND_API_KEY`); add `.env.example`. Rate-limit lightly (e.g. per-IP in-memory
     or a Neon count check).
5. **Data minimization defaults:** no analytics, no logs of email addresses in Vercel logs
   (don't `console.log` the body); the Neon database is reachable only via `DATABASE_URL`
   in the server env — never expose it or query from the client. When leads are exported
   for lawyers, export only confirmed rows and record to whom/when (a simple
   `shared_with`/`shared_at` column keeps the GDPR accountability trail).
6. Update CLAUDE.md (adapter now present; new commands/env vars; privacy page), README,
   WORKLOG (entry + resume block), and the QA checklist:
   - [ ] Submit with valid email + consent → success state; row in Neon; email arrives
         with correct dates and footer.
   - [ ] Submit without ticking consent → blocked client-side AND rejected server-side.
   - [ ] Lead-sharing box ticked → DOI email; confirm link flips `confirmed_at`; unticked →
         no DOI email and row marked non-shareable.
   - [ ] No IP stored anywhere; country code only.
   - [ ] `/privacidad` reachable from the form and footer; `pnpm check` 0/0/0; build static
         for `/`, serverless only for `/api/*`.

**Gate:** all of the above + client sign-off on the privacy-policy text. Separate PR.

## Phase 6 — GA4 / ad pixels + consent banner (own PR, when the owner picks channels)

Owner (2026-07-05) wants Vercel Web Analytics (ships in Phase 4.6 — cookieless, no banner)
**plus GA4**, and possibly a **Meta Pixel** once the acquisition channel (IG/FB/etc.) is
chosen. GA4 and Pixel set cookies/fingerprint → in the EU and Brazil they may only fire
**after opt-in consent**. Rules for this phase:

1. **Trackers and banner ship together, atomically.** GA4 must never be live on production
   without the CMP — that's the most common (and most fined) GDPR mistake on small sites.
2. **CMP: CookieConsent v3** (`orestbida/cookieconsent`, MIT). Load it in `Layout.astro`
   (plain `<script>`, no island needed). Categories: necessary (always on) / analytics /
   marketing. Spanish copy; equal-prominence "Aceptar" / "Rechazar" buttons (AEPD guidance —
   no dark patterns).
3. **GA4 via Google tag with Consent Mode v2**: default all consent signals to `denied`,
   update from CookieConsent's callbacks. Anonymize where possible; disable Google-signals
   ads features unless actually running Google Ads.
4. **Meta Pixel** (covers both IG and FB — one pixel regardless of channel): same treatment,
   gated behind the `marketing` category. Don't add it until a channel decision exists;
   an unused pixel is pure compliance surface. TikTok/other channels: same pattern.
5. Region behavior: EU/UK/BR → banner blocks trackers until opt-in; US → looser (opt-out)
   is legally arguable, but running **opt-in everywhere is simpler and safer** at this
   scale — recommended default. (If region-gating is insisted on, reuse the Phase-5 geo
   endpoint.)
6. Update `/privacidad` (cookies section: what GA4/Pixel collect, retention, how to change
   consent) — the CMP's "manage preferences" link must live in the footer permanently.
7. QA: with everything rejected, network tab shows **zero** requests to google/meta;
   consent persists across reloads; `pnpm check`/`build` clean.

**Recommended sequencing:** don't block the redesign or the email capture on this — Vercel
Web Analytics answers "is there traffic / do people submit?" banner-free. Add GA4+Pixel
only when ad spend actually starts and the channel is chosen.

## Phase 7 (deferred backlog — do NOT do now)

- ES/EN/PT-BR language toggle (D2): presentation-layer strings object; the mock's `strings()`
  has all final copy. Requires deriving banner error text from error *type* (not the thrown
  Spanish message) — plan that refactor then. Set `lang` attr to match. (When it lands, the
  results email, privacy page, and consent banner need the same language treatment.)
- Advisor CTA gets a real destination (today: static block / toast). When monetization
  starts, Path A (sponsored placements for lawyers/gestores) slots in here — static,
  no tracking, no new compliance surface.
- Lead delivery upgrades (owner undecided 2026-07-05): per-lead email notification to the
  client (small API-route addition) or a protected admin dashboard (meaningful scope: auth +
  routes). Manual export from Neon is the deliberate starting point.
- Self-hosted **Listmonk** replacing Neon+Resend if the mailing list grows (see §5.0).
- Optional dark mode as a second `@theme` scope (HANDOFF explicitly out of scope).

---

## Code-review findings driving the plan (for context)

1. **No tests** around the only business logic in the app → Phase 1.1–1.2.
2. **Triplicated date helpers** (`calculationService.ts`, `DataEntryForm.tsx`,
   `ResultsTable.tsx`) with a "keep in sync" warning instead of a shared module → Phase 1.3.
3. **`CalendarPicker.tsx` appends a `<style>` to `document.head` at module import** — side
   effect that hard-couples the island to `client:only` and duplicates what CSS can do →
   Phase 1.4 / deleted in Phase 3.
4. **`today` bug in CalendarPicker**: `new Date()` + `setUTCHours(0,0,0,0)` marks the wrong
   "today" near midnight in non-UTC timezones — moot once deleted (D4).
5. **Stale/confusing comment** in `ResultsTable.tsx` ("trick caching" order-swap) → removed
   in the Phase 3 rewrite.
6. **No `<meta name="description">`, no favicon** → Phase 2.3.
7. **Error box lacks `role="alert"`/`aria-live`** — errors aren't announced to screen
   readers → StatusBanner in Phase 3.
8. **Duplicate `CalculationParams` interface** in `Calculator.tsx` vs `calculationService.ts`
   → export once from the service (type-only import), Phase 3.
9. **Redundant `bg-slate-900`** on both `<body>` (Layout) and the page wrapper → Phase 2.
10. **Repo hygiene:** local `main` ahead of origin + stale `bump-node-24` branch → Phase 0.

## WORKLOG corrections (to-do list audit — apply in Phase 0)

The "Resume here" block and open items are out of date:

- ~~"HEAD = df07341, fully pushed, working tree clean"~~ → HEAD is `49ba965`, **ahead 1**,
  working tree dirty (`.vercelignore`, `DESIGN-BRIEF.md`, untracked `.docs/`).
- Open item "Adapt the Claude Design proposal **when it arrives**" → **it arrived**:
  `.docs/handoff/HANDOFF.md` + mock. Rewrite the item as "execute
  `.docs/IMPLEMENTATION-PLAN.md`" and note the owner-approved deviations from the brief
  (light mode only, live results / no Calcular button, ES-only for now; email capture ships
  separately in Phase 5 with the privacy work).
- Open item `bump-node-24` → still valid; closes in Phase 0.3.
- Missing items to add: push pending commit; tests now exist (after Phase 1) and are part
  of the pre-commit gate; **domain purchase** (owner choosing a name — blocks Phase 5);
  Phase 5 (email capture + privacy: Neon EU + Resend + privacy page + lead-sharing consent
  + client sign-off on its text); Phase 6 (GA4/Pixel **only together with** CookieConsent
  v3 + Consent Mode v2 — never a tracker without the banner); Phase 7 backlog (language
  toggle, lead-notify/dashboard, Listmonk upgrade path, dark mode) as explicit deferred
  items so they aren't lost. Also record: client must approve the redesign on the Vercel
  preview URL before merge; Vercel Web Analytics (cookieless) goes live with the redesign.
