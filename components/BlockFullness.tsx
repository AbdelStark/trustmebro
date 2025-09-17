/**
 * What this file does
 * Visualizes block fullness as a progress meter based on weight/4,000,000 WU.
 */
export function BlockFullness({ weight }: { weight: number }) {
  const cap = 4_000_000; // consensus block weight limit in WU
  const pct = Math.max(0, Math.min(1, weight / cap));
  const percentStr = `${Math.round(pct * 100)}%`;
  return (
    <div className="select-none" title={`~${percentStr} full · ${weight.toLocaleString()} WU / 4,000,000 WU`}>
      <div className="meter" style={{ ['--p' as any]: percentStr }}>
        <span />
      </div>
      <div className="mt-1 text-xs text-[var(--muted-2)]">{percentStr} full</div>
    </div>
  );
}

