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
      const { getClientRaitoSdk } = await import("@/lib/raito/client");
      const sdk = await getClientRaitoSdk();
      const t0 = Date.now();
      const tx = await sdk.verifyTransaction(txid);
      const dt = Date.now() - t0;
      const ok = !!tx;
      setResult({ ok, details: ok ? `Verified in ${dt}ms` : `Invalid (${dt}ms)` });
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
