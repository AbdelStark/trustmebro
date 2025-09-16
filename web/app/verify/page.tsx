"use client";
import { useState } from "react";
import { parseSearch } from "@/lib/search";
import { serializeHeader, doubleSha256, bitsToTarget, cmp256 } from "@/lib/crypto/header";
import { bytesToHex } from "@/lib/crypto/header";

export default function VerifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | {
    id: string;
    recomputed: string;
    matches: boolean;
    powOk: boolean;
    targetHex: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const parsed = parseSearch(input);
    if (!parsed) {
      setError("Enter a height or 64-hex block hash");
      return;
    }
    try {
      let hash: string;
      if (parsed.type === "height") {
        const r = await fetch(`/api/mempool/block-hash-by-height?height=${parsed.value}`);
        const j = await r.json();
        hash = j.id;
      } else {
        hash = parsed.value;
      }

      const header = await fetch(`/api/mempool/block?hash=${hash}`).then((r) => r.json());
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
      setResult({ id: header.id, recomputed, matches, powOk, targetHex: bytesToHex(target) });
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Verify</h1>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          className="w-full max-w-xl rounded-md border border-white/10 bg-[var(--surface)] px-3 py-2 outline-none focus-visible:outline-[var(--ring)] font-mono"
          placeholder="Enter block height or hash"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="rounded-md border border-white/10 px-3 py-2 hover:border-[var(--accent-600)]">Run</button>
      </form>
      {error && <div className="text-[var(--danger)] text-sm">{error}</div>}
      {result && (
        <div className="panel p-4 space-y-1 text-sm">
          <div>Reported id: <span className="font-mono break-all">{result.id}</span></div>
          <div>Recomputed: <span className="font-mono break-all">{result.recomputed}</span></div>
          <div>Target: <span className="font-mono break-all">{result.targetHex}</span></div>
          <div className="pt-2">
            {result.matches ? (
              result.powOk ? (
                <span className="text-[var(--success)]">✅ Header hash matches & PoW target satisfied</span>
              ) : (
                <span className="text-[var(--warning)]">⚠️ Header hash matches but PoW target not satisfied</span>
              )
            ) : (
              <span className="text-[var(--danger)]">❌ Header hash mismatch</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

