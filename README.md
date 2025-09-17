# TrustMeBro — Bitcoin Explorer (ZK‑Ready)

TrustMeBro is a modern, pixel‑perfect Bitcoin block explorer built with Next.js (App Router) and TypeScript. It proxies the public Esplora endpoints from mempool.space, validates responses, and presents blocks and transactions with a premium, Bitcoin‑maxi dark UI. The app is wired for ZK proof badges and includes “Verify locally” flows for blocks and transactions.

Note: Proof status currently returns “verified” for all blocks and transactions while the real verification pipeline is being integrated. The local verification buttons run the computations and present success for this cut.

## Highlights

- World‑class black/white UI with subtle Bitcoin Orange accents
- Latest blocks with elegant cards and a fullness meter (WU‑based)
- Block detail with structured header table and actions
- Transactions section with expand/collapse, sticky search, status dots, fee rate, copy txid, and pagination
- ZK proof badges (blocks and txs), currently stubbed to “verified”
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
- `GET /api/proofs/block?hash=` → ZK status for block (currently always `verified`)
- `GET /api/proofs/tx?txid=` → ZK status for tx (currently always `verified`)

All upstream responses are validated with Zod where applicable and mapped to friendly errors (`502 upstream`, `500 schema`, etc.).

## Design System

The design system is documented in `DESIGN.md` and implemented via CSS primitives in `app/globals.css`.

- Palette: black/graphite surfaces, white text, Bitcoin Orange accents; semantic colors for success/warning/danger
- Primitives: `.panel`, `.btn`, `.badge`, `.meter`, `.row`, `.divider`, focus rings
- Typography: Geist + Geist Mono with careful sizes/spacing
- Interaction: subtle animations (spinner, pulse), high‑contrast focus rings, accessible hit targets

## Local Verification (current behavior)

- Blocks: “Verify locally” serializes the header and performs double‑SHA256 and target calculation, but reports success unconditionally in this cut.
- Transactions: “Verify locally” fetches raw hex and recomputes txid, but reports success unconditionally in this cut.

These hooks make it straightforward to swap in real verification or ZK proof checks without altering the UI.

## Development Notes

- The app prefers absolute URLs for server‑side fetches; `getBaseUrl()` builds them from request headers.
- Dynamic route params and `searchParams` are awaited to comply with Next 15 behavior.
- Keep proxy handlers small and predictable; add Zod schemas for any new upstream payloads.

## Roadmap (next)

- Integrate real ZK proof verification endpoints for blocks and transactions
- Replace placeholder “always verified” with provider results
- Batch proof status requests for tx lists
- Virtualized tx list for very large blocks
- Add confirmations and total output value per tx

---

If you want help wiring the real proof verification pipeline, share the provider API details and I’ll integrate it end‑to‑end (proxy, UI states, and verification flows) with the same design standard.

