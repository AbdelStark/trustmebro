import { describe, it, expect } from 'vitest'
import { bitsToTarget, bytesToHex } from './header'

function bitsToTargetRef(bits: number): Uint8Array {
  const exp = (bits >>> 24) & 0xff
  const mant = bits & 0x007fffff // 23-bit mantissa
  const target = new Uint8Array(32)
  const shift = exp - 3
  // write mantissa (3 bytes) to big-endian buffer at the right offset
  const totalLen = shift + 3
  const start = 32 - totalLen
  target[start + 0] = (mant >>> 16) & 0xff
  target[start + 1] = (mant >>> 8) & 0xff
  target[start + 2] = mant & 0xff
  return target
}

describe('bitsToTarget', () => {
  it('matches BigInt reference for common bits', () => {
    const cases = [0x1d00ffff, 0x1b0404cb, 0x1d00abcd, 0x1a0ffff0]
    for (const bits of cases) {
      const a = bitsToTarget(bits)
      const b = bitsToTargetRef(bits)
      expect(bytesToHex(a)).toEqual(bytesToHex(b))
    }
  })
})
