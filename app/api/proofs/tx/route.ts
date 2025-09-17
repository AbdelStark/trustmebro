import { NextRequest, NextResponse } from "next/server";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

let sdkPromise: Promise<any> | null = null;
async function getSdk() {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const mod = await import("@starkware-bitcoin/spv-verify");
      const sdk = (mod as any).createRaitoSpvSdk?.(process.env.RAITO_RPC_URL) ?? (mod as any).createRaitoSpvSdk?.();
      if (!sdk) throw new Error("Raito SPV SDK not available");
      await sdk.init();
      return sdk;
    })();
  }
  return sdkPromise;
}

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ status: "unavailable" as const }, { status: 400 });
  try {
    const sdk = await getSdk();
    const t0 = Date.now();
    const proof = await sdk.fetchProof(txid);
    const t1 = Date.now();
    const ok: boolean = await sdk.verifyProof(proof);
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
