"use client";

import { createRaitoSpvSdk, RaitoSpvSdk, VerifierConfig } from "@starkware-bitcoin/spv-verify";

const DEFAULT_RPC_URL = "https://api.raito.wtf";
const DEFAULT_CONFIG: Partial<VerifierConfig> = { min_work: "0" };

let sdkPromise: Promise<RaitoSpvSdk> | null = null;

async function initClientSdk(rpcUrl: string, config?: Partial<VerifierConfig>): Promise<RaitoSpvSdk> {
  const sdk = createRaitoSpvSdk(rpcUrl, { ...DEFAULT_CONFIG, ...(config || {}) });
  await sdk.init();
  return sdk;
}

type GetClientOptions = {
  rpcUrl?: string;
  config?: Partial<VerifierConfig>;
  fresh?: boolean;
};

export function getClientRaitoSdk(options?: GetClientOptions): Promise<RaitoSpvSdk> {
  const rpcUrl = options?.rpcUrl ?? DEFAULT_RPC_URL;
  const config = options?.config;

  if (options?.fresh) {
    return initClientSdk(rpcUrl, config);
  }

  if (!sdkPromise) {
    sdkPromise = initClientSdk(rpcUrl, config);
  }

  return sdkPromise;
}

export { DEFAULT_CONFIG as raitoDefaultConfig, DEFAULT_RPC_URL as raitoDefaultRpcUrl };

