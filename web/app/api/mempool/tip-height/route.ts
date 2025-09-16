import { NextResponse } from "next/server";

export const revalidate = 10;

export async function GET() {
  const r = await fetch("https://mempool.space/api/blocks/tip/height", {
    cache: "no-store",
    next: { revalidate: 10 },
  });
  if (!r.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const text = await r.text();
  const height = Number(text.trim());
  if (!Number.isInteger(height)) {
    return NextResponse.json({ error: "bad-format" }, { status: 500 });
  }
  return NextResponse.json({ height });
}

