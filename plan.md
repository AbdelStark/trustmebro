# TrustMeBro - A ZK enabled Bitcoin explorer

Update (current status):
- Fixed server fetches by introducing an absolute base URL helper for RSC/Route Handlers.
- Removed the Local Header Verification panel from Block Detail and the /verify page (de‑scoped for now).
- Keeping mocked ZK Proof badge; proxy API remains the single source for data.

Below is a **step‑by‑step, end‑to‑end implementation plan** for a **modern, mini Bitcoin block explorer** that fetches **live data from the Mempool.space REST API**, with a **polished, Bitcoin‑maxi / cypherpunk** UI. The plan favors a **LLM‑friendly, maintainable** codebase and focuses on a **first iteration (V1)** that:

* Lists the **latest X blocks** from tip
* Shows **basic block header details** per block
* **Mocks a ZK‑proof indicator** per block (TLS‑style “green” verification badge)
* Includes a simple **Block Verify** page that validates the **header hash vs. header fields** locally, while the **ZK proof status** remains mocked

Where relevant, I cite the official API behavior and response shapes or show live endpoint outputs for confidence. For example: **tip height** (`/api/blocks/tip/height`) and **hash by height** (`/api/block-height/:height`). ([Mempool Space][1])

---

## 0) What we’ll ship in V1 (Scope)

**User‑facing**

1. **Home / Blocks**

   * Fetch **latest 10 blocks** (and paginate “load more”).
   * Each block appears as a **card** with: height, hash (truncated with copy), time (UTC & “x minutes ago”), size, weight, tx count, previous hash (truncated), miner/pool name (if present in `extras`), and the **ZK badge** (mocked).
   * Top bar with global **search** (height or block hash).

2. **Block Detail**

   * Shows full block header info and the same **ZK badge**.

3. [Deferred] Verify page (Local header verification)

   * Local PoW/header verification has been removed from the current scope. This can return later as a dedicated page.

**Non‑functional**

* Strong **design system** (Bitcoin black/orange, cypherpunk aesthetics) with **dark‑only** V1.
* **Fast** SSR / edge caching, resilient to rate limits.
* **LLM‑friendly** code structure & types (clear modules, Zod schemas, docstrings).
* **Observability** (basic error logging) and **tests** (unit + happy‑path e2e).

---

## 1) Stack (modern, LLM‑friendly, maintainable)

* **Framework:** Next.js (App Router; Server Components + Route Handlers).
  Rationale: ergonomic SSR/ISR, built‑in caching, edge deploy on Vercel.
* **Language & Typing:** TypeScript **strict**.
* **Validation & Types:** **Zod** for runtime validation of all external responses + inferred TS types.
* **Data Fetching:**

  * **Server‑side** `fetch()` via **Route Handlers** (`/app/api/...`) that **proxy** Mempool endpoints (avoid CORS surprises, centralize caching and rate limiting).
  * **Client‑side** hydration via **TanStack Query** for re‑fetch on interactions, with clear cache policies.
* **Styling / UI:**

  * **Tailwind CSS** with CSS variables for theme tokens.
  * **Radix UI** primitives + **shadcn/ui** for high‑quality accessible components.
  * Icons: **Lucide** or custom SVG set.
* **Crypto utils:** Web Crypto API (SHA‑256), plus a small **satoshi/bytes/time** formatting util set.
* **Tests:** **Vitest** (unit), **Playwright** (e2e, happy paths).
* **Lint/Format:** ESLint (typescript + react rules), Prettier.
* **Deploy:** Vercel (Edge runtime for proxy handlers, ISR for blocks page).
* **Monitoring:** Sentry (optional) for client & server error tracking.

---

## 2) Data sources & endpoints (first principles)

We’ll integrate with Mempool.space **Esplora‑style** endpoints:

* **Tip height**: `GET /api/blocks/tip/height` → number (we confirmed live output). ([Mempool Space][1])
* **Hash by height**: `GET /api/block-height/:height` → block hash (confirmed live). ([Mempool Space][3])
* **Latest blocks list**: Esplora semantics provide `GET /api/blocks` (latest 10) and `GET /api/blocks/:start_height` (10 descending from `start_height`). (Public docs for Esplora‑compatible providers show this shape and return fields: `id, height, version, timestamp, mediantime, bits, nonce, difficulty, merkle_root, tx_count, size, weight, previousblockhash, extras`.) ([docs.validationcloud.io][4])
* **Block details by hash**: `GET /api/block/:hash` with fields as above (Esplora format). ([docs.validationcloud.io][5])
* **WebSocket (later):** Mempool WebSocket API (for real‑time updates) is available for a subsequent iteration. ([Mempool Space][6])

