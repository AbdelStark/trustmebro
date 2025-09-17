import { NextRequest, NextResponse } from "next/server";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ status: "unavailable" as const });
  // For now, always verified; will wire to real provider next.
  return NextResponse.json({ status: "verified" as const, provider: "Raito", updatedAt: Date.now() });
}
