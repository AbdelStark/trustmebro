import { BlockHeaderTable } from "@/components/BlockHeaderTable";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { getBaseUrl } from "@/lib/base-url";

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

export default async function BlockDetail({ params }: { params: { hash: string } }) {
  const header = await getHeader(params.hash);
  const proof = await getProof(params.hash);
  // Local header verification panel removed per current scope

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Block #{header.height}</h1>
        <ProofBadge status={proof.status} />
      </div>
      <BlockHeaderTable header={header} />
      {/* Local header verification panel removed */}
    </div>
  );
}
