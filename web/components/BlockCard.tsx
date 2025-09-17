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
    <div className="relative panel p-4 transition-shadow hover:shadow-[var(--accent-600)]/10 hover:shadow-lg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-chrome" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Block</div>
          <div className="text-lg font-semibold">#{block.height}</div>
        </div>
        <ProofBadge status={proof.status} />
      </div>

      <div className="relative mt-2 text-sm text-[var(--muted)]">
        <TimeAgo ts={block.timestamp} /> · txs: {block.tx_count} · size: {formatBytes(block.size)} · weight: {formatWu(block.weight)}
      </div>

      <div className="relative mt-3 text-sm">
        <div className="flex items-center gap-2 font-mono">
          <span className="truncate">{truncateHex(block.id)}</span>
          <CopyToClipboard text={block.id} ariaLabel="Copy block hash" />
        </div>
        {block.previousblockhash && (
          <div className="mt-1 text-xs text-[var(--muted)]">prev: {truncateHex(block.previousblockhash)}</div>
        )}
      </div>

      <div className="relative mt-4">
        <Link className="btn text-sm" href={`/block/${block.id}`}>
          Open details →
        </Link>
      </div>
    </div>
  );
}
