"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getRaitoSdk } from "@/lib/raito/sdk";

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export default function ProvenHeightBadge() {
  const router = useRouter();
  const [navLoading, setNavLoading] = React.useState(false);

  const { data: height, status, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["raito", "provenHeight"],
    queryFn: async () => {
      // Try client-side first via SDK (preferred); fallback to server route on CORS.
      try {
        console.log("[ProvenHeight] client SDK: start fetchRecentProvenHeight()");
        const sdk = await getRaitoSdk();
        const n = await sdk.fetchRecentProvenHeight();
        console.log("[ProvenHeight] client SDK: success height=", n);
        return n;
      } catch (_) {
        console.warn("[ProvenHeight] client SDK failed, falling back to server route");
        const r = await fetch("/api/raito/proven-height", { cache: "no-store" });
        if (!r.ok) throw new Error("api");
        const j = (await r.json()) as { height?: number };
        if (!j.height && j.height !== 0) throw new Error("bad-response");
        console.log("[ProvenHeight] server route: success height=", j.height);
        return j.height;
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  function since(updatedAt: number | undefined) {
    if (!updatedAt) return "just now";
    const secs = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  }

  const onGoLatest = async () => {
    if (!height) return;
    try {
      setNavLoading(true);
      const r = await fetch(`/api/mempool/block-hash-by-height?height=${height}`, { cache: "no-store" });
      if (!r.ok) throw new Error("upstream");
      const { id } = (await r.json()) as { id: string };
      router.push(`/block/${id}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Go to latest proven block failed", e);
    } finally {
      setNavLoading(false);
    }
  };

  const loading = status === "pending" || isFetching;
  const error = status === "error";
  const ok = status === "success" && typeof height === "number";
  const updatedText = loading ? "Updating…" : ok ? `Updated ${since(dataUpdatedAt)}` : error ? "Failed" : "";

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div
        className="badge"
        title={
          ok
            ? `Latest Raito proven height • updated ${since(dataUpdatedAt)}`
            : error
            ? "Failed to fetch Raito proven height"
            : "Fetching Raito proven height"
        }
        role="status"
      >
        {loading ? (
          <span className="spinner" aria-hidden />
        ) : (
          <span className={`dot ${ok ? "success" : error ? "error" : "muted"}`} aria-hidden />
        )}
        <span className="label hidden md:inline">Proven height</span>
        <span className="mono">{ok ? formatNumber(height!) : loading ? "…" : "—"}</span>
      </div>
      {updatedText && (
        <span className="label hidden lg:inline whitespace-nowrap text-[var(--muted-3)]">• {updatedText}</span>
      )}
      <button
        className="btn"
        onClick={onGoLatest}
        disabled={!ok || navLoading}
        title="Jump to latest proven block"
      >
        {navLoading ? <span className="spinner" aria-hidden /> : null}
        <span className="sm:hidden">Go</span>
        <span className="hidden sm:inline">Go to latest</span>
      </button>
    </div>
  );
}
