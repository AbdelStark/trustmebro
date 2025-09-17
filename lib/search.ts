/**
 * What this file does
 * Parse search input into either height (number) or block hash (64-hex).
 */

export function parseSearch(input: string): { type: "height"; value: number } | { type: "hash"; value: string } | null {
  const t = input.trim();
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    if (Number.isSafeInteger(n) && n >= 0) return { type: "height", value: n };
  }
  if (/^[0-9a-fA-F]{64}$/.test(t)) {
    return { type: "hash", value: t.toLowerCase() };
  }
  return null;
}

