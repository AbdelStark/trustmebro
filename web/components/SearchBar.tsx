"use client";
/**
 * What this file does
 * Global search bar for height or block hash.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseSearch } from "@/lib/search";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = parseSearch(q);
    if (!parsed) {
      setErr("Enter height or 64-hex hash");
      return;
    }
    if (parsed.type === "hash") {
      router.push(`/block/${parsed.value}`);
    } else {
      const r = await fetch(`/api/mempool/block-hash-by-height?height=${parsed.value}`);
      const j = await r.json();
      if (!j.id) {
        setErr("Block not found");
        return;
      }
      router.push(`/block/${j.id}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search height or block hash"
        className="w-[320px] rounded-md border border-white/10 bg-[var(--surface)] px-3 py-1.5 outline-none ring-accent"
      />
      <button className="rounded-md border border-white/10 px-3 py-1.5 text-sm hover:border-[var(--accent-600)]">Search</button>
      {err && <span className="text-[var(--danger)] text-xs">{err}</span>}
    </form>
  );
}

