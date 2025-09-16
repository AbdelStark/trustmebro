import { NextRequest, NextResponse } from "next/server";
import { BlocksSchema } from "@/lib/schemas/block";

export const revalidate = 5;

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start_height");
  const url = start ? `https://mempool.space/api/blocks/${start}` : `https://mempool.space/api/blocks`;
  const r = await fetch(url, { cache: "no-store", next: { revalidate } });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const data = await r.json();
  const parsed = BlocksSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  return NextResponse.json(parsed.data);
}

