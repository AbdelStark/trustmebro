/**
 * What this file does
 * Simple label/value pair component.
 */
export function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-mono">{children}</span>
    </div>
  );
}

