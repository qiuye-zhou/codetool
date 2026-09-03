// 编解码工具函数集合：Base64 / URL / Unicode / HTML 实体 / Hex
// 所有 decode 函数在输入非法时抛出 Error，由界面捕获并提示

/* ---------------- Base64 ---------------- */
export function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  // 每次处理 0x8000 字节，避免 fromCharCode 参数过多
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)),
    )
  }
  return btoa(bin)
}

export function base64Decode(str: string): string {
  const cleaned = str.replace(/\s+/g, '')
  let bin: string
  try {
    bin = atob(cleaned)
  } catch {
    throw new Error('无效的 Base64 字符串')
  }
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  // 宽松解码：即使存在非法 UTF-8 字节也不报错
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

/* ---------------- URL ---------------- */
export function urlEncode(str: string): string {
  return encodeURIComponent(str)
}

export function urlDecode(str: string): string {
  // 先尝试把 + 还原为空格（application/x-www-form-urlencoded 习惯）
  const input = str.includes('+') ? str.replace(/\+/g, ' ') : str
  try {
    return decodeURIComponent(input)
  } catch {
    // 兜底：用 unescape 处理裸 % 序列
    try {
      // eslint-disable-next-line no-deprecated
      return decodeURIComponent(unescape(input))
    } catch {
      throw new Error('无效的 URL 编码字符串')
    }
  }
}

/* ---------------- Unicode（\uXXXX / \u{...}） ---------------- */
export function unicodeEncode(str: string): string {
  let out = ''
  for (const ch of str) {
    const cp = ch.codePointAt(0)!
    if (cp <= 0xffff) {
      out += `\\u${cp.toString(16).padStart(4, '0')}`
    } else {
      // 星形面：拆成代理对
      const high = 0xd800 + ((cp - 0x10000) >> 10)
      const low = 0xdc00 + ((cp - 0x10000) & 0x3ff)
      out += `\\u${high.toString(16).padStart(4, '0')}`
      out += `\\u${low.toString(16).padStart(4, '0')}`
    }
  }
  return out
}

export function unicodeDecode(str: string): string {
  let result = ''
  let last = 0
  const re =
    /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\([0-7]{1,3})/g
  let m: RegExpExecArray | null
  while ((m = re.exec(str)) !== null) {
    result += str.slice(last, m.index)
    let cp: number
    if (m[1] != null) {
      cp = parseInt(m[1], 16)
    } else if (m[2] != null) {
      cp = parseInt(m[2], 16)
    } else if (m[3] != null) {
      cp = parseInt(m[3], 16)
    } else if (m[4] != null) {
      cp = parseInt(m[4], 8)
    } else {
      // 理论上不会走到这里，但为了类型安全
      continue
    }
    result += String.fromCodePoint(cp)
    last = re.lastIndex
  }
  result += str.slice(last)
  if (result === '' && str.trim() !== '') {
    return str
  }
  return result
}

/* ---------------- HTML 实体 ---------------- */
const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#47;',
  '`': '&#96;',
  '=': '&#61;',
}

export type HtmlEncodeMode = 'named' | 'numeric'

export function htmlEncode(str: string, mode: HtmlEncodeMode = 'named'): string {
  let out = ''
  for (const ch of str) {
    if (mode === 'numeric') {
      const cp = ch.codePointAt(0)!
      if (cp < 0x80 && /[a-zA-Z0-9]/.test(ch)) {
        out += ch
      } else {
        out += `&#${cp};`
      }
    } else {
      out += NAMED_ENTITIES[ch] ?? ch
    }
  }
  return out
}

export function htmlDecode(str: string): string {
  // 使用浏览器原生实体解析（textarea 不执行脚本，安全）
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

/* ---------------- Hex（文本 <-> 十六进制） ---------------- */
export function hexEncode(
  str: string,
  separator: '' | ' ' | '0x' = ' ',
): string {
  const bytes = new TextEncoder().encode(str)
  const parts: string[] = []
  for (const b of bytes) {
    const h = b.toString(16).padStart(2, '0')
    parts.push(separator === '0x' ? `0x${h}` : h)
  }
  return parts.join(separator === ' ' ? ' ' : separator === '0x' ? ' ' : '')
}

export function hexDecode(str: string): string {
  // 去除 0x 前缀、空格、换行、逗号等分隔符
  const cleaned = str.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '')
  if (cleaned.length % 2 !== 0) {
    throw new Error('十六进制长度必须为偶数')
  }
  if (cleaned.length === 0) return ''
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16)
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}
