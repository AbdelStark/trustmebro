import { NextRequest, NextResponse } from "next/server";
import { createRaitoSpvSdk } from "@starkware-bitcoin/spv-verify";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

// Single SDK instance reused across requests. The SDK manages its own defaults
// (no custom URL required).
const sdkInstance = createRaitoSpvSdk();
let sdkReady: Promise<void> | null = null;
let sdkInitialized = false;
async function ensureSdk() {
  if (!sdkReady) {
    console.log(`[RaitoSDK] init: starting WebAssembly load…`);
    sdkReady = sdkInstance.init()
      .then(() => { sdkInitialized = true; console.log(`[RaitoSDK] init: ready ✅`); })
      .catch((e: any) => { console.error(`[RaitoSDK] init: failed ❌`, e?.message ?? e); throw e; });
  }
  await sdkReady;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms = 8000, label = "operation"): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      console.warn(`[RaitoSDK] ${label}: timeout after ${ms}ms`);
      reject(new Error("timeout"));
    }, ms);
    p.then((v) => { clearTimeout(id); resolve(v); }, (e) => { clearTimeout(id); reject(e); });
  });
}

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ status: "unavailable" as const }, { status: 400 });
  try {
    const short = txid.slice(0, 8);
    console.log(`[RaitoSDK][tx ${short}] request: start`);
    await ensureSdk();
    const t0 = Date.now();
    console.log(`[RaitoSDK][tx ${short}] fetchProof: start`);
    const proof = await withTimeout(sdkInstance.fetchProof(txid), 12000, `fetchProof(tx ${short})`);
    const t1 = Date.now();
    console.log(`[RaitoSDK][tx ${short}] fetchProof: ok in ${t1 - t0}ms (len=${proof?.length ?? 0})`);
    console.log(`[RaitoSDK][tx ${short}] verifyProof: start`);
    const ok: boolean = await withTimeout(sdkInstance.verifyProof(proof), 12000, `verifyProof(tx ${short})`);
    const t2 = Date.now();
    console.log(`[RaitoSDK][tx ${short}] verifyProof: ${ok ? "valid ✅" : "invalid ❌"} in ${t2 - t1}ms; total ${t2 - t0}ms`);
    let meta: any = {};
    try {
      const parsed = JSON.parse(proof);
      meta = {
        height: parsed?.chain_state?.block_height,
        best_block: parsed?.chain_state?.best_block_hash,
      };
    } catch {}
    return NextResponse.json({
      status: (ok ? "verified" : "invalid") as ProofStatus,
      provider: "Raito",
      updatedAt: Date.now(),
      timings: { fetchMs: t1 - t0, verifyMs: t2 - t1, totalMs: t2 - t0 },
      meta,
    });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error(`[RaitoSDK] error: ${msg}`);
    // Degrade gracefully: return 200 with 'unavailable' so UI doesn't log errors.
    return NextResponse.json({ status: "unavailable" as const, provider: "Raito", error: msg });
  }
}
