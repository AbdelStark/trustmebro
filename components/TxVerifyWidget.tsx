"use client";

import React from "react";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { getClientRaitoSdk } from "@/lib/raito/client";

export default function TxVerifyWidget({ txid }: { txid: string }) {
  const [status, setStatus] = React.useState<ProofStatus>("unavailable");
  const [busy, setBusy] = React.useState(false);
  const [timeMs, setTimeMs] = React.useState<number | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setTimeMs(null);
    setStatus("pending");
    try {
      const sdk = await getClientRaitoSdk();
      const t0 = performance.now();
      const tx = await sdk.verifyTransaction(txid);
      const ok = !!tx;
      const dt = Math.round(performance.now() - t0);
      setStatus(ok ? "verified" : "invalid");
      setTimeMs(dt);
    } catch (e: any) {
      const msg = e?.message || "Verification failed";
      if (typeof msg === "string" && msg.includes("fetchProof failed: 500")) {
        setStatus("unavailable");
        setTimeMs(null);
      } else {
        setStatus("error");
        setTimeMs(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-start gap-1">
        <ProofBadge status={status} />
        {timeMs != null && (status === "verified" || status === "invalid") && (
          <span className="chip" title="Verification time">{timeMs} ms</span>
        )}
      </div>
      <button className="btn text-sm" onClick={run} disabled={busy} title="Verify">
        {busy ? (
          <span className="flex items-center gap-2"><span className="spinner" /> Verifying…</span>
        ) : (
          <span>Verify</span>
        )}
      </button>
    </div>
  );
}
