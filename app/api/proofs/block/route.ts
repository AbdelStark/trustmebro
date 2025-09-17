import { NextRequest, NextResponse } from "next/server";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return NextResponse.json({ status: "unavailable" as const });
  // For now, treat all as verified while backend integration is in progress.
  return NextResponse.json({ status: "verified" as const, provider: "Raito", updatedAt: Date.now() });
}
