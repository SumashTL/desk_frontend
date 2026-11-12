import { toast } from 'vue-sonner'

/** Revokes the refresh token on the server, closes the realtime socket and clears the local session. */
export const useLogout = () => {
  const { signOut } = useAuth()
  const { rawRefreshToken } = useAuthState()
  const config = useRuntimeConfig()
  const loading = useState('logout-loading', () => false)

  const logout = async ({ silent = false } = {}) => {
    if (loading.value) return
    loading.value = true
    try {
      useRealtime().disconnect()
      const refresh = rawRefreshToken.value
      if (refresh) {
        try {
          await $fetch('/auth/logout/', { baseURL: String(config.public.apiBase), method: 'POST', body: { refresh } })
        } catch { /* an already-expired token must not block signing out */ }
      }
      await signOut({ callbackUrl: '/login' })
      if (!silent) toast.success('Signed out')
    } finally {
      loading.value = false
    }
  }
  return { logout, loading }
}