> **Note:** The Mempool docs pages sometimes render client‑side; however, the endpoints above are standard Esplora shapes, and we verified **live GETs** where possible. ([Mempool Space][7])

---

## 3) Information architecture & routes

```
/
  (home) -> list latest 10 blocks (with “load more” = call /blocks/:start_height)
  Search bar (height or block hash)
  Block cards (with ZK badge)

 /block/[hash]
  Full header details + local “Verify header hash/PoW” panel + ZK badge

 /verify
  Form to input height or hash; fetch header; run local verify; show ZK mock status

 /api/mempool/...
  - /api/mempool/tip-height
  - /api/mempool/block-hash-by-height?height=...
  - /api/mempool/blocks?start_height=...   (10 at a time)
  - /api/mempool/block?hash=...

 /api/proofs/...
  - /api/proofs/block?hash=...   (mocked ZK status)
```

All `/api/mempool/...` handlers **proxy** to Mempool and normalize/validate shape (Zod), add sane caching, and provide typed responses for the UI.

---

## 4) UX & visual design (Bitcoin‑maxi, cypherpunk)

**Theme tokens** (CSS variables):

* `--bg`: `#0b0b0b` (dominant near‑black)
* `--panel`: `#111214`
* `--accent`: **Bitcoin Orange** `#F7931A` (use **--accent-600** = `#f7931a`, **--accent-500** = `#ff9900` for emphasis states)
* `--text`: `#e8e8e8` on black
* `--muted`: `#9ea2a8`
* `--success`: cypherpunk neon green `#39ff14` (for verified ZK badge)
* `--warning`: `#ffcc00`
* `--danger`: `#ff3b3b`

**Typography**

* **Display/labels:** **Space Grotesk** (semi‑mono vibe) or **Inter** bold for headings
* **Data/mono:** **IBM Plex Mono** or **JetBrains Mono** for hashes/hex

**Layout**

* **App bar:** left logo (simple ₿ wordmark), center search, right theme/kebab menu.
* **Block cards (grid)**:

  * Header row: **Block #914,959** • time “x min ago” • **ZK badge** (tooltip: “Verified by ZK (mock)”).
  * Body (two columns on desktop, stacked on mobile):

    * Left: **hash** (copy button), **prev hash** (hover reveals full + copy)
    * Right: **size/weight**, **tx count**, **bits/difficulty**, **nonce**, **merkle root** (truncated)
  * Hover: subtle orange border glow, quick actions (copy hash, open details).
* **Micro‑interactions:**

  * **Skeleton shimmer** on load (black→charcoal gradient).
  * **Badge pulse** on verified state load.
  * **Accessible** focus rings using orange outline.

**A11y**

* Contrast ratios ≥ 4.5 for text; ARIA labels on copy buttons, tooltips, and status badges; reduced‑motion support.

---

## 5) Data contracts (Zod + inferred TS)

```ts
// /lib/schemas/block.ts
import { z } from "zod";

export const BlockHeaderSchema = z.object({
  id: z.string(),                     // block hash
  height: z.number().int(),
  version: z.number().int(),
  timestamp: z.number().int(),        // seconds
  mediantime: z.number().int().optional(),
  bits: z.number().int(),
  nonce: z.number().int(),
  difficulty: z.number().optional(),
  merkle_root: z.string(),
  tx_count: z.number().int(),
  size: z.number().int(),
  weight: z.number().int(),
  previousblockhash: z.string().optional(),
  extras: z.record(z.unknown()).optional(), // miner/pool sometimes here
});
export type BlockHeader = z.infer<typeof BlockHeaderSchema>;

export const BlocksSchema = z.array(BlockHeaderSchema).min(1).max(10);
```

> The fields reflect the **Esplora** format returned by `GET /block/:hash` and `GET /blocks`‑style endpoints offered by Esplora‑compatible providers. ([docs.validationcloud.io][5])

---

## 6) Server‑side proxy (Route Handlers)

**Goals**

