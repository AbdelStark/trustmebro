"use client";
/**
 * What this file does
 * Copy-to-clipboard button for hex strings.
 */
import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyToClipboard({ text, ariaLabel = "Copy" }: { text: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-white"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
    >
      <Copy size={14} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

