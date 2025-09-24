"use client";
/**
 * What this file does
 * Client-side proof status for a tx using Raito SDK.
 */
import { useEffect, useState } from "react";
import { ProofBadge, type ProofStatus } from "./ProofBadge";
import { getClientRaitoSdk } from "@/lib/raito/client";

export function TxProofBadge({ txid, iconOnly = false }: { txid: string; iconOnly?: boolean }) {
  const [status, setStatus] = useState<ProofStatus>("pending");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const short = txid.slice(0, 8);
        const sdk = await getClientRaitoSdk();
        const t0 = Date.now();
        const tx = await sdk.verifyTransaction(txid);
        const t1 = Date.now();
        console.log(`[RaitoSDK/client][tx ${short}] verifyTransaction: ok in ${t1 - t0}ms`);
        if (!alive) return;
        setStatus(tx ? "verified" : "invalid");
      } catch (e) {
        console.error(`[RaitoSDK/client] error`, e, alive);
        if (alive) {
          if (e instanceof Error && typeof e.message === "string" && e.message.includes("fetchProof failed: 500")) {
            setStatus("unavailable");
          } else {
            setStatus("error");
          }
        }
      }
    })();
    return () => { alive = false; };
  }, [txid]);

  return <ProofBadge status={status} iconOnly={iconOnly} />;
}

