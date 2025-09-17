import { getBaseUrl } from "@/lib/base-url";
import { formatBytes, formatWu } from "@/lib/formatters";
import TxVerifyWidget from "@/components/TxVerifyWidget";

async function getTx(id: string) {
  const base = await getBaseUrl();
  const r = await fetch(`${base}/api/mempool/tx?txid=${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch tx");
  return r.json();
}

export default async function TxPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const tx = await getTx(p.id);
  return (
    <div className="space-y-6">
      <div className="panel p-4 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-40">
            <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Transaction</div>
            <h1 className="text-xl font-semibold font-mono break-all">{tx.txid}</h1>
          </div>
          <div className="flex items-center gap-3">
            <TxVerifyWidget txid={tx.txid} />
          </div>
        </div>
      </div>
      <div className="panel p-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-white/5"><td className="py-2 text-[var(--muted)] pr-3">Size</td><td className="py-2">{formatBytes(tx.size)}</td></tr>
            <tr className="border-b border-white/5"><td className="py-2 text-[var(--muted)] pr-3">Weight</td><td className="py-2">{formatWu(tx.weight)}</td></tr>
            {tx.fee != null && (<tr className="border-b border-white/5"><td className="py-2 text-[var(--muted)] pr-3">Fee</td><td className="py-2">{tx.fee} sat</td></tr>)}
            {tx.locktime != null && (<tr className="border-b border-white/5"><td className="py-2 text-[var(--muted)] pr-3">Locktime</td><td className="py-2">{tx.locktime}</td></tr>)}
            {tx.version != null && (<tr className="border-b border-white/5"><td className="py-2 text-[var(--muted)] pr-3">Version</td><td className="py-2">{tx.version}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
