import { NextRequest, NextResponse } from "next/server";
import { TxsSchema } from "@/lib/schemas/tx";

export const revalidate = 5;

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  const from = req.nextUrl.searchParams.get("from");
  if (!hash) return NextResponse.json({ error: "hash-required" }, { status: 400 });
  const suffix = from ? `/txs/${from}` : "/txs";
  const url = `https://mempool.space/api/block/${hash}${suffix}`;
  const r = await fetch(url, { cache: "no-store", next: { revalidate } });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const data = await r.json();
  const parsed = TxsSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  // Map to minimal shape
  const out = parsed.data.map((t) => ({ id: t.txid, size: t.size, weight: t.weight, fee: t.fee }))
  return NextResponse.json(out);
}

