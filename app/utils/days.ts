/** Fill a per-day series so every day in the range appears (missing days = 0). */
export function fillDays<T extends { day: string }>(rows: T[], days: number, keys: (keyof T)[]) {
  const map = new Map(rows.map(r => [String(r.day).slice(0, 10), r]))
  const out: { label: string, values: Record<string, number> }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const row: any = map.get(key) || {}
    out.push({ label: d.toLocaleDateString([], { day: 'numeric', month: 'short' }), values: Object.fromEntries(keys.map(k => [k, Number(row[k] || 0)])) })
  }
  return out
}
