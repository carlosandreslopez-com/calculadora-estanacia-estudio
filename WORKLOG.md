# WORKLOG

A running log of what was done, **why**, and what's **pending**. Newest entries on top.
This file is local notes — keep it in the repo but it documents decisions, not code.

Format for each entry:
- **Date** — short title
- **Done:** what changed
- **Why:** the reason / context
- **Pending:** what still needs to happen (carry forward until resolved)

---

## ▶ Resume here (state as of 2026-07-10)

> Read this first after a restart. Quick "where we are / where we left off".

- **Hold partially lifted (owner, 2026-07-10):** the `redesign` branch is pushed — **PR #3**
  (https://github.com/carlosandreslopez-com/calculadora-estanacia-estudio/pull/3) with a
  **Vercel preview**: https://calculadora-estanacia-estud-git-31d816-carlos-projects-3ac98b90.vercel.app
  ⚠️ The preview sits behind **Vercel Authentication** (default deployment protection) — to
  share it with the client/lawyer, either disable it (Vercel dashboard → project → Settings →
  Deployment Protection) or use the deployment's "Share" link. `main` itself stays
  **unpushed** (pushing it deploys production).
- **Branch/sync:** working branch is **`redesign`** (Phases 1–3 of
  `.docs/IMPLEMENTATION-PLAN.md` DONE — light theme + live-results island shipped there,
  carrying the month-rule demo). `flmp-month-rule` = the pre-redesign lawyer demo.
  `main` is **3 commits ahead** of `origin/main` (design handoff docs + gitignore),
  unpushed on purpose.
- **App status:** Astro 7 + React 19 island app, deployed on Vercel (production still runs
  the old dark UI + 30/60-day FLMP). Gates: `pnpm test` (17 tests), `pnpm check` 0/0/0,
  `pnpm build`.
- **Package manager: `pnpm` only** — never `npm`/`yarn` (lockfile + Vercel depend on it).
- **Next action when you return:** lawyer answers → Step B (month-consistent table + copy);
  owner lifts local-only hold → push, PR, client preview approval, merge, Vercel Web
  Analytics (plan Phase 4.4–4.6). Phase 5 (email capture) still blocked on the domain.

### Open / pending items

- [ ] **Client approval on the preview URL** (PR #3 is open, preview deployed — see the
      resume block; unblock sharing by adjusting Deployment Protection). After the OK:
      merge, verify the production deploy, note the previous deployment as the
      Instant-Rollback point, then add Vercel Web Analytics (plan Phase 4.5–4.6).
- [ ] **Retune `.github/workflows/claude-code-review.yml`** — its prompt still describes
      the pre-redesign app (Tailwind Play CDN + SRI, duplicated date helpers, Header.tsx):
      update to the new architecture (dateUtils, tokens/@theme, month-based FLMP).
- [ ] **Lawyer review of the month-based FLMP rule** (demo on `flmp-month-rule`, carried
      into the `redesign` branch UI).
      Questions to resolve — see the 2026-07-10 entry: (a) does "1 mes desde la llegada"
      from 15/01 end 15/02 or 14/02 (implemented: 15/02, same day number); (b) month-end
      clamp 30/04 − 2 meses = 28/02 (owner-confirmed, verify legally); (c) does the
      course-start minimum also become 2 months; (d) short-stay edge where exit − 2 meses
      falls before the arrival date.
- [ ] **Step B after lawyer confirms (owner decision 2026-07-10):** full 2-month
      consistency — breakdown rows end at the month-based FLMP, course ranges become
      "presentación + 2 meses", header/caption copy switches from 30/60 días to 1 mes /
      2 meses (also in the redesign mock strings), remove the demo highlight/legend.
- [x] ~~**Execute the redesign** per `.docs/IMPLEMENTATION-PLAN.md`~~ — Phases 1–3 done on
      `redesign` (2026-07-10). Remaining from Phase 4: the push/PR/approval/analytics steps
      above (blocked by local-only hold).
- [ ] **Push everything** when the owner lifts the local-only hold (`main` + branch/PR).
- [ ] **Decide on `origin/bump-node-24`** — remote branch bumping Node to 24 while
      `package.json` pins 22. Deferred while staying local (resolving it touches the remote).
- [ ] **Domain purchase** (owner choosing a name) — hard prerequisite for redesign Phase 5.

### Recently completed (newest first)

- [x] Redesign Phases 1–3 on `redesign`: shared `dateUtils`, token theme + fonts + light
      shell, live-results island (no Calcular), native date inputs, new components; QA'd
      at 1280/375; month-rule demo carried over. — 2026-07-10
- [x] Month-based FLMP demo for the lawyer on `flmp-month-rule`; Vitest + 17 service
      tests; design handoff committed on `main` (local). — 2026-07-10
- [x] Stage 2: static shell → native `.astro`; clean `astro check`; loading fallback;
      pnpm standardized in docs. Pushed (`df07341`). — 2026-06-24
- [x] Astro migration (PR #1, merged); workflows pushed; installer branch deleted; `main`
      in sync. — 2026-06-23

---

## 📚 Knowledge base (gotchas — don't repeat these)

> Hard-won facts. Verify before changing; these caused real friction.

- **Use `pnpm`, not `npm`.** Docs/commands must say `pnpm …`. Mixing in `npm run …` (even
  just in docs) is a mistake we made and corrected. Vercel build expects the pnpm lockfile.
- **`@astrojs/check` belongs in `devDependencies`.** Running `pnpm astro check` the first
  time auto-installs it into `dependencies` — move it to `devDependencies` (it's build-only,
  shouldn't ship at runtime). `pnpm check` script = `astro check`.
- **`astro build` does NOT type-check.** Run `pnpm check` for that. Keep it at 0/0/0 before
  committing — it's the closest thing to a CI gate (no linter/formatter/tests configured).
- **`client:only="react"` is required** for the calculator island (NOT `client:load`): it
  touches browser APIs during render and must not be server-rendered. The framework hint
  (`"react"`) is mandatory for `client:only`.
- **`client:only` islands can't share state with `.astro` siblings.** Co-stateful pieces
  (the form + results, which share `result`/`error`) must live together inside one island
  (`Calculator.tsx`). Don't split them into separate `.astro`-mounted islands.
- **React 19 + `jsx: react-jsx` needs no `import React`.** An unused `React` import trips
  `astro check`. Import only what you use (`import { useState } from 'react'`).
- **`React.FormEvent` is deprecated in @types/react 19.** Use `React.SyntheticEvent<…>` (or
  a more specific event). `boolean | null` from `a && b` (e.g. `currentDate && …`) breaks
  ARIA boolean props — coerce with `x != null && …`.
- **When unsure about Astro, use the `astro-docs` MCP** (`search_astro_docs`) — don't guess.
  It's also wired into the `@claude` GitHub workflow.
- **Domain logic is sacred:** all date math stays UTC; the 30/60-day rules live in
  `src/services/calculationService.ts` and are restated in `Header.astro` / `ResultsTable.tsx`
  — keep constants and copy in sync (see CLAUDE.md).

---

## 2026-07-10 — Redesign Phases 1–3: light theme + live-results island (branch `redesign`)

**Done:**
- **Phase 1 rest:** extracted all UTC date helpers to `src/utils/dateUtils.ts` (service
  throwing parser + form `tryParse` variant + `isoToSpanish`/`spanishToIso` + long-date
  formatter); components import from there; tests stayed green before/after.
- **Phase 2:** Tailwind v4 `@theme` token block (HANDOFF §1.4), self-hosted
  Newsreader/Public Sans (`@fontsource`, no Google CDN), light scrollbar, print rules,
  meta description + `public/favicon.svg`, new 880px shell in `index.astro` (utility badge
  "Herramienta orientativa · España"), restyled `Header`/`Disclaimer`, new `AdvisorCta.astro`
  (button is a static placeholder), light island fallback skeleton.
- **Phase 3:** island rewritten — **live results (D1)**: state lifted into `Calculator.tsx`,
  derived via `useMemo`, no Calcular button; **native date inputs (D4)** with ISO→dd/mm/aaaa
  conversion at the boundary; new `StatusBanner` (incomplete/error/success, `aria-live`),
  `WaitingCard`, `ResultsSummary` (navy hero with long Spanish date, days-available chip,
  governing-rule note derived via `addMonthsClamped` comparison, 2 stat cards, 4-milestone
  timeline, **Descargar PDF** + **Compartir enlace** with toast), collapsible `ResultsTable`
  (zebra desktop table / mobile stacked cards, red pill ≤7 days) **keeping the amber
  month-rule highlight + dimmed rows** for the lawyer demo. Deleted `CalendarPicker.tsx`
  (with its DOM style-injection) and `FormLayout.tsx`; new inline-SVG icon set.
- Copy decisions: legal copy (header subtitle, disclaimer, course-estimation caption,
  "Próximamente") kept **verbatim from the current app**; new UI strings verbatim from the
  mock's `es` set, **except** month-rule wording where the deadline itself is described
  (governing note "plazo de 1 mes / margen de 2 meses", milestone-1 desc) — pending legal
  confirmation, see the FLMP entry below.
- Lead CTA renders only PDF/Share; the email form slots in later (plan Phase 5).

**Verified:** `pnpm test` 17/17; `pnpm check` 0/0/0; `pnpm build` with exactly one
`<astro-island>` in `dist/index.html`; browser QA at 1280 and 375px: waiting → success
(both owner examples: 14/02 hero + no highlight beyond table; 28/02 highlighted + 01/03
dimmed) → error (45-day stay, service message in red banner) → share toast; mobile stacked
cards, no horizontal scroll.

**Pending:** plan Phase 4.4–4.6 (push branch, PR, client preview approval, merge, Vercel
Web Analytics) — blocked by the local-only hold. Known demo tension until Step B: hero says
"31 días disponibles" (month rule) while the table shows 30 day-based rows; the amber
caption explains it.

---

## 2026-07-10 — Month-based FLMP (demo for the lawyer) + Vitest safety net

**Done:**
- Committed the design handoff (`.docs/handoff/` + `.docs/IMPLEMENTATION-PLAN.md`) and the
  `.vercelignore`/`DESIGN-BRIEF.md` pending changes on `main` (`74ddb8f`, local only).
- On branch **`flmp-month-rule`**: added **Vitest** (`pnpm test`) with 17 tests in
  `src/services/calculationService.test.ts` — 12 lock the current day-based behavior
  (validation errors, breakdown invariants, duration/exit-mode equivalence, DST
  insensitivity), 5 encode the new month rule including both owner examples.
- **Changed the FLMP rule** in `calculationService.ts` (owner instruction 2026-07-10):
  `maxPresentationDate` = the earlier of **(llegada + 1 mes)** and **(salida − 2 meses)**,
  computed "de fecha a fecha" (Ley 39/2015 style) with a new UTC `addMonthsClamped` helper —
  when the equivalent day doesn't exist (30/02), it clamps to the last day of the month.
  Verified: 15/01/2026 + 90 días → FLMP **14/02/2026** (was 13/02); 31/01/2026 →
  30/04/2026 → FLMP **28/02/2026** (was 01/03).
- **Breakdown table left day-based on purpose** (owner decision, for the lawyer demo):
  the row equal to the month-based FLMP is highlighted in amber with a "Límite (meses)"
  badge, rows after it are dimmed, and captions explain the month rule + "pendiente de
  confirmación legal". When the month-based FLMP is later than the last row (example 1),
  nothing is highlighted and the legend says all rows are valid.

**Why:** the owner discovered the legal deadline is computed in calendar months, not fixed
days, and wants the lawyer to validate the new rule on a working demo before making the
table fully consistent (Step B) — production stays on the old rule meanwhile (no push).

**Verified:** `pnpm test` 17/17, `pnpm check` 0/0/0, `pnpm build` OK; both owner examples
driven in the browser (desktop table + highlight confirmed visually).

**Pending / questions for the lawyer** (carry until answered):
1. "1 mes desde la llegada": llegada 15/01 → ¿vence el **15/02** (implemented — same day
   number) o el 14/02?
2. Month-end clamp: 30/04 − 2 meses = **28/02** (owner example; confirm legally).
3. Does the **course-start minimum** (today "presentación + 60 días") also become
   **2 meses**? Drives the Step-B table ranges.
4. Short-stay edge: e.g. llegada 01/08, salida 30/09 → salida − 2 meses = 30/07, **before
   arrival**, while the 60-day rule still allows filing on 01/08. What should the tool say?

---

## 2026-06-24 — Finalize Stage 2: type-check clean, loading state, pnpm, ship

**Done:**
- Ran `pnpm astro check` for the first time (it installed `@astrojs/check` + `typescript`).
  Drove all diagnostics to **0 errors / 0 warnings / 0 hints** — fixes detailed in the
  knowledge base above (unused `React` import, `aria-pressed` boolean coercion, deprecated
  `React.FormEvent`). Moved `@astrojs/check` to `devDependencies`; added a `pnpm check` script.
- Added a **polished loading state**: `slot="fallback"` on the `client:only` Calculator
  island in `index.astro` — a themed sky spinner + "Cargando calculadora…", shown during
  hydration. Confirmed it renders in the built `dist/index.html`.
- **Standardized on pnpm** across docs (CLAUDE.md + README) after catching `npm run …`
  references; added a "Conventions for contributors (humans & agents)" block to CLAUDE.md
  documenting pnpm, the `astro-docs` MCP, Astro best practices, and the 0/0/0 check gate.
- **Committed `df07341` and pushed to `main`** (`6f8dbb8..df07341`, 3 commits total incl.
  the earlier Stage 2 + `.vercelignore` commits) → triggers Vercel production deploy.

**Why:** the preview confirmed the app worked, so we hardened it (type safety, perceived
performance) and made the conventions explicit so neither humans nor agents repeat the
npm/pnpm and type-check mistakes. Then shipped.

**Verified:** `pnpm check` 0/0/0; `pnpm build` passes; fallback present in built HTML;
`git status` clean; `origin/main` in sync at `df07341`.

**Pending:** only `origin/bump-node-24` (see Resume block). Verify the prod deploy is green.

---

## 2026-06-23 — Stage 2: static shell → native Astro

**Done:**
- Converted the static chrome to native `.astro` (ships zero JS): `Header.tsx` →
  `Header.astro`, `Disclaimer.tsx` → `Disclaimer.astro` (its info-circle SVG inlined;
  the `window.APP_VERSION` footer value is filled by a small `is:inline` script).
- Extracted the interactive part of `App.tsx` into `src/components/Calculator.tsx` —
  the lone React island (`client:only`), holding the shared `result`/`error` state and
  wrapping `DataEntryForm` + `ResultsTable`. Deleted `App.tsx`.
- Moved the page-shell wrapper divs into `src/pages/index.astro`, which now renders
  `Header`/`Disclaimer` statically around `<Calculator client:only="react" />`.
- Removed the now-unused `InformationCircleIcon` export from `IconComponents.tsx`.
- Updated CLAUDE.md and README to describe the new structure.

**Why:** the planned Stage 2 architecture — keep only the interactive form/results as a
React island, render everything else as static HTML so less JS is shipped.

**Verified:** `pnpm run build` passes; built `dist/index.html` contains the Header and
Disclaimer as static HTML and exactly one `<astro-island>` (the Calculator).
`pnpm check` (`astro check`) is clean: **0 errors / 0 warnings / 0 hints**.

**Also (type-check setup & fixes):**
- Installed `@astrojs/check` + `typescript` as **devDependencies**; added a `check`
  script (`astro check`). `astro check` had put `@astrojs/check` in `dependencies` —
  moved it to dev so it doesn't ship as a runtime dep.
- Fixed the issues `astro check` surfaced: unused `React` import in `Calculator.tsx`
  (React 19 + `jsx: react-jsx` needs no React import); `aria-pressed` was `boolean|null`
  in `CalendarPicker.tsx` (`currentDate && …` → `currentDate != null && …`); deprecated
  `React.FormEvent` in `DataEntryForm.tsx` → `React.SyntheticEvent<HTMLFormElement>`
  (only `preventDefault` is used). Last two were pre-existing, not from Stage 2.

**Pending:** none for Stage 2.

---

## 2026-06-23 — Add astro-docs MCP server to the @claude bot

**Done:**
- Added an MCP server (`astro-docs`, http, https://mcp.docs.astro.build/mcp) and the
  `mcp__astro-docs__search_astro_docs` tool to `.github/workflows/claude.yml`, via the
  v1 `claude_args` form (`--mcp-config` + `--allowed-tools`). Local only, not pushed.
- Adapted from a user-supplied snippet that used the OLD syntax: it had
  `anthropic_api_key: secrets.ANTHROPIC_API_KEY` (we have no such secret — kept
  `claude_code_oauth_token`) and `@beta` with top-level `mcp_config`/`allowed_tools`
  inputs (our workflows are `@v1`, where those move into `claude_args`).

**Why:** user is **migrating this project to Astro** (confirmed 2026-06-23), so the
astro-docs tool lets the @claude bot search Astro docs during the migration — now
clearly relevant. Keep it.

**Pending:** Same overall "don't push to GitHub yet" hold applies.

---

## 2026-06-23 — Set up Claude Code GitHub Actions (tuned review)

**Done:**
- Ran `/install-github-app`. The installer (on GitHub side) installed the Claude
  GitHub App, added the `CLAUDE_CODE_OAUTH_TOKEN` repo secret, and pushed a branch
  `add-claude-github-actions-1782223169088` containing default workflow files.
  Confirmed the only repo secret is `CLAUDE_CODE_OAUTH_TOKEN` (no API key) — that's
  what our workflows reference, so no auth changes needed.
- Created two workflow files **locally only** (NOT committed, NOT pushed):
  - `.github/workflows/claude.yml` — the `@claude` mention bot (kept as installer
    default; it was already fine).
  - `.github/workflows/claude-code-review.yml` — **tuned** for this project. Replaced
    the generic plugin review with a project-specific checklist: UTC-only date math,
    30/60-day rule drift vs. the Spanish copy in Header.tsx/ResultsTable.tsx, the
    duplicated date helpers staying in sync, Spanish-only UI (dd/mm/aaaa), Tailwind
    CDN SRI hash on version bumps, and explicit .ts/.tsx import extensions. Also told
    it not to nitpick style (no linter is intentional) and added a `paths:` filter.

**Why:**
- Want automated PR review that actually knows this app's real failure modes
  (timezone bugs, rule/copy drift) instead of generic feedback.
- User explicitly wants to keep GitHub untouched until the new app version is working,
  so everything stays local and reversible for now.

**Pending:** see the rolling list at the top — push workflows, push the 2 commits,
delete the installer branch. Only when the user says so.
