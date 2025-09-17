/**
 * What this file does
 * Formatting helpers for sats/bytes/time and hex truncation/copy labels.
 */

export function truncateHex(hex: string, left = 10, right = 8) {
  if (hex.length <= left + right + 3) return hex;
  return `${hex.slice(0, left)}…${hex.slice(-right)}`;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} kB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatWu(weight: number) {
  if (weight >= 1_000_000) return `${(weight / 1_000_000).toFixed(2)} MWU`;
  if (weight >= 1_000) return `${(weight / 1_000).toFixed(2)} kWU`;
  return `${weight.toLocaleString()} WU`;
}

export function timeAgo(tsSec: number) {
  const now = Date.now();
  const then = tsSec * 1000;
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}
