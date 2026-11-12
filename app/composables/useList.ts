/**
 * Paginated DRF list with filters: { count, next, previous, results } (+ any extra keys such as stats).
 * Filters/search changes reset to page 1; search is debounced.
 */
export function useList<T = any>(path: MaybeRefOrGetter<string>, initial: Record<string, any> = {}, opts: { pageSize?: number, immediate?: boolean } = {}) {
  const api = useApi()
  const filters = reactive<Record<string, any>>({ search: '', ...initial })
  const page = ref(1)
  const pageSize = opts.pageSize ?? 25
  const items = ref<T[]>([]) as Ref<T[]>
  const count = ref(0)
  const extra = ref<Record<string, any>>({})
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  let controller: AbortController | null = null

  async function load() {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      const res: any = await api.get(toValue(path), { query: { ...filters, page: page.value }, signal: controller.signal, silent: true })
      if (Array.isArray(res)) {
        items.value = res
        count.value = res.length
        extra.value = {}
      } else {
        const { results, count: c, next, previous, ...rest } = res
        items.value = results || []
        count.value = c ?? (results || []).length
        extra.value = rest
      }
      loaded.value = true
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      error.value = e?.message || 'Could not load data.'
    } finally {
      loading.value = false
    }
  }

  const pages = computed(() => Math.max(1, Math.ceil(count.value / pageSize)))
  let timer: any
  watch(() => filters.search, () => { clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load() }, 300) })
  watch(() => Object.entries(filters).filter(([k]) => k !== 'search').map(([, v]) => JSON.stringify(v)).join('|'), () => { page.value = 1; load() })
  watch(page, load)
  if (opts.immediate !== false) onMounted(load)

  return { filters, page, pages, pageSize, items, count, extra, loading, loaded, error, load, reload: load }
}
