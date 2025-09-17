"use client";

import React from "react";
import { getRaitoSdk } from "@/lib/raito/sdk";
import { VerifierConfig } from "@starkware-bitcoin/spv-verify";

const config: Partial<VerifierConfig> = { min_work: "0" };

export default function InlineVerifyTx({ txid }: { txid: string }) {
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [ms, setMs] = React.useState<number | null>(null);
  const [visible, setVisible] = React.useState(false);

  async function run() {
    if (busy) return;
    setBusy(true); setOk(null); setMs(null); setVisible(false);
    try {
      const sdk = await getRaitoSdk();
      const t0 = performance.now();
      const proof = await sdk.fetchProof(txid);
      const valid = await sdk.verifyProof(proof, config);
      const dt = Math.round(performance.now() - t0);
      setOk(valid); setMs(dt); setVisible(true);
      // Auto hide result after a short delay
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setOk(false); setMs(null); setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <button className="btn text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={run} disabled={busy} title="Verify">
        {busy ? <span className="spinner" /> : <span>Verify</span>}
      </button>
      {visible && (
        <span className={`chip ${ok ? '' : 'text-[var(--danger)]'}`}>{ok ? 'Verified' : 'Invalid'}{ms != null ? ` • ${ms} ms` : ''}</span>
      )}
    </div>
  );
}

