"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  prevId: string | null;
  nextId: string | null;
  height: number;
  variant?: "inline" | "sticky";
};

export default function BlockNav({ prevId, nextId, height, variant = "inline" }: Props) {
  const router = useRouter();
  const [visible, setVisible] = React.useState(false);
  const [tipHeight, setTipHeight] = React.useState<number | null>(null);
  const [nextIdLocal, setNextIdLocal] = React.useState<string | null>(nextId ?? null);
  const [loadingNext, setLoadingNext] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or with modifiers
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e as any).isComposing) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === "ArrowLeft" && prevId) {
        e.preventDefault();
        router.push(`/block/${prevId}`);
      } else if (e.key === "ArrowRight" && nextId) {
        e.preventDefault();
        router.push(`/block/${nextId}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  // Sticky visibility based on scroll position
  React.useEffect(() => {
    if (variant !== "sticky") return;
    const onScroll = () => {
      setVisible(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Poll mempool tip height to know if a successor may appear
  React.useEffect(() => {
    let didCancel = false;
    async function tick() {
      try {
        const r = await fetch(`/api/mempool/tip-height`, { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { height: number };
        if (!didCancel) setTipHeight(j.height);
      } catch {}
    }
    tick();
    const id = setInterval(tick, 10_000);
    return () => {
      didCancel = true;
      clearInterval(id);
    };
  }, []);

  // When tip advances beyond this block, resolve the next block hash
  React.useEffect(() => {
    if (tipHeight !== null && tipHeight > height && !nextIdLocal && !loadingNext) {
      let ignore = false;
      (async () => {
        try {
          setLoadingNext(true);
          const r = await fetch(`/api/mempool/block-hash-by-height?height=${height + 1}`, { cache: "no-store" });
          if (!r.ok) return;
          const j = (await r.json()) as { id?: string };
          if (!ignore) setNextIdLocal(j.id || null);
        } finally {
          if (!ignore) setLoadingNext(false);
        }
      })();
      return () => {
        ignore = true;
      };
    }
  }, [tipHeight, height, nextIdLocal, loadingNext]);

  const resolvedNext = nextIdLocal ?? nextId ?? null;
  const disableNext = !resolvedNext && (tipHeight === null || tipHeight <= height);

  const group = (
    <div className="flex items-center gap-2" aria-label="Block navigation">
      {prevId ? (
        <Link href={`/block/${prevId}`} className="btn" title={`Previous block (#${height - 1})`}>
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Link>
      ) : (
        <button className="btn" disabled title="No previous block">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>
      )}
      {resolvedNext ? (
        <Link href={`/block/${resolvedNext}`} className="btn" title={`Next block (#${height + 1})`}>
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button className="btn" disabled={disableNext} title={disableNext ? "No next block yet" : "Resolving next block…"}>
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          {loadingNext ? <span className="spinner" aria-hidden /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>
  );

  if (variant === "sticky") {
    return (
      <div className="sticky top-20 z-20 flex justify-end">
        <div className={`panel px-2 py-2 flex items-center gap-2 bg-[var(--panel)]/85 backdrop-blur-md reveal ${visible ? "show" : ""}`}>
          {group}
          <span className="label hidden md:inline text-[var(--muted-3)]">Use ← / →</span>
        </div>
      </div>
    );
  }

  return group;
}
