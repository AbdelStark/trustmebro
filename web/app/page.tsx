import { BlockGrid } from "@/components/BlockGrid";

async function getBlocks(startHeight?: string) {
  const sp = startHeight ? `?start_height=${startHeight}` : "";
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/mempool/blocks${sp}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load blocks");
  return res.json();
}

export default async function Home({ searchParams }: { searchParams: { start_height?: string } }) {
  const blocks = await getBlocks(searchParams?.start_height);
  const last = blocks[blocks.length - 1]?.height;
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Latest Blocks</h1>
          <p className="text-sm text-[var(--muted)]">Fetched from mempool.space via server proxy</p>
        </div>
      </div>
      <BlockGrid blocks={blocks} />
      {last && (
        <div className="pt-4">
          <a
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 hover:border-[var(--accent-600)]"
            href={`/?start_height=${last - 1}`}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
