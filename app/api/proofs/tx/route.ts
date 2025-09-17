import { NextRequest, NextResponse } from "next/server";
import { createRaitoSpvSdk } from "@starkware-bitcoin/spv-verify";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

// Single SDK instance reused across requests. The SDK manages its own defaults
// (no custom URL required).
const sdkInstance = createRaitoSpvSdk();
let sdkReady: Promise<void> | null = null;
function ensureSdk() {
  if (!sdkReady) sdkReady = sdkInstance.init();
  return sdkReady;
}

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ status: "unavailable" as const }, { status: 400 });
  try {
    await ensureSdk();
    const t0 = Date.now();
    const proof = await sdkInstance.fetchProof(txid);
    const t1 = Date.now();
    const ok: boolean = await sdkInstance.verifyProof(proof);
    const t2 = Date.now();
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
    return NextResponse.json({ status: "unavailable" as const, error: e?.message ?? String(e) }, { status: 502 });
  }
}
