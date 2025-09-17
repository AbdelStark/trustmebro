# TASKS

Milestone M1: Project scaffold & core explorer

- Done:
  - Next.js app scaffolded under `web/` with TS + Tailwind.
  - Dark Bitcoin/cypherpunk theme tokens, layout header with search.
  - Proxy API routes to mempool.space with Zod validation.
  - Home page lists latest 10 blocks with "Load more".
  - Block detail page with header table + mocked ZK badge.
  - Local header verification removed (panel and /verify page de-scoped for now).
  - Basic unit tests (bits→target, header serialization + double-sha256) passing via Vitest.
  - Background start/stop scripts and smoke check added.

- Next:
  - Fix remaining runtime/type errors and warnings after base URL change.
  - Add loading skeletons and error states on Home/Block pages.
  - Add better a11y (tooltips, ARIA labels) and micro-interactions.
  - Optional: integrate shadcn/radix components for polished UI.
  - CI: add GitHub Actions to run typecheck, unit tests, and a smoke check.
