"use client";
/**
 * What this file does
 * Provides a lazily-initialized Raito SPV SDK instance for client-side usage.
 */
import type { RaitoSpvSdk } from "@starkware-bitcoin/spv-verify";

let sdkPromise: Promise<RaitoSpvSdk> | null = null;

export async function getRaitoSdk() {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const { createRaitoSpvSdk } = await import("@starkware-bitcoin/spv-verify");
      const sdk = createRaitoSpvSdk();
      console.log("[RaitoSDK/client] init: starting…");
      await sdk.init();
      console.log("[RaitoSDK/client] init: ready ✅");
      return sdk as RaitoSpvSdk;
    })();
  }
  return sdkPromise;
}

