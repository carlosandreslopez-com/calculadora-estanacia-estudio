# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Astro dev server (default `http://localhost:4321`)
- `npm run build` — production build via Astro (static output to `dist/`)
- `npm run preview` — serve the built `dist/` locally
- `npm run astro -- add <integration>` / `npm run astro -- check` — Astro CLI passthrough

This is an **Astro 7** project with a **React 19** island (`@astrojs/react`). There is **no test runner, linter, or formatter** configured. `astro build` does not type-check; run `npm run astro -- check` for that.

## What this app does

A single-page calculator (UI entirely in Spanish) for Spain's student-residency ("estancia de estudiante") application deadlines. Given a tourist's arrival date and either a stay duration or exit date, it computes the valid window for filing a student-stay application. All UI copy, error messages, and date formats are Spanish (`dd/mm/aaaa`).

## Core domain logic

Everything that matters lives in `src/services/calculationService.ts` — `calculateStudyStayBreakdown()`. The two business rules are encoded as constants:

- `PRESENTATION_WINDOW_DAYS = 30` — the application must be filed within the first 30 days after arrival.
- `MIN_ANTICIPATION_DAYS = 60` — the course must start at least 60 days after the application is filed, and still before the tourist stay ends.

The function walks each of the first 30 days, keeps only the presentation dates whose earliest possible course start (presentation + 60 days) falls on or before the exit date, and returns a per-day breakdown plus the latest valid presentation date (`maxPresentationDate`). If no day qualifies it throws a Spanish-language error. When changing these rules, update the constants here and the explanatory copy in `src/components/Header.astro` and `src/components/ResultsTable.tsx`, which restate the 30/60-day rules to the user.

### Date handling (important)

All date math is done in **UTC** to avoid timezone drift (`Date.UTC`, `getUTCDate`, etc.). Dates are parsed from and formatted to `dd/mm/yyyy`. The parse/format/diff helpers are duplicated between `src/services/calculationService.ts` and `src/components/DataEntryForm.tsx` — keep both copies consistent if you touch them.

## Architecture

This is an Astro site whose single page is mostly static HTML, with the interactive calculator as one client-side React island.

- `src/pages/index.astro` owns the page shell (the slate background wrapper, `<main>`, and the static `Header`/`Disclaimer`) and renders the lone island `<Calculator client:only="react" />` inside `src/layouts/Layout.astro`. **`client:only` (not `client:load`) is required** — the calculator touches browser APIs during render, so it must not be server-rendered. (This matches the app's original CSR-only behavior.)
- `src/layouts/Layout.astro` owns the `<html>`/`<head>`/`<body>` shell, imports `src/styles/global.css`, and sets the `window.APP_VERSION` load-timestamp (read and shown in the footer by `Disclaimer.astro`'s inline script).
- `src/components/Calculator.tsx` is the only React island: it holds the app state (`result`, `error`) and wraps both interactive children, which share that state. Data flow is one-way: `DataEntryForm` (toggles between "duration" and "exit date" modes) → `Calculator.handleCalculate` → `calculationService` → `ResultsTable` renders the `CalculationResult`. Shared types are in `src/types.ts`.
- Static shell is native Astro: `src/components/Header.astro` and `src/components/Disclaimer.astro` (ship zero JS). Remaining React components in `src/components/`: `DataEntryForm`, `ResultsTable`, plus the leaf components `CalendarPicker`, `FormLayout`, `IconComponents`.

> **Stage 2 — done.** The static shell (`Header`, `Disclaimer`, page layout) is now native `.astro`; only the form/results calculator remains a React island. (If reintroducing a static React component, mind that `client:only` islands can't share state with `.astro` siblings — keep co-stateful pieces inside `Calculator.tsx`.)

## Styling

Tailwind **v4** is compiled at build time via the `@tailwindcss/vite` plugin (configured in `astro.config.mjs`); the entry is `@import "tailwindcss";` in `src/styles/global.css`, which also holds the custom scrollbar CSS. There is no `tailwind.config` — v4 auto-scans source files for class names. Style exclusively with utility classes inline; the design is a dark slate/sky theme. (Note: migrated from the Tailwind v3 Play CDN, so a few v4 default differences may produce minor visual shifts vs. the original.)

## Module resolution

- Imports use **explicit `.ts`/`.tsx` extensions** (e.g. `import { DataEntryForm } from './DataEntryForm.tsx'`). Match this convention. (`.astro` components are imported without an extension override, per Astro convention.)
- No path aliases or `process.env` usage in app code. (The old AI-Studio Vite setup wired an unused `GEMINI_API_KEY`; that's gone.)

## Deployment

Static site deployed on **Vercel** (auto-detected Astro preset: `astro build` → `dist/`). Push to `main` → production deploy; branches/PRs → preview deploys. GitHub is used purely for version control. Use Vercel's **Instant Rollback** to restore a previous working deployment. No SSR adapter is configured — the app is fully static/client-side; add `@astrojs/vercel` only if server endpoints are introduced later.