* Centralize **fetching**, **validation**, **error mapping**, and **caching**.
* Be a **good citizen** with public APIs (avoid spamming, enable ISR & Cache‑Control).
* Gracefully handle **reorgs** and failed calls (fallback content & retries).

**Examples**

```ts
// /app/api/mempool/tip-height/route.ts
import { NextResponse } from "next/server";

export const revalidate = 10; // ISR-ish: revalidate every ~10s (tweakable)

export async function GET() {
  const r = await fetch("https://mempool.space/api/blocks/tip/height", {
    // Edge runtime friendly:
    cache: "no-store", // external response is fast int; we control ISR at route level
    next: { revalidate: 10 },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const text = await r.text();
  const height = Number(text.trim());
  if (!Number.isInteger(height)) {
    return NextResponse.json({ error: "bad-format" }, { status: 500 });
  }
  return NextResponse.json({ height });
}
```

```ts
// /app/api/mempool/block-hash-by-height/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const height = req.nextUrl.searchParams.get("height");
  if (!height) return NextResponse.json({ error: "height-required" }, { status: 400 });

  const r = await fetch(`https://mempool.space/api/block-height/${height}`, {
    cache: "no-store",
    next: { revalidate: 10 },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });

  // Endpoint returns plain text hash
  const id = (await r.text()).trim();
  return NextResponse.json({ id });
}
```

```ts
// /app/api/mempool/blocks/route.ts  (supports ?start_height=...)
import { NextRequest, NextResponse } from "next/server";
import { BlocksSchema } from "@/lib/schemas/block";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start_height");
  const url = start
    ? `https://mempool.space/api/blocks/${start}`
    : `https://mempool.space/api/blocks`;
  const r = await fetch(url, { cache: "no-store", next: { revalidate: 5 } });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const data = await r.json();
  const parsed = BlocksSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  return NextResponse.json(parsed.data);
}
```

> Esplora‑style `GET /blocks` returns the 10 newest blocks from tip; `GET /blocks/:start_height` returns the next 10. ([docs.validationcloud.io][4])

```ts
// /app/api/mempool/block/route.ts  (supports ?hash=...)
import { NextRequest, NextResponse } from "next/server";
import { BlockHeaderSchema } from "@/lib/schemas/block";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return NextResponse.json({ error: "hash-required" }, { status: 400 });

  const r = await fetch(`https://mempool.space/api/block/${hash}`, {
    cache: "no-store", next: { revalidate: 5 },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });

  const data = await r.json();
  const parsed = BlockHeaderSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  return NextResponse.json(parsed.data);
}
```

---

## 7) Mock ZK‑proof service (TLS‑style badge)

For V1 we **mock** the proof status but make it pluggable for a real prover (e.g., your **Raito** proofs) later.

**Contract**

```ts
// /app/api/proofs/block/route.ts  (?hash=...)
type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return NextResponse.json({ status: "unavailable" });

  // Deterministic mock: hash the hash, map to states:
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hash));
  const b = Array.from(new Uint8Array(h))[0] % 100;
  const status: ProofStatus =
    b < 70 ? "verified" : b < 90 ? "pending" : "invalid"; // 70/20/10 split
  return NextResponse.json({ status, provider: "Mock-Raito", updatedAt: Date.now() });
}
```

**UI Badge** (states & colors)

* **Verified**: green shield/lock + “ZK verified”
* **Pending**: amber dot + “Proof pending”
* **Invalid**: red cross + “Invalid / failed proof”
* **Unavailable**: gray dash + “No proof yet”

**Tooltip**: “ZK proof status is mocked in this preview build. Header hash verification below is real.”

---

## 8) Local header verification [Deferred]

This section is retained for future reference, but the feature is not active in the current build. If/when re‑enabled, we will recompute the header hash and compare it with the block `id` and the target from `bits`.

* Header is **80 bytes**: version (4), prev block (32), merkle root (32), time (4), `bits` (4), `nonce` (4). See official reference. ([developer.bitcoin.org][2])
* **PoW rule**: `doubleSHA256(header) as uint256 < target(bits)`. (Not “leading zeroes” per se.) ([Bitcoin Stack Exchange][8])

**Implementation tips**

* Mempool’s `/api/block/:hash` gives you the fields; you build the 80‑byte buffer (little‑endian for numeric fields per consensus serialization) and compute SHA‑256 twice with **Web Crypto**.
* Convert `bits` (compact target) to a 256‑bit target integer (big‑endian math):
  `target = mantissa * 256^(exponent-3)` with exponent = first byte, mantissa = next 3 bytes. ([Bitcoin Stack Exchange][8])
* Compare the resulting `hash` (big‑endian integer) with `target`.

> This validation is **orthogonal** to the ZK badge (mocked); it gives users a **real, deterministic** integrity check against upstream data.

---

## 9) Pages & components (LLM‑friendly structure)

**Folders**

```
/app
  /layout.tsx
  /page.tsx                -> Home (blocks list)
  /block/[hash]/page.tsx   -> Block detail
  /verify/page.tsx

  /api/mempool/...         -> proxy handlers
  /api/proofs/...          -> mock ZK

