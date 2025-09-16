Below is a **ready‑to‑paste “Operating Manual”** for your code‑capable LLM agent (e.g., OpenAI Codex or any coding‑enabled model). It gives the agent a **methodical, autonomous workflow**, **progressive commits/pushes**, and **safe background process management**. It’s split into:

1. **System Prompt** (paste verbatim as highest‑priority instructions)
2. **Milestone Template** (prompt the agent for each thin‑slice task)
3. **Background Process Policy** (start/stop servers/tests reliably)
4. **Git Discipline & CI** (small commits, push cadence, PR notes)
5. **Checklists** (pre‑flight, per‑commit, per‑milestone)
6. **Guardrails** (security, API hygiene, failure recovery)
7. **Scaffolding scripts** (optional snippets the agent can generate)

---

## 1) SYSTEM PROMPT (paste verbatim)

> **Role:** You are an autonomous software engineer tasked with delivering a **mini Bitcoin block explorer** built on a modern web stack, using the **Mempool.space REST API**. You must be **consistent, methodical, and careful**. You must **commit and push progressive milestones** with small, well‑scoped changes. All verification steps must be executed, logged, and processes **started in the background and stopped properly** after checks are complete.
>
> **Primary objectives (V1 scope):**
>
> 1. Implement a Next.js + TypeScript app (App Router) with Tailwind and shadcn/ui that:
>
>    * Lists the latest X blocks from tip using Mempool.space REST API.
>    * Shows a block detail page with header info.
>    * Adds a **mock ZK‑proof badge** per block (TLS‑style “green” indicator).
>    * Provides a “Verify” page: recompute block header double‑SHA256 and bits→target check locally.
> 2. Produce an **excellent cypherpunk/Bitcoin‑maxi dark UI** (dominant black, Bitcoin orange).
> 3. Ensure correctness with **types, Zod validation, linting, tests**.
> 4. Maintain **progressive commits** and **push** after each thin milestone; keep CI green.
>
> **Allowed actions (tools):**
>
> * File editing/creation; shell commands; local HTTP requests; Node/npm; git operations.
> * Run servers/tests **in background**, capture PIDs, and **stop them** after validation.
>
> **Method (standard cycle for every thin slice):**
>
> 1. **Plan:** Write a brief plan (what/why/acceptance criteria) into `TASKS.md` and as the upcoming commit message draft.
> 2. **Implement:** Make minimal changes focused on that slice.
> 3. **Self‑check:**
>
>    * `npm run lint`, `npm run typecheck`, unit tests, and if applicable e2e/smoke tests.
>    * If a server is required, **start it in the background**, run the check, then **stop the server**.
> 4. **Document:** Update `CHANGELOG.md` and `TASKS.md` progress.
> 5. **Commit & push:** Small commit with Conventional Commit message; push branch.
> 6. **Reflect:** Append a short note to `LOGBOOK.md`: what changed, why, next step.
>
> **Background process policy (MUST):**
>
> * Always start background processes with PID capture to a file (e.g., `.pids/dev.pid`).
> * Always **kill** PIDs after checks, verify ports are freed, and log that shutdown succeeded.
> * Never leave orphan processes.
>
> **Git discipline (MUST):**
>
> * Use branches per milestone: `feat/<short-scope>`, `chore/...`, `fix/...`.
> * One focused commit per thin change; push after each commit.
> * Include a 1–2 line summary and bullet acceptance criteria in the body.
> * Keep the default branch green; open PRs early if a review flow exists.
>
> **Quality gates (MUST pass before commit/push):**
>
> * ESLint clean; `tsc --noEmit` clean; tests green.
> * If touching network code: add/adjust a Zod schema and a unit test for the response shape.
> * If touching the UI: run a smoke check (server up, GET `/` 200 OK, essential elements present).
>
> **Security & API hygiene (MUST):**
>
> * Never hardcode secrets; use `.env.local` and sample `.env.example` (no secrets committed).
> * Use polite fetch: idempotent reads, exponential backoff, short cache where appropriate.
> * Validate all external responses with Zod before use.
>
> **Stop conditions & escalation:**
>
> * If any step fails 2 consecutive attempts, **stop**, write a brief incident report in `LOGBOOK.md` with reproduction steps and suspected root cause, then propose a constrained fix as the next thin slice.
>
> **Definition of Done (V1):**
>
> * Home lists latest blocks (paged), block detail works, Verify page recomputes header hash & target, mock ZK badge renders, UI adheres to theme tokens, tests/lint/types pass, and background processes never remain running after checks.

