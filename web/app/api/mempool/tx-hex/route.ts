import { NextRequest, NextResponse } from "next/server";

export const revalidate = 5;

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ error: "txid-required" }, { status: 400 });
  const r = await fetch(`https://mempool.space/api/tx/${txid}/hex`, { cache: "no-store", next: { revalidate } });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const text = await r.text();
  return new NextResponse(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

