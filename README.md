# TrustMeBro — Bitcoin Explorer (ZK‑Ready)

TrustMeBro is a modern, pixel‑perfect Bitcoin block explorer built with Next.js (App Router) and TypeScript. It proxies the public Esplora endpoints from mempool.space, validates responses, and presents blocks and transactions with a premium, Bitcoin‑maxi dark UI. The app is wired for ZK proof badges and includes “Verify locally” flows for blocks and transactions.

Status: Transaction proof verification is implemented fully client‑side via the Raito SPV SDK (WASM in the browser). Block‑level proof verification is planned. A temporary local "Verify" action exists for blocks and returns a success placeholder for now.

## Highlights

- World‑class black/white UI with subtle Bitcoin Orange accents
- Latest blocks with elegant cards and a fullness meter (WU‑based)
- Block detail with structured header table and actions
- Transactions section with expand/collapse, sticky search, status dots, fee rate, copy txid, and pagination
- ZK proof badges:
  - Transactions: verified client‑side using Raito SDK
  - Blocks: badge present; proof integration pending
- Local verification buttons with tasteful animations
- Clean server proxy routes with Zod validation and short revalidate windows

## Stack

- Framework: Next.js 15 (App Router, Server Components, Route Handlers)
- Language: TypeScript (strict)
- Styling: Tailwind v4 + custom primitives in `app/globals.css`
- Validation: Zod
- Icons: Lucide

## Quick Start

Prerequisites: Node 18+ (Node 20 recommended) and npm.

- Install: `npm ci`
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Start (prod): `npm start`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`

Optional helper scripts (if present):
- Background dev server: `npm run server:start:bg` / `npm run server:stop:bg`
- Smoke check: `npm run smoke`

## Environment

- `NEXT_PUBLIC_BASE_URL` (optional): absolute base URL used by server components to build fetch URLs. When not set, the app derives the base from request headers and falls back to `http://localhost:3000` in dev.

## Key Features (UI)

- Blocks
  - Card grid with: height, time‑ago, tx count, size, weight, hash, prev hash, ZK badge
  - Fullness meter based on block weight / 4,000,000 WU
  - “Open details” action
- Block Detail
  - Header panel with label, height, ZK badge, and “Verify locally” action
  - Structured table of header fields (mono for hashes, nice formatting for size/weight)
  - Transactions section:
    - Expand/collapse with reveal animation
    - Sticky subheader with search field and loaded count
    - Tx rows with status dot, txid link, copy txid, fee, fee rate (sat/vB), vbytes, WU
    - Pagination via “Load more”
- Transaction Detail
  - Header panel with txid, ZK badge, and “Verify locally” action
  - Property table with size, weight, fee, version, locktime

## Server Proxy Routes (selected)

- `GET /api/mempool/blocks?start_height=` → latest 10 or from height (proxies `…/api/blocks`)
- `GET /api/mempool/block?hash=` → block header by hash (proxies `…/api/block/{hash}`)
- `GET /api/mempool/block-hash-by-height?height=` → hash by height
- `GET /api/mempool/tip-height` → chain tip height
- `GET /api/mempool/block-txs?hash=&from=` → block transactions, paged (proxies `…/api/block/{hash}/txs`)
- `GET /api/mempool/tx?txid=` → tx detail (proxies `…/api/tx/{txid}`)
- `GET /api/mempool/tx-hex?txid=` → raw tx hex (proxies `…/api/tx/{txid}/hex`)
- `GET /api/proofs/block?hash=` → placeholder ZK status for block (currently always `verified` — not used by UI)

All upstream responses are validated with Zod where applicable and mapped to friendly errors (`502 upstream`, `500 schema`, etc.).

## Design System

The design system is documented in `DESIGN.md` and implemented via CSS primitives in `app/globals.css`.

- Palette: black/graphite surfaces, white text, Bitcoin Orange accents; semantic colors for success/warning/danger
- Primitives: `.panel`, `.btn`, `.badge`, `.meter`, `.row`, `.divider`, focus rings
- Typography: Geist + Geist Mono with careful sizes/spacing
- Interaction: subtle animations (spinner, pulse), high‑contrast focus rings, accessible hit targets

## Verification

- Transactions (client‑side, live):
  - Uses the Raito SPV Verify SDK in the browser (WASM web build).
  - For each tx, the UI fetches the compressed SPV proof and verifies it locally; the badge and list dots update accordingly.
  - Logging is human‑friendly and visible in DevTools.
- Blocks (placeholder):
  - A local "Verify locally" action exists for UX parity, currently a success placeholder.
  - Full block‑level proof integration will be added (see TODO).

## Development Notes

- The app prefers absolute URLs for server‑side fetches; `getBaseUrl()` builds them from request headers.
- Dynamic route params and `searchParams` are awaited to comply with Next 15 behavior.
- Keep proxy handlers small and predictable; add Zod schemas for any new upstream payloads.

## TODO

- [x] Client‑side transaction proof verification with Raito SDK (fetch + verify in browser)
- [x] Production build compatibility on Vercel (async WASM, webpack)
- [ ] Block‑level proof verification
- [ ] Concurrency limit + in‑memory cache for tx proof verification
- [ ] Batch or queue proof checks to reduce bursts
- [ ] Structured data (JSON‑LD) for SEO
- [ ] Virtualized tx list for very large blocks
- [ ] Show confirmations and total output value per tx
