/**
 * What this file does
 * Renders a single block card for the grid.
 */
import Link from "next/link";
import { truncateHex, formatBytes, formatWu } from "@/lib/formatters";
import { ProofBadge, type ProofStatus } from "./ProofBadge";
import { CopyToClipboard } from "./CopyToClipboard";
import { TimeAgo } from "./TimeAgo";
import { getBaseUrl } from "@/lib/base-url";

type BlockHeader = {
  id: string;
  height: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  previousblockhash?: string;
};

export async function BlockCard({ block }: { block: BlockHeader }) {
  // Fetch mocked proof status from our API (server component fetch)
  const base = await getBaseUrl();
  const proof = await fetch(`${base}/api/proofs/block?hash=${block.id}`, { cache: "no-store" }).then(
    (r) => r.json() as Promise<{ status: ProofStatus }>
  );

  return (
    <div className="panel p-4 hover:shadow-md hover:shadow-[var(--accent-600)]/10 transition-shadow">
      <div className="flex items-center gap-2 justify-between">
        <div className="font-semibold">Block #{block.height}</div>
        <ProofBadge status={proof.status} />
      </div>
      <div className="mt-1 text-sm text-[var(--muted)]">
        <TimeAgo ts={block.timestamp} /> · txs: {block.tx_count} · size: {formatBytes(block.size)} · weight: {formatWu(block.weight)}
      </div>
      <div className="mt-3 font-mono text-sm break-all">
        <div className="flex items-center gap-2">
          <span className="truncate">{truncateHex(block.id)}</span>
          <CopyToClipboard text={block.id} ariaLabel="Copy block hash" />
        </div>
      </div>
      {block.previousblockhash && (
        <div className="mt-2 text-xs text-[var(--muted)]">
          prev: {truncateHex(block.previousblockhash)}
        </div>
      )}
      <div className="mt-3">
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-sm hover:border-[var(--accent-600)]"
          href={`/block/${block.id}`}
        >
          Open details →
        </Link>
      </div>
    </div>
  );
}
