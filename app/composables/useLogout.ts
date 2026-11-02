import { toast } from 'vue-sonner'

/**
 * Logout: Django তে refresh token বাতিল, তারপর nuxt-auth এর লোকাল সেশন মুছে /login এ।
 * nuxt.config.ts এ endpoints.signOut: false, তাই signOut() নিজে কোনো API ডাকে না।
 */
export const useLogout = () => {
  const { signOut, rawRefreshToken, refreshToken } = useAuth()
  const config = useRuntimeConfig()
  const loading = useState('logout-loading', () => false)

  const logout = async ({ silent = false } = {}) => {
    if (loading.value) return
    loading.value = true

    // nuxt-auth এর ভার্সন অনুযায়ী নাম আলাদা হতে পারে
    const refresh = rawRefreshToken?.value ?? refreshToken?.value

    try {
      if (refresh) {
        await $fetch('/auth/logout/', {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: { refresh },
        })
      }
    } catch {
      // টোকেন আগেই মেয়াদোত্তীর্ণ বা সার্ভার বন্ধ: তবুও লোকালি লগআউট হবে
    }

    try {
      await signOut({ callbackUrl: '/login' })
      if (!silent) toast.success('Signed out successfully')
    } finally {
      loading.value = false
    }
  }

  return { logout, loading }
}