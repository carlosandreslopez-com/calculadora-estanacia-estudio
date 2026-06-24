# WORKLOG

A running log of what was done, **why**, and what's **pending**. Newest entries on top.
This file is local notes — keep it in the repo but it documents decisions, not code.

Format for each entry:
- **Date** — short title
- **Done:** what changed
- **Why:** the reason / context
- **Pending:** what still needs to happen (carry forward until resolved)

---

## ▶ Resume here (state as of 2026-06-24)

> Read this first after a restart. Quick "where we are / where we left off".

- **Branch/sync:** on `main`, HEAD = `df07341`, **fully pushed** (`origin/main` is in sync,
  0 ahead / 0 behind). Working tree clean.
- **App status:** Astro 7 + React 19 island app. **Done and deployed.** Stage 1 (migration)
  and Stage 2 (static shell → `.astro`) both shipped to production via Vercel (push to
  `main` auto-deploys). `pnpm check` is clean (0/0/0); `pnpm build` passes.
- **Package manager: `pnpm` only** — never `npm`/`yarn` (lockfile + Vercel depend on it).
- **Next action when you return:** confirm the latest Vercel production deploy went green,
  then handle the open items below.
- **In flight: UX/UI redesign.** The user is working with **Claude Design** (separate, no
  repo access) on a new look. Handoff spec lives in **`DESIGN-BRIEF.md`** (repo root) — it's
  self-contained for the designer. When the proposal returns, **we adapt it into Astro here**
  (see DESIGN-BRIEF.md §7 "Internal implementation notes" for where each piece lands).

### Open / pending items

- [ ] **Adapt the Claude Design UX/UI proposal into the app** when it arrives. Source of
      truth for constraints + file mapping: `DESIGN-BRIEF.md`. Presentation only — never
      touch `calculationService.ts` or the Spanish copy/rules. Tailwind **v4** (`@theme`,
      no config). Verify `pnpm check` 0/0/0 + `pnpm build`.
- [ ] **Decide on `origin/bump-node-24`** — open remote branch bumping Node to 24 while
      `package.json` `engines` + Vercel pin Node **22**. Merge (and re-pin to 24) or delete.

### Recently completed (newest first)

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
