// 时间戳 / Date / Unix 时间互转

export type DetectedKind = 'unix-seconds' | 'unix-ms' | 'date' | 'unknown'

export interface TimeInfo {
  detected: DetectedKind
  date: Date | null
  unixSeconds: number | null
  unixMs: number | null
  iso: string | null
  local: string | null
  utc: string | null
  relative: string | null
  error?: string
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

// 本地时间字符串（不依赖 toLocaleString，保证一致格式）
function toLocalString(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

// 相对时间描述
export function relativeFromNow(d: Date): string {
  const diff = d.getTime() - Date.now()
  const abs = Math.abs(diff)
  const suffix = diff >= 0 ? '后' : '前'
  if (abs < 60_000) return `${Math.round(abs / 1000)} 秒${suffix}`
  if (abs < 3_600_000)
    return `${Math.floor(abs / 60_000)} 分 ${Math.round((abs % 60_000) / 1000)} 秒${suffix}`
  if (abs < 86_400_000) return `${Math.floor(abs / 3_600_000)} 小时${suffix}`
  return `${Math.floor(abs / 86_400_000)} 天${suffix}`
}

export function parseTimeInput(input: string): TimeInfo {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      detected: 'unknown',
      date: null,
      unixSeconds: null,
      unixMs: null,
      iso: null,
      local: null,
      utc: null,
      relative: null,
    }
  }

  let date: Date | null = null
  let detected: DetectedKind = 'unknown'

  // 纯数字 → 时间戳
  if (/^[+-]?\d+$/.test(trimmed)) {
    const num = Number(trimmed)
    const digits = trimmed.replace(/^[+-]/, '').length
    // 12 位及以上视为毫秒，否则视为秒
    const isMs = digits >= 12
    detected = isMs ? 'unix-ms' : 'unix-seconds'
    const ms = isMs ? num : num * 1000
    date = new Date(ms)
    if (isNaN(date.getTime())) {
      return {
        detected,
        date: null,
        unixSeconds: null,
        unixMs: null,
        iso: null,
        local: null,
        utc: null,
        relative: null,
        error: '数值超出可表示范围',
      }
    }
  } else {
    // 尝试解析为日期字符串
    const parsed = Date.parse(trimmed)
    if (!isNaN(parsed)) {
      date = new Date(parsed)
      detected = 'date'
    }
  }

  if (!date) {
    return {
      detected: 'unknown',
      date: null,
      unixSeconds: null,
      unixMs: null,
      iso: null,
      local: null,
      utc: null,
      relative: null,
      error: '无法识别的时间格式',
    }
  }

  const ms = date.getTime()
  return {
    detected,
    date,
    unixSeconds: Math.floor(ms / 1000),
    unixMs: ms,
    iso: date.toISOString(),
    local: toLocalString(date),
    utc: date.toUTCString(),
    relative: relativeFromNow(date),
  }
}

// 当前时间的快照信息（用于“获取当前时间”按钮）
export function nowSnapshot(): TimeInfo {
  const date = new Date()
  const ms = date.getTime()
  return {
    detected: 'date',
    date,
    unixSeconds: Math.floor(ms / 1000),
    unixMs: ms,
    iso: date.toISOString(),
    local: toLocalString(date),
    utc: date.toUTCString(),
    relative: '现在',
  }
}
