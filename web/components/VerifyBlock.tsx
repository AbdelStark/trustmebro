"use client";
/**
 * What this file does
 * Client-side local verification for a block header. Computes hash & PoW target.
 */
import { useState } from "react";
import { serializeHeader, doubleSha256, bitsToTarget, cmp256, bytesToHex } from "@/lib/crypto/header";

export function VerifyBlockButton({ header }: { header: any }) {
  const [result, setResult] = useState<null | { ok: boolean; details: string }>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    try {
      setBusy(true); setResult(null);
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
      const powOk = cmp256(Uint8Array.from(h), target) < 0;
      const ok = matches && powOk;
      setResult({ ok, details: ok ? "Header hash matches and PoW target satisfied" : (matches ? "Hash matches but PoW not satisfied" : "Hash mismatch") });
    } catch (e: any) {
      setResult({ ok: false, details: e?.message || "Verification failed" });
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-3">
      <button className="btn text-sm" onClick={run} disabled={busy}>{busy ? "Verifying…" : "Verify locally"}</button>
      {result && (
        <span className={`text-sm ${result.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{result.details}</span>
      )}
    </div>
  );
}

