"use client";
/**
 * What this file does
 * Client component to lazily load and display transactions in a block, with expand/collapse and pagination.
 */
import { useEffect, useState } from "react";
import Link from "next/link";

type TxMeta = { id: string; size: number; weight: number; fee?: number };

export function TxList({ hash, total }: { hash: string; total: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TxMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const from = items.length;
      const r = await fetch(`/api/mempool/block-txs?hash=${hash}${from ? `&from=${from}` : ""}`);
      const j = (await r.json()) as TxMeta[];
      if (!Array.isArray(j)) throw new Error("Bad response");
      setItems((prev) => [...prev, ...j]);
    } catch (e: any) {
      setError(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && items.length === 0) void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Transactions</div>
          <div className="text-sm text-[var(--muted)]">{total.toLocaleString()} total</div>
        </div>
        <button className="btn text-sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide list" : "Show list"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {items.length === 0 && loading && (
            <div className="text-sm text-[var(--muted)]">Loading transactions…</div>
          )}
          {error && <div className="text-[var(--danger)] text-sm">{error}</div>}
          {items.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-white/10 bg-[var(--surface)] px-3 py-2">
              <div className="font-mono text-sm truncate pr-4">
                <Link className="hover:underline" href={`/tx/${t.id}`}>{t.id}</Link>
              </div>
              <div className="text-xs text-[var(--muted)] whitespace-nowrap">
                {t.fee != null ? `${t.fee} sat fee` : ""} · {Math.round(t.weight/4)} vB · {t.weight.toLocaleString()} WU
              </div>
            </div>
          ))}
          {items.length < total && (
            <div>
              <button className="btn text-sm" disabled={loading} onClick={loadMore}>
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