/components
  BlockCard.tsx
  BlockGrid.tsx
  BlockHeaderTable.tsx
  ProofBadge.tsx
  CopyToClipboard.tsx
  SearchBar.tsx
  Stat.tsx                 -> label/value pair
  TimeAgo.tsx
  ErrorState.tsx
  Skeleton.tsx

/lib
  /schemas/block.ts
  /formatters.ts
  /crypto/header.ts        -> serializeHeader, doubleSha256, bitsToTarget, cmp256
  /fetchers.ts             -> thin client fetch layer (TanStack Query helpers)
  /search.ts               -> parse height vs hash

/styles
  globals.css              -> Tailwind setup + tokens
  theme.css                -> CSS variables for colors/spacing

/tests
  header.test.ts           -> header hash re-computation
  bits.test.ts             -> bits->target cases
```

**BlockCard content**

* Title: `Block #${height}`
* Subtitle row: `“x min ago · txs: N · size: X KB · weight: Y wu”`
* Hash line (monospace, truncated) + **Copy** button
* **ProofBadge** (right‑aligned in header) with tooltip
* Footer: `prev: <truncated previousblockhash>` and `pool: extras?.poolName` (if available)

**States**

* Loading: skeleton cards with animated shimmer
* Error: error banner with “Retry”
* Empty: (not expected, but graceful)

---

## 10) Search behavior

* Input accepts either **integer** (height) or **hex** (hash).
* If **height** → call `block-hash-by-height` then redirect to `/block/[hash]`.
* If **hash** → redirect directly.
* On invalid input: toast error.

---

## 11) Caching, performance & rate‑limiting

* Mempool endpoints are **fast** but public instances can enforce limits. Use **short revalidate windows** and **client caches**.
* Pages can leverage **ISR** (e.g., 5–15s) so a burst of users doesn’t hammer upstream.
* Add a **per‑IP rate limiter** on our `/api/...` handlers (e.g., Upstash Redis).
* If you need higher quotas, consider self‑hosting or a provider (Esplora‑compatible providers expose the same endpoints as mempool.space). ([docs.gomaestro.org][9])

---

## 12) Testing strategy

* **Unit tests** (Vitest)

  * `bitsToTarget()` known vectors
  * `serializeHeader()` round‑trips
  * `doubleSha256()` against known header+hash pairs
* **Contract tests**

  * Zod schemas parse real samples (record golden files for CI)
* **E2E (Playwright)**

  * Home loads + skeleton → blocks visible
  * Search “914959” → navigates to block detail for that height
  * Verify page: entering a known block yields **“header hash matches”**

---

## 13) Security & robustness

* Validate/normalize all inputs (height is **int**, hash is **64‑hex**).
* Never surface full upstream errors to users; map to friendly copy.
* Set **CSP** (script‑src self, no inline where possible), **XFO deny**, **Referrer‑Policy** strict.
* Avoid leaking upstream internal URLs.

---

## 14) Design system tokens (snippet)

```css
:root {
  --bg: #0b0b0b; --panel: #111214; --surface: #151618;
  --text: #e8e8e8; --muted: #9ea2a8;
  --accent-600: #f7931a; --accent-500: #ff9900; --accent-700: #cf7a14;
  --success: #39ff14; --warning: #ffcc00; --danger: #ff3b3b;
  --ring: var(--accent-600); --radius: 10px; --gap: 12px;
}
```

---

## 15) Content & microcopy (examples)