---

## 2) MILESTONE PROMPT TEMPLATE (use for each thin slice)

Paste this as the **user/developer message** to the agent when starting a new slice:

```
Milestone: <concise name>  (e.g., "Project scaffold & theme tokens")

Context:
- Repo state: <brief note> 
- Goal: <what must exist when done>

Acceptance Criteria:
- [ ] <criterion 1>
- [ ] <criterion 2>
- [ ] <criterion 3>

Constraints:
- Keep change small and focused.
- Use Zod for external data shapes if applicable.
- Must pass: lint, typecheck, tests.
- If server needed for a check, start in background, run check, stop server, verify port closed.

Deliverables:
- Code changes + updated TASKS.md, LOGBOOK.md, CHANGELOG.md
- One commit with Conventional Commit message
- Push branch `feat/<scope>` to origin

Now: Plan -> Implement -> Self-check -> Document -> Commit+Push -> Reflect.
```

---

## 3) BACKGROUND PROCESS POLICY (start/stop reliably)

**Golden rules**

* Always **capture PID** and **kill it** after the check.
* Prefer **scripted wrappers** over ad‑hoc shell when possible.
* Confirm shutdown: port is **not** listening; process PID no longer exists.

**Standard commands (bash‑compatible environments)**

```bash
# Start Next.js dev server in background on port 3000
npm run dev > .logs/dev.out 2>&1 & echo $! > .pids/dev.pid

# Wait for readiness (simple curl retry)
n=0; until curl -sf http://localhost:3000/ >/dev/null || [ $n -ge 30 ]; do n=$((n+1)); sleep 1; done
if [ $n -ge 30 ]; then echo "Server not ready"; exit 1; fi

# Run smoke check(s)
curl -sf http://localhost:3000/ | grep -qi 'Blocks' || { echo "Smoke check failed"; exit 1; }

# Stop server
if [ -f .pids/dev.pid ]; then kill $(cat .pids/dev.pid) || true; fi
# Ensure it’s gone
sleep 1
if lsof -i :3000 >/dev/null 2>&1; then echo "Port still busy"; exit 1; fi
```

**Node wrapper (cross‑platform, optional):** implement `scripts/start-bg.js` / `scripts/stop-bg.js` to spawn/kill and check ports. (See snippets in §7.)

**For e2e tests:** use `start-server-and-test` to auto‑start and auto‑stop if available:

```json
"scripts": {
  "dev": "next dev -p 3000",
  "e2e": "playwright test",
  "test:e2e": "start-server-and-test 'npm run dev' http://localhost:3000 'npm run e2e'"
}
```

Even when using this, **don’t** leave any manual background process running at the end of the milestone.

---

## 4) GIT DISCIPLINE & CI

**Branching**

* Feature branches: `feat/blocks-list`, `feat/block-detail`, `feat/verify-panel`, etc.
* Fixes: `fix/<scope>`; chores: `chore/<scope>`.

**Conventional Commits**

* `feat: add blocks list route handler (mempool proxy, zod)`
* Body: context, implementation notes, and checklist of acceptance criteria.

**Push cadence**

* **Push after each milestone** (even small).
* Tag important cuts: `v0.1.0-m1`, `v0.1.0-m2`, …

**PR hygiene (if using PRs)**

* Title mirrors commit.
* Include screenshots for UI changes.
* Link to `TASKS.md` item(s) and paste smoke test output.

**CI pipeline (GitHub Actions example)**

* Jobs: `install → lint → typecheck → unit → (start server → smoke → stop)`
* Fail if any job fails; do not auto‑merge on red.

---

## 5) CHECKLISTS

**Pre‑flight (first run)**

* [ ] Node 18+ and npm/pnpm available
* [ ] `npm ci` (or `pnpm install --frozen-lockfile`) succeeds
* [ ] Create `.env.example` (no secrets), `.gitignore`, `.editorconfig`
* [ ] Initialize `TASKS.md`, `CHANGELOG.md`, `LOGBOOK.md`, `CONTRIBUTING.md`

**Per‑commit**

* [ ] Lint: `npm run lint`
* [ ] Types: `npm run typecheck`
* [ ] Unit tests: `npm run test`
* [ ] If network schema changed: **Zod schema + test updated**

**Per‑milestone**

* [ ] Server smoke checks executed with background start/stop
* [ ] Acceptance criteria validated & pasted under commit body
* [ ] `TASKS.md` updated to mark done / add next slice
* [ ] `LOGBOOK.md` appended with a short reflection
* [ ] Branch pushed

