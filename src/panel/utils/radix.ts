// 进制转换：支持 2 / 8 / 10 / 16 进制，任意精度（BigInt）

export type RadixBase = 2 | 8 | 10 | 16

export interface RadixField {
  base: RadixBase
  label: string
  prefix: string
}

export const RADIX_FIELDS: RadixField[] = [
  { base: 2, label: '二进制 Binary', prefix: '0b' },
  { base: 8, label: '八进制 Octal', prefix: '0o' },
  { base: 10, label: '十进制 Decimal', prefix: '' },
  { base: 16, label: '十六进制 Hex', prefix: '0x' },
]

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

// 按指定进制解析字符串为 BigInt
export function parseBig(str: string, base: RadixBase): bigint {
  let s = str.trim().toLowerCase()
  if (!s) throw new Error('输入为空')

  let neg = false
  if (s.startsWith('-')) {
    neg = true
    s = s.slice(1)
  } else if (s.startsWith('+')) {
    s = s.slice(1)
  }

  // 去除前缀
  if (base === 16 && s.startsWith('0x')) s = s.slice(2)
  else if (base === 2 && s.startsWith('0b')) s = s.slice(2)
  else if (base === 8 && s.startsWith('0o')) s = s.slice(2)

  if (!s) throw new Error('输入为空')

  // 处理小数部分？暂不支持，遇 '.' 报错
  if (s.includes('.')) throw new Error('暂不支持小数')

  let result = 0n
  const b = BigInt(base)
  for (const ch of s) {
    const v = DIGITS.indexOf(ch)
    if (v < 0 || v >= base) {
      throw new Error(`非法字符 '${ch}'（基数 ${base}）`)
    }
    result = result * b + BigInt(v)
  }
  return neg ? -result : result
}

// 将 BigInt 格式化为指定进制字符串
export function formatBig(value: bigint, base: RadixBase): string {
  const neg = value < 0n
  let v = neg ? -value : value
  if (v === 0n) return formatPrefix(base) + '0'

  let out = ''
  const b = BigInt(base)
  while (v > 0n) {
    out = DIGITS[Number(v % b)] + out
    v = v / b
  }
  return (neg ? '-' : '') + formatPrefix(base) + out
}

function formatPrefix(base: RadixBase): string {
  if (base === 16) return '0x'
  if (base === 2) return '0b'
  if (base === 8) return '0o'
  return ''
}
