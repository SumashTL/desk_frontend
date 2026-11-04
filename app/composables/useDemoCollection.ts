import { onMounted, ref, watch } from 'vue'

export interface DemoRecord { id: string; [key: string]: unknown }

const cloneRows = <T>(rows: T[]): T[] => rows.map(row => ({ ...row }))

/** Browser-persisted CRUD collection for frontend-only demo modules. */
export function useDemoCollection<T extends DemoRecord>(key: string, seed: T[]) {
  const rows = ref<T[]>(cloneRows(seed))
  const ready = ref(false)
  const storageKey = `desk-demo:${key}`

  onMounted(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) rows.value = parsed as T[]
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
    ready.value = true
  })

  watch(rows, value => {
    if (ready.value) localStorage.setItem(storageKey, JSON.stringify(value))
  }, { deep: true })

  const add = (item: Omit<T, 'id'>) => {
    const row = { ...item, id: `${key}-${Date.now()}` } as T
    rows.value.unshift(row)
    return row
  }
  const update = (id: string, patch: Partial<T>) => {
    const index = rows.value.findIndex(row => row.id === id)
    if (index >= 0) rows.value[index] = { ...rows.value[index], ...patch }
  }
  const remove = (id: string) => { rows.value = rows.value.filter(row => row.id !== id) }
  const reset = () => { rows.value = cloneRows(seed) }

  return { rows, add, update, remove, reset }
}
