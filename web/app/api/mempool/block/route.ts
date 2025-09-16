import { NextRequest, NextResponse } from "next/server";
import { BlockHeaderSchema } from "@/lib/schemas/block";

export const revalidate = 5;

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return NextResponse.json({ error: "hash-required" }, { status: 400 });

  const r = await fetch(`https://mempool.space/api/block/${hash}`, {
    cache: "no-store",
    next: { revalidate },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const data = await r.json();
  const parsed = BlockHeaderSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "schema" }, { status: 500 });
  return NextResponse.json(parsed.data);
}

