export type ThemeMode = 'light' | 'dark' | 'system'
const KEY = 'sumashdesk-theme'

export function useTheme() {
  const mode = useState<ThemeMode>('theme-mode', () => {
    try { return (localStorage.getItem(KEY) as ThemeMode) || 'light' } catch { return 'light' }
  })
  const isDark = computed(() => mode.value === 'dark'
    || (mode.value === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  function apply() {
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', isDark.value)
  }
  function set(next: ThemeMode) {
    mode.value = next
    try { localStorage.setItem(KEY, next) } catch {}
    apply()
  }
  return { mode, isDark, set, apply, toggle: () => set(isDark.value ? 'light' : 'dark') }
}
