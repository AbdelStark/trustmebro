/**
 * What this file does
 * Bitcoin header serialization, doubleSHA256, bits->target conversion, and comparison helpers.
 */

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("hex length must be even");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function writeUint32LE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function reverse32(bytes: Uint8Array) {
  // Reverse 32-byte array (for hash endianness conversions)
  return Uint8Array.from([...bytes].reverse());
}

/** Serialize the 80-byte header from fields. */
export function serializeHeader(params: {
  version: number;
  previousblockhash: string; // hex big-endian
  merkle_root: string; // hex big-endian
  timestamp: number; // seconds
  bits: number;
  nonce: number;
}): Uint8Array {
  const buf = new ArrayBuffer(80);
  const view = new DataView(buf);
  const out = new Uint8Array(buf);

  writeUint32LE(view, 0, params.version);
  out.set(reverse32(hexToBytes(params.previousblockhash!)), 4);
  out.set(reverse32(hexToBytes(params.merkle_root)), 36);
  writeUint32LE(view, 68, params.timestamp);
  writeUint32LE(view, 72, params.bits);
  writeUint32LE(view, 76, params.nonce);
  return out;
}

/** Double SHA-256 using Web Crypto. */
export async function doubleSha256(data: Uint8Array): Promise<Uint8Array> {
  const first = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  const second = await crypto.subtle.digest("SHA-256", new Uint8Array(first));
  return new Uint8Array(second);
}

/** Convert compact bits to 256-bit target (big-endian Uint8Array length 32). */
export function bitsToTarget(bits: number): Uint8Array {
  const exponent = (bits >>> 24) & 0xff;
  const mantissa = bits & 0x007fffff; // 3 bytes
  const target = new Uint8Array(32);
  const bn: number[] = [];
  // Construct mantissa as 3 bytes big-endian
  bn.push((mantissa >>> 16) & 0xff, (mantissa >>> 8) & 0xff, mantissa & 0xff);
  const zeros = exponent - 3; // number of zero bytes appended
  const totalLen = zeros + bn.length;
  const start = 32 - totalLen;
  for (let i = 0; i < bn.length; i++) target[start + i] = bn[i];
  // zeros are already 0
  return target;
}

/** Compare two 256-bit big-endian numbers: returns -1, 0, 1 */
export function cmp256(a: Uint8Array, b: Uint8Array): number {
  for (let i = 0; i < 32; i++) {
    const d = a[i] - b[i];
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
