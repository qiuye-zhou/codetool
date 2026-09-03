// Hash 计算：MD5 / SHA1 / SHA224 / SHA256 / SHA384 / SHA512
import CryptoJS from 'crypto-js'

export type HashAlgo =
  | 'MD5'
  | 'SHA1'
  | 'SHA224'
  | 'SHA256'
  | 'SHA384'
  | 'SHA512'

export interface HashAlgoInfo {
  algo: HashAlgo
  label: string
  bitLength: number
}

export const HASH_ALGOS: HashAlgoInfo[] = [
  { algo: 'MD5', label: 'MD5', bitLength: 128 },
  { algo: 'SHA1', label: 'SHA1', bitLength: 160 },
  { algo: 'SHA224', label: 'SHA224', bitLength: 224 },
  { algo: 'SHA256', label: 'SHA256', bitLength: 256 },
  { algo: 'SHA384', label: 'SHA384', bitLength: 384 },
  { algo: 'SHA512', label: 'SHA512', bitLength: 512 },
]

export function hash(algo: HashAlgo, input: string): string {
  const fn = (CryptoJS as unknown as Record<string, (s: string) => CryptoJS.lib.WordArray>)[algo]
  if (typeof fn !== 'function') {
    throw new Error(`不支持的算法: ${algo}`)
  }
  // 默认按 UTF-8 编码输入
  const result = fn(input)
  return result.toString(CryptoJS.enc.Hex)
}

// 一次性计算所有算法
export function hashAll(input: string): Record<HashAlgo, string> {
  const out = {} as Record<HashAlgo, string>
  for (const { algo } of HASH_ALGOS) {
    try {
      out[algo] = hash(algo, input)
    } catch (e) {
      out[algo] = `错误: ${(e as Error).message}`
    }
  }
  return out
}