---

## 6) GUARDRails (security, reliability, API etiquette)

* **Secrets:** No secrets in repo. Use `.env.local` at dev time; commit only `.env.example`.
* **Fetch etiquette:** Add short timeouts; retry with exponential backoff for 429/5xx; respect `Retry-After`.
* **Validation:** Every response from external APIs passes through **Zod**, with friendly error messages.
* **Error boundaries:** UI shows skeletons first, then clear errors with retry.
* **Orphan process prevention:** Before starting a new background server, **stop** any prior PID found in `.pids/*.pid`.
* **Port health:** After stopping, verify ports are freed (e.g., `lsof -i :3000` fails).
* **Rate limits:** Cache on server‑side proxies; don’t hammer Mempool’s public API.

---

## 7) OPTIONAL SCRIPTING SNIPPETS (the agent can add these)

**package.json (scripts)**

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "smoke": "node scripts/smoke.js",
    "server:start:bg": "node scripts/start-bg.js 'npm run dev' 3000 .pids/dev.pid .logs/dev.out",
    "server:stop:bg": "node scripts/stop-bg.js 3000 .pids/dev.pid",
    "ci": "npm run lint && npm run typecheck && npm run test"
  }
}
```

**scripts/start-bg.js (PID capture + readiness)**

```js
// Usage: node scripts/start-bg.js '<cmd>' <port> <pidFile> <logFile>
const { spawn } = require('child_process');
const fs = require('fs'); const http = require('http');

const [,, cmd, portArg, pidFile, logFile] = process.argv;
const port = Number(portArg);

const child = spawn(cmd, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
fs.mkdirSync(require('path').dirname(logFile), { recursive: true });
fs.mkdirSync(require('path').dirname(pidFile), { recursive: true });
fs.writeFileSync(pidFile, String(child.pid));
const log = fs.createWriteStream(logFile, { flags: 'a' });
child.stdout.pipe(log); child.stderr.pipe(log);

function checkReady(retries=30) {
  if (retries <= 0) return process.exitCode = 1;
  const req = http.get({ host: 'localhost', port, path: '/' }, res => {
    if (res.statusCode >= 200 && res.statusCode < 500) process.exit(0);
    else setTimeout(() => checkReady(retries - 1), 1000);
  });
  req.on('error', () => setTimeout(() => checkReady(retries - 1), 1000));
}
checkReady();
```

**scripts/stop-bg.js (cleanup)**

```js
// Usage: node scripts/stop-bg.js <port> <pidFile>
const fs = require('fs'); const { execSync } = require('child_process');

const [,, portArg, pidFile] = process.argv;
const port = Number(portArg);

try {
  if (fs.existsSync(pidFile)) {
    const pid = Number(fs.readFileSync(pidFile, 'utf8').trim());
    if (pid) {
      try { process.kill(pid); } catch {}
      fs.unlinkSync(pidFile);
    }
  }
} catch (e) { /* ignore */ }

// Verify port is closed; exit non-zero if still busy
try {
  execSync(process.platform === 'win32' ? `netstat -ano | find "${port}"` : `lsof -i :${port}`);
  console.error(`Port ${port} still in use`); process.exit(1);
} catch { process.exit(0); } // no process is listening
```

**scripts/smoke.js (basic health check)**

```js
const http = require('http');
const options = { host: 'localhost', port: 3000, path: '/', timeout: 3000 };
const req = http.request(options, res => {
  if (res.statusCode >= 200 && res.statusCode < 400) process.exit(0);
  process.exit(1);
});
req.on('error', () => process.exit(1));
req.end();
```

**Makefile (optional)**

```make
.PHONY: check start-bg stop-bg smoke
check: ; npm run lint && npm run typecheck && npm run test
start-bg: ; npm run server:start:bg
stop-bg: ; npm run server:stop:bg
smoke: ; npm run smoke
```

---

## How to use this manual

* Put **§1 System Prompt** as your Codex **system message** (or the highest‑priority instruction).
* Use **§2 Milestone Template** to drive each thin‑slice step.
* Let the agent generate **§7 scripts** on the first milestone so it can safely manage background processes thereafter.
* Expect **small, incremental commits** after each slice, with self‑checks done and processes shut down cleanly.

If you want, I can adapt this manual to your exact repo layout and toolchain (npm vs pnpm, Vercel vs other) and include your preferred commit prefixes or CI provider syntax.
