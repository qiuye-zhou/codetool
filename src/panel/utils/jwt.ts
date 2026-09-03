// JWT 解析：仅解码 header / payload，不验证签名

export interface JwtPart {
  raw: string
  json: string
  parsed: unknown
  error?: string
}

export interface JwtDecoded {
  header: JwtPart
  payload: JwtPart
  signature: string
  signatureHex: string
  errors: string[]
}

// base64url 解码为 Uint8Array
function base64UrlToBytes(str: string): Uint8Array {
  let s = str.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4 !== 0) s += '='
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  let out = ''
  for (const b of bytes) out += b.toString(16).padStart(2, '0')
  return out
}

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}

export function decodeJwt(token: string): JwtDecoded {
  const errors: string[] = []
  const parts = token.trim().split('.')
  if (parts.length < 2) {
    throw new Error('JWT 至少需要 header.payload 两段（以 . 分隔）')
  }

  const parsePart = (raw: string, name: string): JwtPart => {
    if (!raw) return { raw, json: '', parsed: null, error: '空' }
    try {
      const bytes = base64UrlToBytes(raw)
      const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
      try {
        const parsed = JSON.parse(text)
        return { raw, json: prettyJson(parsed), parsed }
      } catch {
        return { raw, json: text, parsed: text, error: '不是合法 JSON' }
      }
    } catch {
      return { raw, json: '', parsed: null, error: `${name} 解码失败` }
    }
  }

  const header = parsePart(parts[0] ?? '', 'header')
  const payload = parsePart(parts[1] ?? '', 'payload')

  let signature = ''
  let signatureHex = ''
  if (parts[2]) {
    try {
      const bytes = base64UrlToBytes(parts[2])
      signatureHex = bytesToHex(bytes)
      // 签名通常是二进制，显示为 hex
      signature = signatureHex
    } catch {
      signature = parts[2]
      signatureHex = ''
      errors.push('签名段解码失败')
    }
  }

  return { header, payload, signature, signatureHex, errors }
}

// 根据时间戳判断是否过期
export function getJwtExpiry(payload: unknown): {
  exp?: number
  nbf?: number
  iat?: number
  status: string
} {
  if (!payload || typeof payload !== 'object') return { status: '未知' }
  const p = payload as Record<string, unknown>
  const exp = typeof p.exp === 'number' ? p.exp : undefined
  const nbf = typeof p.nbf === 'number' ? p.nbf : undefined
  const iat = typeof p.iat === 'number' ? p.iat : undefined
  const now = Math.floor(Date.now() / 1000)
  let status = '无 exp 字段'
  if (exp != null) {
    if (exp < now) {
      const ago = formatDuration(now - exp)
      status = `已过期（${ago}）`
    } else {
      const left = formatDuration(exp - now)
      status = `有效，剩余 ${left}`
    }
  }
  if (nbf != null && nbf > now) {
    status = `生效中，还有 ${formatDuration(nbf - now)} 生效`
  }
  return { exp, nbf, iat, status }
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} 秒`
  if (sec < 3600) return `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`
  if (sec < 86400) return `${Math.floor(sec / 3600)} 小时`
  return `${Math.floor(sec / 86400)} 天 ${Math.floor((sec % 86400) / 3600)} 小时`
}
