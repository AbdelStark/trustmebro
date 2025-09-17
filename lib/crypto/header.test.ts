import { describe, it, expect } from 'vitest'
import { serializeHeader, doubleSha256, bytesToHex, hexToBytes, cmp256 } from './header'
import { createHash } from 'node:crypto'

describe('serializeHeader', () => {
  it('serializes 80 bytes with correct field order and endianness', () => {
    const version = 0x01020304
    const timestamp = 0x0a0b0c0d
    const bits = 0x1d00ffff
    const nonce = 0x11223344
    const prev = bytesSeq(0x00, 32) // 00..1f
    const merkle = bytesSeq(0x20, 32) // 20..3f
    const hdr = serializeHeader({
      version,
      previousblockhash: bytesToHex(prev),
      merkle_root: bytesToHex(merkle),
      timestamp,
      bits,
      nonce,
    })

    expect(hdr.length).toBe(80)
    // Little-endian numeric fields
    const dv = new DataView(hdr.buffer)
    expect(dv.getUint32(0, true)).toBe(version >>> 0)
    expect(dv.getUint32(68, true)).toBe(timestamp >>> 0)
    expect(dv.getUint32(72, true)).toBe(bits >>> 0)
    expect(dv.getUint32(76, true)).toBe(nonce >>> 0)
    // 32-byte reversed hashes
    const prevSer = hdr.slice(4, 36)
    const merkleSer = hdr.slice(36, 68)
    expect(Array.from(prevSer)).toEqual(Array.from(prev).reverse())
    expect(Array.from(merkleSer)).toEqual(Array.from(merkle).reverse())
  })
})

describe('doubleSha256', () => {
  it('matches node crypto double sha256 for arbitrary bytes', async () => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 5])
    const ours = await doubleSha256(data)
    const once = createHash('sha256').update(Buffer.from(data)).digest()
    const twice = createHash('sha256').update(once).digest()
    expect(bytesToHex(ours)).toEqual(twice.toString('hex'))
  })
})

function bytesSeq(start: number, length: number) {
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i++) out[i] = (start + i) & 0xff
  return out
}