* **ProofBadge**

  * Verified: “**ZK verified** (mock)”
  * Pending: “**ZK proof pending** (mock)”
  * Invalid: “**ZK proof invalid** (mock)”
  * Unavailable: “No ZK proof yet (mock)”
* **Verify panel**

  * Title: “Local header verification”
  * Result:

    * ✅ “Header hash matches & PoW target satisfied”
    * ⚠️ “Header hash matches but PoW target not satisfied”
    * ❌ “Header hash mismatch”

---

## 16) LLM code‑generation guardrails

* Keep functions **single‑purpose** with short files (<200 LOC).
* Start each file with a **“What this file does”** docstring.
* Define **Zod schemas** for every external response, export **types** for components.
* Presentational components (pure, typed props) vs. containers (data‑fetch + state).
* Provide **sample curl** in comments next to each proxy route for quick manual tests.
* Use **explicit names** (`getBlockHeaderByHash`, not `fetchBlock`).
* Keep **tests close** to modules (`header.test.ts` beside `header.ts`).

---

## 17) Acceptance criteria (V1)

* Home loads latest 10 blocks with **< 1s** SSR on warm cache; skeleton shown pre‑data.
* “Load more” returns the next 10 via `start_height` pagination. ([docs.validationcloud.io][4])
* Search navigates to the correct block given height or hash.
* Block page displays all header fields + mocked ZK badge.
* Verify page recomputes `doubleSHA256(header)` and compares to id; shows **target vs. hash** pass/fail. ([developer.bitcoin.org][2])
* All external responses validated with Zod; failures render friendly error UI.
* Lighthouse performance ≥ 90, a11y ≥ 95 (dark only).

---

## 18) “Nice to have” (V1.1+ backlog)

* **Real‑time** new block toast via Mempool **WebSocket**; tap to prepend to list. ([Mempool Space][6])
* **Infinite scroll** instead of “Load more”.
* **Pool branding**: show pool logo/name if available in `extras`.
* **Lightweight charts**: time since last block; tx count per block.
* **Mempool summary** strip (tx count, vsize, fee histogram).
* **Switch networks**: mainnet / testnet / signet endpoints. ([Mempool Space][10])
* **Pluggable ZK**: replace mock with your **Raito** proof fetcher + on‑device verifier UI.

---

## 19) References / factual anchors

* **Tip height** and **hash by height** endpoints validated live. ([Mempool Space][1])
* Mempool REST docs describe **/api/blocks/tip/height**, **/api/block-height/\:height**, etc. (Pages are CSR, but content is captured by snippets.) ([Mempool Space][7])
* Esplora‑compatible **/blocks** pagination and **/block/\:hash** response fields. ([docs.validationcloud.io][4])
* **WebSocket API** exists for real‑time integration. ([Mempool Space][6])
* **Header format** (80 bytes) and **bits→target** explanation for local verification. ([developer.bitcoin.org][2])

---

## 20) Implementation checklist (in order)

1. **Repo init**: Next.js (App Router) + TS + Tailwind + shadcn/ui.
2. **Theme**: implement tokens, fonts, base layout, accessibility scaffolding.
3. **Schemas & utils**: Zod schemas; `bitsToTarget`, `serializeHeader`, `doubleSha256`, `cmp256`.
4. **Proxy routes**: `/api/mempool/...` and `/api/proofs/...` with validation + cache.
5. **Home**: block grid + skeleton + load more + search.
6. **Block Detail**: header table + proof badge + local verify panel.
7. **Verify page**: form + fetch + local verify + status UI.
8. **Testing**: unit vectors for bits/target & header hash; basic e2e happy paths.
9. **Polish**: micro‑animations, tooltips, copy‑to‑clipboard, 404/500 states.
10. **Deploy**: Vercel; set ISR & response headers; add Sentry (optional).

---

### Developer notes & gotchas

* **Reorgs**: If a block disappears or prev/next mismatch, show a small **“Chain reorg suspected”** note; refetch chain head after a short delay.
* **Timezones**: Display UTC timestamp + “x minutes ago”; localize client‑side for convenience.
* **Rate limits**: Cache proxy responses and progressively enhance with client caches.
* **CORS**: Proxying via Next avoids browser CORS to public hosts.
* **LLM prompts**: Store a `/docs/CONTRIBUTING.md` with coding conventions to guide future LLM codegen.
