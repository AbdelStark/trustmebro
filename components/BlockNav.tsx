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
      {nextId ? (
        <Link href={`/block/${nextId}`} className="btn" title={`Next block (#${height + 1})`}>
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button className="btn" disabled title="No next block yet">
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );

  if (variant === "sticky") {
    return (
      <div className="sticky top-20 z-20 flex justify-end">
        <div className="panel px-2 py-2 flex items-center gap-2 bg-[var(--panel)]/85 backdrop-blur-md">
          {group}
          <span className="label hidden md:inline text-[var(--muted-3)]">Use ← / →</span>
        </div>
      </div>
    );
  }

  return group;
}

