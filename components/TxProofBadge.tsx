"use client";
/**
 * What this file does
 * Client-side proof status for a tx using Raito SDK.
 */
import { useEffect, useState } from "react";
import { ProofBadge, type ProofStatus } from "./ProofBadge";
import { getRaitoSdk } from "@/lib/raito/sdk";
import { VerifierConfig } from "@starkware-bitcoin/spv-verify";

const config: Partial<VerifierConfig> =  {
  min_work: "0",
};

export function TxProofBadge({ txid, iconOnly = false }: { txid: string; iconOnly?: boolean }) {
  const [status, setStatus] = useState<ProofStatus>("pending");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const short = txid.slice(0, 8);
        const sdk = await getRaitoSdk();
        console.log(`[RaitoSDK/client][tx ${short}] fetchProof: start`);
        const t0 = Date.now();
        const proof = await sdk.fetchProof(txid);
        const t1 = Date.now();
        console.log(`[RaitoSDK/client][tx ${short}] fetchProof: ok in ${t1 - t0}ms`);
        console.log(`[RaitoSDK/client][tx ${short}] verifyProof: start`);
        const ok = await sdk.verifyProof(proof, config);
        console.log(`[RaitoSDK/client][tx ${short}] verifyProof: ${ok ? "valid ✅" : "invalid ❌"}`);
        if (!alive) return;
        setStatus(ok ? "verified" : "invalid");
      } catch (e) {
        console.error(`[RaitoSDK/client] error`, e, alive);
        if (alive) setStatus("error");
      }
    })();
    return () => { alive = false; };
  }, [txid]);

  return <ProofBadge status={status} iconOnly={iconOnly} />;
}

