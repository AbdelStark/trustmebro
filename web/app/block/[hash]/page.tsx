import { BlockHeaderTable } from "@/components/BlockHeaderTable";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { serializeHeader, doubleSha256, bitsToTarget, cmp256, hexToBytes } from "@/lib/crypto/header";
import { bytesToHex } from "@/lib/crypto/header";

async function getHeader(hash: string) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/mempool/block?hash=${hash}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch block");
  return r.json();
}

async function getProof(hash: string): Promise<{ status: ProofStatus }> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/proofs/block?hash=${hash}`, { cache: "no-store" });
  return r.json();
}

async function verifyHeader(header: any) {
  // Recompute header hash
  const headerBytes = serializeHeader({
    version: header.version,
    previousblockhash: header.previousblockhash,
    merkle_root: header.merkle_root,
    timestamp: header.timestamp,
    bits: header.bits,
    nonce: header.nonce,
  });
  const h = await doubleSha256(headerBytes);
  const recomputed = bytesToHex(Uint8Array.from(h).reverse());
  const matches = recomputed === header.id;
  const target = bitsToTarget(header.bits);
  const hBig = Uint8Array.from(h); // big-endian after doubleSha256, compare as is
  const powOk = cmp256(hBig, target) < 0;
  return { recomputed, matches, powOk, targetHex: bytesToHex(target) };
}

export default async function BlockDetail({ params }: { params: { hash: string } }) {
  const header = await getHeader(params.hash);
  const proof = await getProof(params.hash);
  const verify = await verifyHeader(header);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Block #{header.height}</h1>
        <ProofBadge status={proof.status} />
      </div>
      <BlockHeaderTable header={header} />
      <div className="panel p-4">
        <h2 className="font-semibold mb-2">Local header verification</h2>
        <div className="text-sm space-y-1">
          <div>
            Recomputed hash: <span className="font-mono break-all">{verify.recomputed}</span>
          </div>
          <div>
            Target (from bits): <span className="font-mono break-all">{verify.targetHex}</span>
          </div>
          <div className="mt-2">
            {verify.matches ? (
              verify.powOk ? (
                <span className="text-[var(--success)]">✅ Header hash matches & PoW target satisfied</span>
              ) : (
                <span className="text-[var(--warning)]">⚠️ Header hash matches but PoW target not satisfied</span>
              )
            ) : (
              <span className="text-[var(--danger)]">❌ Header hash mismatch</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

