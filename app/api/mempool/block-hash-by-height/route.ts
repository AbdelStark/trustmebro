import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const height = req.nextUrl.searchParams.get("height");
  if (!height) return NextResponse.json({ error: "height-required" }, { status: 400 });

  const r = await fetch(`https://mempool.space/api/block-height/${height}`, {
    cache: "no-store",
    next: { revalidate: 10 },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });

  const id = (await r.text()).trim();
  return NextResponse.json({ id });
}

