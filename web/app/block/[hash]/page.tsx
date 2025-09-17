import { BlockHeaderTable } from "@/components/BlockHeaderTable";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { getBaseUrl } from "@/lib/base-url";
import { TxList } from "@/components/TxList";

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
  // Local header verification panel removed per current scope

  return (
    <div className="space-y-6">
      <div className="panel p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Block</div>
          <h1 className="text-2xl font-semibold">#{header.height}</h1>
        </div>
        <ProofBadge status={proof.status} />
      </div>
      <BlockHeaderTable header={header} />
      <TxList hash={p.hash} total={header.tx_count} />
    </div>
  );
}
