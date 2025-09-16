/**
 * What this file does
 * Server component for UTC time and client label for time ago.
 */
import { timeAgo } from "@/lib/formatters";

export function TimeAgo({ ts }: { ts: number }) {
  return (
    <span title={new Date(ts * 1000).toISOString()} className="text-[var(--muted)]">
      {timeAgo(ts)}
    </span>
  );
}

