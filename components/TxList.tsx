"use client";
/**
 * What this file does
 * Client component to lazily load and display transactions in a block, with expand/collapse and pagination.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CopyToClipboard } from "./CopyToClipboard";

type TxMeta = { id: string; size: number; weight: number; fee?: number };

export function TxList({ hash, total }: { hash: string; total: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TxMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const from = items.length;
      console.log(`[TxList] loading txs for block ${hash} from=${from}`);
      const r = await fetch(`/api/mempool/block-txs?hash=${hash}${from ? `&from=${from}` : ""}`);
      const j = (await r.json()) as TxMeta[];
      if (!Array.isArray(j)) throw new Error("Bad response");
      setItems((prev) => [...prev, ...j]);
      console.log(`[TxList] received ${j.length} txs (loaded=${from + j.length}/${total})`);
    } catch (e: any) {
      console.error(`[TxList] error loading txs:`, e);
      setError(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && items.length === 0) { console.log(`[TxList] expanded for block ${hash}`); void loadMore(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => items.filter(i => !q || i.id.includes(q)), [items, q]);

  return (
    <div className="panel p-0">
      <div className="p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[13px] tracking-wide text-[var(--muted-2)]">Transactions</div>
          <div className="text-sm text-[var(--muted)]">{total.toLocaleString()} total</div>
        </div>
        <button className="btn text-sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide list" : "Show list"}
        </button>
      </div>

      {open && (
        <div className="reveal show">
          <div className="sticky-sub px-4 py-2 flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search txid"
              className="w-[360px] rounded-md border border-white/10 bg-[var(--surface)] px-3 py-1.5 text-sm outline-none focus-visible:outline-[var(--ring)] placeholder:text-[var(--muted-3)]"
            />
            <div className="ml-auto text-xs text-[var(--muted)]">{filtered.length} loaded</div>
          </div>

          <div className="p-4 space-y-2">
            {items.length === 0 && loading && (
              <div className="text-sm text-[var(--muted)] flex items-center gap-2"><span className="spinner" /> Loading transactions…</div>
            )}
            {error && <div className="text-[var(--danger)] text-sm">{error}</div>}
            {filtered.map((t) => {
              const vb = Math.max(1, Math.round(t.weight / 4));
              const rate = t.fee != null ? (t.fee / vb) : null;
              return (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-white/10 bg-[var(--surface)] px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-mono text-sm truncate pr-2">
                      <Link className="hover:underline" href={`/tx/${t.id}`}>{t.id}</Link>
                    </div>
                    <CopyToClipboard text={t.id} ariaLabel="Copy txid" />
                  </div>
                  <div className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {t.fee != null ? `${t.fee} sat · ${rate!.toFixed(2)} sat/vB` : "—"} · {vb} vB · {t.weight.toLocaleString()} WU
                  </div>
                </div>
              );
            })}
            {items.length < total && (
              <div>
                <button className="btn text-sm" disabled={loading} onClick={loadMore}>
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
