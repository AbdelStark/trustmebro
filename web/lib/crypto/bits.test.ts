import { describe, it, expect } from 'vitest'
import { bitsToTarget, bytesToHex } from './header'

function bitsToTargetBigInt(bits: number): Uint8Array {
  const exp = (bits >>> 24) & 0xff
  const mant = BigInt(bits & 0x007fffff)
  const target = new Uint8Array(32)
  const shift = exp - 3
  let value = mant
  // write mantissa to big-endian buffer at the right offset
  const totalLen = shift + 3
  const start = 32 - totalLen
  for (let i = 0; i < 3; i++) {
    target[start + (2 - i)] = Number(value & 0xffn)
    value >>= 8n
  }
  return target
}

describe('bitsToTarget', () => {
  it('matches BigInt reference for common bits', () => {
    const cases = [0x1d00ffff, 0x1b0404cb, 0x1d00abcd, 0x1a0ffff0]
    for (const bits of cases) {
      const a = bitsToTarget(bits)
      const b = bitsToTargetBigInt(bits)
      expect(bytesToHex(a)).toEqual(bytesToHex(b))
    }
  })
})

