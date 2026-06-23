# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server on port 3000 (host `0.0.0.0`)
- `npm run build` — production build via Vite
- `npm run preview` — serve the production build locally

There is **no test runner, linter, or formatter** configured. TypeScript is `noEmit` only (type-checking happens through the editor / `tsc --noEmit` if run manually); Vite does not type-check during build.

## What this app does

A single-page calculator (UI entirely in Spanish) for Spain's student-residency ("estancia de estudiante") application deadlines. Given a tourist's arrival date and either a stay duration or exit date, it computes the valid window for filing a student-stay application. All UI copy, error messages, and date formats are Spanish (`dd/mm/aaaa`).

## Core domain logic

Everything that matters lives in `services/calculationService.ts` — `calculateStudyStayBreakdown()`. The two business rules are encoded as constants:

- `PRESENTATION_WINDOW_DAYS = 30` — the application must be filed within the first 30 days after arrival.
- `MIN_ANTICIPATION_DAYS = 60` — the course must start at least 60 days after the application is filed, and still before the tourist stay ends.

The function walks each of the first 30 days, keeps only the presentation dates whose earliest possible course start (presentation + 60 days) falls on or before the exit date, and returns a per-day breakdown plus the latest valid presentation date (`maxPresentationDate`). If no day qualifies it throws a Spanish-language error. When changing these rules, update the constants here and the explanatory copy in `components/Header.tsx` and `components/ResultsTable.tsx`, which restate the 30/60-day rules to the user.

### Date handling (important)

All date math is done in **UTC** to avoid timezone drift (`Date.UTC`, `getUTCDate`, etc.). Dates are parsed from and formatted to `dd/mm/yyyy`. The parse/format/diff helpers are duplicated between `services/calculationService.ts` and `components/DataEntryForm.tsx` — keep both copies consistent if you touch them.

## Architecture

- `index.tsx` mounts `<App />`. `App.tsx` holds the only app state (`result`, `error`) and passes `handleCalculate`/`handleReset` down.
- Data flow is one-way: `DataEntryForm` (toggles between "duration" and "exit date" modes) → `App.handleCalculate` → `calculationService` → `ResultsTable` renders the `CalculationResult`. Shared types are in `types.ts`.
- Active components: `Header`, `DataEntryForm`, `ResultsTable`, `Disclaimer`, plus the leaf components `CalendarPicker`, `FormLayout`, `IconComponents`.
- **Stub/unimplemented files** (currently empty — a batch/CSV-upload feature was scaffolded but never built): `components/BatchCalculator.tsx`, `components/BatchResultsTable.tsx`, `components/DataFormLayout.tsx`, `components/DatePicker.tsx`, `components/FileUpload.tsx`, `components/Loader.tsx`, `services/csvProcessor.ts`. Don't assume they contain working code.

## Styling

Tailwind is loaded from the **CDN** (`<script src="https://cdn.tailwindcss.com">` in `index.html`) — there is no local Tailwind config, PostCSS, or build step for it. Style exclusively with utility classes inline; the design is a dark slate/sky theme.

## Module resolution gotchas

- Imports use **explicit `.ts`/`.tsx` extensions** (e.g. `import { Header } from './components/Header.tsx'`). Match this convention.
- `vite.config.ts` defines an `@` alias to the project root and injects `process.env.API_KEY` / `process.env.GEMINI_API_KEY` from `.env.local`. The Gemini key is wired up from the AI Studio template but is **not currently used** by any code.

## Deployment note

`index.html` contains an unusual dual-loading setup: alongside the normal Vite `/index.tsx` entry, it also injects a cache-busted script from `https://esm.sh/gh/carlosandreslopez-com/calculadora-estanacia-estudio@main/index.tsx`, meaning the deployed page can pull the app straight from the GitHub `main` branch via esm.sh. A `window.APP_VERSION` load timestamp is set for version verification. Be aware of this when reasoning about how changes reach production.
