import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Use SDK function to avoid direct browser CORS and to stay consistent.
    const { createRaitoSpvSdk } = await import("@starkware-bitcoin/spv-verify");
    const sdk = createRaitoSpvSdk("https://api.raito.wtf");
    console.log("[api/raito/proven-height] calling SDK.fetchRecentProvenHeight() (no init)");
    const block_height = await sdk.fetchRecentProvenHeight();
    console.log("[api/raito/proven-height] success height=", block_height);
    return NextResponse.json({ height: block_height });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[api/raito/proven-height] error", e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
