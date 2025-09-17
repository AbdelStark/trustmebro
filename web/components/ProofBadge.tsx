"use client";
/**
 * What this file does
 * Renders a mock ZK proof status badge.
 */
import { CheckCircle2, Clock3, XCircle, MinusCircle } from "lucide-react";

export type ProofStatus = "verified" | "pending" | "invalid" | "unavailable";

export function ProofBadge({ status }: { status: ProofStatus }) {
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
  } as const;

  const s = map[status];
  return (
    <span className="badge text-xs">
      {s.icon}
      <span>{s.label}</span>
    </span>
  );
}
