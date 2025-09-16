import { NextRequest, NextResponse } from "next/server";

type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return NextResponse.json({ status: "unavailable" as const });

  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hash));
  const b = Array.from(new Uint8Array(h))[0] % 100;
  const status: ProofStatus = b < 70 ? "verified" : b < 90 ? "pending" : "invalid";
  return NextResponse.json({ status, provider: "Mock-Raito", updatedAt: Date.now() });
}

