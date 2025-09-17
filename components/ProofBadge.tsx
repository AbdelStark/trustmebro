"use client";
/**
 * What this file does
 * Renders a mock ZK proof status badge.
 */
import { CheckCircle2, Clock3, XCircle, MinusCircle } from "lucide-react";

export type ProofStatus = "verified" | "pending" | "invalid" | "unavailable" | "error";

export function ProofBadge({ status, iconOnly = false }: { status: ProofStatus; iconOnly?: boolean }) {
  const map = {
    verified: {
      icon: <CheckCircle2 size={16} className="text-[var(--success)]" />,
      label: "ZK verified",
    },
    pending: {
      icon: <Clock3 size={16} className="text-[var(--warning)]" />,
      label: "ZK proof pending",
    },
    invalid: {
      icon: <XCircle size={16} className="text-[var(--danger)]" />,
      label: "ZK proof invalid",
    },
    unavailable: {
      icon: <MinusCircle size={16} className="text-[var(--muted)]" />,
      label: "No ZK proof yet",
    },
    error: {
      icon: <MinusCircle size={16} className="text-[var(--error)]" />,
      label: "Verification error",
    },
  } as const;

  const s = map[status];
  return (
    <span className="badge text-xs group relative">
      {s.icon}
      {!iconOnly && <span>{s.label}</span>}
      {iconOnly && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap rounded bg-[var(--panel)] text-[var(--muted-2)] px-2 py-1 text-xs shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
          {s.label}
        </span>
      )}
    </span>
  );
}
