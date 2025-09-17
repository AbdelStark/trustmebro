import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const revalidate = 5;

// We accept the full Esplora tx object; validate a few key fields for safety.
const TxDetailSchema = z.object({
  txid: z.string(),
  size: z.number().int(),
  weight: z.number().int(),
  fee: z.number().int().optional(),
  version: z.number().int().optional(),
  locktime: z.number().int().optional(),
  vin: z.array(z.unknown()).optional(),
  vout: z.array(z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  const txid = req.nextUrl.searchParams.get("txid");
  if (!txid) return NextResponse.json({ error: "txid-required" }, { status: 400 });
  const url = `https://mempool.space/api/tx/${txid}`;
  const r = await fetch(url, { cache: "no-store", next: { revalidate } });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const data = await r.json();
  const parsed = TxDetailSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  return NextResponse.json(parsed.data);
}

