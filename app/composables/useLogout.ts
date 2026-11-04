import { toast } from 'vue-sonner'

/** Demo logout is local-only. In API mode, revoke the refresh token before clearing the session. */
export const useLogout = () => {
  const { signOut, rawRefreshToken, refreshToken } = useAuth()
  const config = useRuntimeConfig()
  const loading = useState('logout-loading', () => false)

  const logout = async ({ silent = false } = {}) => {
    if (loading.value) return
    loading.value = true
    try {
      if (config.public.demoMode) {
        if (import.meta.client) localStorage.removeItem('desk-demo-session')
        await navigateTo('/login')
      } else {
        const refresh = rawRefreshToken?.value ?? refreshToken?.value
        if (refresh) {
          try {
            await $fetch('/auth/logout/', {
              baseURL: config.public.apiBase,
              method: 'POST',
              body: { refresh },
            })
          } catch {
            // A stale token or unavailable API must not prevent local sign-out.
          }
        }
        await signOut({ callbackUrl: '/login' })
      }
      if (!silent) toast.success('Signed out successfully')
    } finally {
      loading.value = false
    }
  }

  return { logout, loading }
}
