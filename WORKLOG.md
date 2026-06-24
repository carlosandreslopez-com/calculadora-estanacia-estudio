# WORKLOG

A running log of what was done, **why**, and what's **pending**. Newest entries on top.
This file is local notes — keep it in the repo but it documents decisions, not code.

Format for each entry:
- **Date** — short title
- **Done:** what changed
- **Why:** the reason / context
- **Pending:** what still needs to happen (carry forward until resolved)

---

## Open / pending items (rolling summary)

> Keep this list current — move things here to "Done" in a dated entry when finished.

- [ ] **Decide on `origin/bump-node-24`** — open remote branch bumping Node to 24
      while Vercel/CI currently pin Node 22. Merge or delete.
- [x] ~~Astro migration~~ — done (PR #1, merged).
- [x] ~~Push Claude GitHub Actions workflows~~ — both committed/tracked on `main`.
- [x] ~~Delete installer's redundant remote branch~~ — gone.
- [x] ~~Push unpushed local commits~~ — `main` is in sync with `origin/main`.
- [x] ~~Stage 2: convert static shell to native `.astro`~~ — done (see entry below).

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
