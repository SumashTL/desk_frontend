/** Small display helpers (auto-imported). */
const rtf = typeof Intl !== 'undefined' ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null
let regionNames: Intl.DisplayNames | null = null
try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }) } catch {}

export function timeAgo(value?: string | Date | null, short = false): string {
  if (!value) return ''
  const date = new Date(value)
  const diff = (date.getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 45) return short ? 'now' : 'just now'
  const steps: [number, Intl.RelativeTimeFormatUnit, string][] = [
    [60, 'second', 's'], [3600, 'minute', 'm'], [86400, 'hour', 'h'], [604800, 'day', 'd'],
    [2629800, 'week', 'w'], [31557600, 'month', 'mo'], [Infinity, 'year', 'y'],
  ]
  const units: Record<string, number> = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 }
  for (const [limit, unit, s] of steps) {
    if (abs < limit) {
      const n = Math.round(diff / units[unit]!)
      return short ? `${Math.abs(n)}${s}` : (rtf ? rtf.format(n, unit) : `${Math.abs(n)} ${unit}s ago`)
    }
  }
  return date.toLocaleDateString()
}

export function chatTime(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (now.getTime() - d.getTime() < 6 * 86400000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export function dayLabel(value: string): string {
  const d = new Date(value)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Today'
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' })
}

export function dateTime(value?: string | null, withTime = true): string {
  if (!value) return '—'
  const d = new Date(value)
  return withTime
    ? d.toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export function clock(value?: string | null): string {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}

export function duration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return m ? `${h}h ${m}m` : `${h}h`
}

export function initials(name?: string | null): string {
  const parts = (name || '?').replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return ((parts[0]![0] || '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase()
}

export function countryName(code?: string | null): string {
  if (!code) return ''
  try { return regionNames?.of(code.toUpperCase()) || code } catch { return code }
}

export function flag(code?: string | null): string {
  if (!code || code.length !== 2) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
}

export function num(value?: number | null): string {
  return value === null || value === undefined ? '—' : new Intl.NumberFormat().format(value)
}

export function pct(value?: number | null): string {
  return value === null || value === undefined ? '—' : `${value}%`
}

export function fileSize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/** Stable pleasant colour from any string (for avatars without photos). */
export function hue(seed?: string | number | null): number {
  const s = String(seed ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

export function toLocalInput(value?: string | Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value?: string | null): string | null {
  return value ? new Date(value).toISOString() : null
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable'))
}

export const STATUS_LABEL: Record<string, string> = { open: 'Open', pending: 'Pending', closed: 'Resolved' }
export const PRIORITY_LABEL: Record<string, string> = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

/** "8801712345678" / "+8801712345678" → "+880 1712-345678"; other countries get light grouping. */
export function phoneNumber(value?: string | null): string {
  if (!value) return ''
  const d = value.replace(/\D/g, '')
  if (!d) return value
  if (d.startsWith('880') && d.length === 13) return `+880 ${d.slice(3, 7)}-${d.slice(7)}`
  if (d.length > 10) return `+${d.slice(0, d.length - 10)} ${d.slice(-10, -7)} ${d.slice(-7, -4)} ${d.slice(-4)}`
  return `+${d}`
}
