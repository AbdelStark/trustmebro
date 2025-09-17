"use client";
/**
 * What this file does
 * Client-side local verification for a transaction: recompute txid from raw hex and compare.
 */
import { useState } from "react";
import { bytesToHex } from "@/lib/crypto/header";

async function sha256d(data: Uint8Array) {
  const a = new Uint8Array(await crypto.subtle.digest("SHA-256", data.buffer as unknown as BufferSource));
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", a.buffer as unknown as BufferSource));
  return b;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

export function VerifyTxButton({ txid }: { txid: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; details: string }>(null);

  async function run() {
    setBusy(true); setResult(null);
    try {
      const r = await fetch(`/api/mempool/tx-hex?txid=${txid}`);
      const hex = (await r.text()).trim();
      if (!hex || hex.length < 2) throw new Error("Empty raw hex");
      const raw = hexToBytes(hex);
      const h = await sha256d(raw);
      const recomputed = bytesToHex(Uint8Array.from(h).reverse());
      const ok = recomputed === txid;
      setResult({ ok, details: ok ? "Txid matches raw" : "Txid mismatch" });
    } catch (e: any) {
      setResult({ ok: false, details: e?.message || "Verification failed" });
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-3">
      <button className="btn text-sm" onClick={run} disabled={busy}>{busy ? (<span className="flex items-center gap-2"><span className="spinner" /> Verifying…</span>) : "Verify locally"}</button>
      {result && (
        <span className={`text-sm ${result.ok ? "text-[var(--success)]" : "text-[var(--danger)]"} ${result.ok ? 'pulse-success' : ''}`}>{result.details}</span>
      )}
    </div>
  );
}
