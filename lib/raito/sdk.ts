"use client";
/**
 * What this file does
 * Provides a lazily-initialized client-only wrapper around the Raito SPV WASM (web build).
 * Avoids importing the Node build (which pulls `fs`) by using the explicit web export.
 */

type ClientSdk = {
  fetchProof(txid: string): Promise<string>;
  verifyProof(proof: string, config?: Partial<VerifierConfig>): Promise<boolean>;
  fetchRecentProvenHeight(): Promise<number>;
};

type VerifierConfig = {
  min_work: string;
  bootloader_hash: string;
  task_program_hash: string;
  task_output_size: number;
};

let sdkPromise: Promise<ClientSdk> | null = null;
// Simple in-memory proof cache per session
const proofCache = new Map<string, string>();
const proofPending = new Map<string, Promise<string>>();

export async function getRaitoSdk(): Promise<ClientSdk> {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      console.log("[RaitoSDK/client] init (web wasm): starting…");
      const wasm = (await import("@starkware-bitcoin/spv-verify/wasm/web")) as any;
      const start = wasm.default ?? wasm.__wbg_init;
      if (typeof start === "function") await start();
      if (typeof wasm.init === "function") await wasm.init();
      console.log("[RaitoSDK/client] init (web wasm): ready ✅");

      const defaults: VerifierConfig = {
        min_work: "1813388729421943762059264",
        bootloader_hash: "0x0001837d8b77b6368e0129ce3f65b5d63863cfab93c47865ee5cbe62922ab8f3",
        task_program_hash: "0x00f0876bb47895e8c4a6e7043829d7886e3b135e3ef30544fb688ef4e25663ca",
        task_output_size: 8,
      };

      const fetchProof = async (txid: string) => {
        const cached = proofCache.get(txid);
        if (cached) return cached;
        const inflight = proofPending.get(txid);
        if (inflight) return inflight;
        const p = (async () => {
          const url = `https://api.raito.wtf/compressed_spv_proof/${txid}`;
          const r = await fetch(url, { headers: { Accept: "text/plain" } });
          if (!r.ok) throw new Error(`fetchProof failed: ${r.status}`);
          const text = await r.text();
          proofCache.set(txid, text);
          proofPending.delete(txid);
          return text;
        })();
        proofPending.set(txid, p);
        return p;
      };

      const fetchRecentProvenHeight = async () => {
        if (typeof window === "undefined") throw new Error("client-only");
        console.log("[RaitoSDK/client] fetchRecentProvenHeight: dynamic import start");
        // eslint-disable-next-line no-eval
        const importer: (s: string) => Promise<any> = (0, eval)("import");
        const mod = await importer("@starkware-bitcoin/spv-verify");
        console.log("[RaitoSDK/client] fetchRecentProvenHeight: module loaded");
        const sdk = mod.createRaitoSpvSdk("https://api.raito.wtf");
        const n = await sdk.fetchRecentProvenHeight();
        console.log("[RaitoSDK/client] fetchRecentProvenHeight: success height=", n);
        return n;
      };

      const verifyProof = async (proof: string, config?: Partial<VerifierConfig>) => {
        const cfg = JSON.stringify({ ...defaults, ...(config || {}) });
        const f = wasm.verify_proof_with_config ?? wasm.verify_proof;
        if (typeof f !== "function") throw new Error("verify function not found");
        return !!(await f(proof, cfg));
      };

      const sdk: ClientSdk = { fetchProof, verifyProof, fetchRecentProvenHeight };
      return sdk;
    })();
  }
  return sdkPromise;
}
