import { BlockHeaderTable } from "@/components/BlockHeaderTable";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { getBaseUrl } from "@/lib/base-url";
import { TxList } from "@/components/TxList";
import { VerifyBlockButton } from "@/components/VerifyBlock";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function getHeader(hash: string) {
  const base = await getBaseUrl();
  const r = await fetch(`${base}/api/mempool/block?hash=${hash}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch block");
  return r.json();
}

async function getProof(hash: string): Promise<{ status: ProofStatus }> {
  const base = await getBaseUrl();
  const r = await fetch(`${base}/api/proofs/block?hash=${hash}`, { cache: "no-store" });
  return r.json();
}

export default async function BlockDetail({ params }: { params: Promise<{ hash: string }> }) {
  const p = await params;
  const header = await getHeader(p.hash);
  const proof = await getProof(p.hash);
  // Try to resolve successor by height; previous is included in header.
  async function getNextHash(height: number): Promise<string | null> {
    try {
      const base = await getBaseUrl();
      const r = await fetch(`${base}/api/mempool/block-hash-by-height?height=${height + 1}`, { cache: "no-store" });
      if (!r.ok) return null;
      const j = (await r.json()) as { id?: string };
      return j.id || null;
    } catch {
      return null;
    }
  }
  const prevId: string | null = header.previousblockhash || null;
  const nextId = await getNextHash(header.height);
  // Local header verification panel removed per current scope

  return (
    <div className="space-y-6">
      <div className="panel p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1 min-w-40">
          <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Block</div>
          <h1 className="text-2xl font-semibold">#{header.height}</h1>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-center">
          {/* Prev / Next navigation */}
          <div className="flex items-center gap-2">
            {prevId ? (
              <Link
                href={`/block/${prevId}`}
                className="btn"
                title={`Previous block (#${header.height - 1})`}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Link>
            ) : (
              <button className="btn" disabled title="No previous block">
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
            )}
            {nextId ? (
              <Link
                href={`/block/${nextId}`}
                className="btn"
                title={`Next block (#${header.height + 1})`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <button className="btn" disabled title="No next block yet">
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProofBadge status={proof.status} />
          <VerifyBlockButton header={header} />
        </div>
      </div>
      <BlockHeaderTable header={header} />
      <TxList hash={p.hash} total={header.tx_count} />
    </div>
  );
}
