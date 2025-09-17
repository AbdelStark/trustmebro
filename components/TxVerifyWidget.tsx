"use client";

import React from "react";
import { ProofBadge, type ProofStatus } from "@/components/ProofBadge";
import { getRaitoSdk } from "@/lib/raito/sdk";
import { VerifierConfig } from "@starkware-bitcoin/spv-verify";

const config: Partial<VerifierConfig> = { min_work: "0" };

export default function TxVerifyWidget({ txid }: { txid: string }) {
  const [status, setStatus] = React.useState<ProofStatus>("unavailable");
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setStatus("pending");
    try {
      const sdk = await getRaitoSdk();
      const t0 = performance.now();
      const proof = await sdk.fetchProof(txid);
      setNote("Fetching proof…");
      const ok = await sdk.verifyProof(proof, config);
      const dt = Math.round(performance.now() - t0);
      setStatus(ok ? "verified" : "invalid");
      setNote(ok ? `Verified in ${dt}ms` : `Invalid (${dt}ms)`);
    } catch (e: any) {
      const msg = e?.message || "Verification failed";
      if (typeof msg === "string" && msg.includes("fetchProof failed: 500")) {
        setStatus("unavailable");
        setNote("Proof unavailable");
      } else {
        setStatus("error");
        setNote("Error verifying");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <ProofBadge status={status} />
      <button className="btn text-sm" onClick={run} disabled={busy} title="Verify">
        {busy ? (
          <span className="flex items-center gap-2"><span className="spinner" /> Verifying…</span>
        ) : (
          <span>Verify</span>
        )}
      </button>
      {note && (
        <span className={`text-sm ${status === "verified" ? "text-[var(--success)]" : status === "invalid" ? "text-[var(--danger)]" : "text-[var(--muted-2)]"} ${status === 'verified' ? 'pulse-success' : ''}`}>{note}</span>
      )}
    </div>
  );
}

