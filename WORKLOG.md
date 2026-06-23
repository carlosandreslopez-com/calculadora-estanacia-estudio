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

- [ ] **Push the Claude GitHub Actions workflows to `main`** when the new app version is
      working. Files exist locally only, uncommitted: `.github/workflows/claude.yml`
      and `.github/workflows/claude-code-review.yml`. Nothing has been pushed yet.
- [ ] **Delete the installer's redundant remote branch**
      `add-claude-github-actions-1782223169088` once our tuned versions are on `main`
      (it contains the installer's untuned copies of the same two files — would conflict).
- [ ] **Push the 2 unpushed local commits** on `main` (local is ahead of `origin/main`
      by 2 commits) — decide together before pushing.
- [ ] **MIGRATE THE PROJECT TO ASTRO** — currently a Vite + React 19 SPA (single-page
      "estancia de estudiante" deadline calculator, Spanish UI). Plan & scope TBD with
      the user. Preserve the domain logic in `services/calculationService.ts` (UTC date
      math, 30/60-day rules) exactly.

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
