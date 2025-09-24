import { BlockGrid } from "@/components/BlockGrid";
import { getBaseUrl } from "@/lib/base-url";

async function getBlocks(startHeight?: string) {
  const sp = startHeight ? `?start_height=${startHeight}` : "";
  const base = await getBaseUrl();
  const url = `${base}/api/mempool/blocks${sp}`;  
  const res = await fetch(url, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "<failed to read body>");
    throw new Error(
      `Failed to load blocks from ${url}\n` +
      `Status: ${res.status} ${res.statusText}\n` +
      `Response body: ${text}`
    );
  }
  return res.json();
}

export default async function Home({ searchParams }: { searchParams: Promise<{ start_height?: string }> }) {
  const sp = await searchParams;
  const blocks = await getBlocks(sp?.start_height);
  const last = blocks[blocks.length - 1]?.height;
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Latest Blocks</h1>
          <p className="text-sm text-[var(--muted)]">Fetched via server proxy · Esplora compatible</p>
        </div>
      </div>
      <BlockGrid blocks={blocks} />
      {last && (
        <div className="pt-4">
          <a
            className="btn"
            href={`/?start_height=${last - 1}`}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
