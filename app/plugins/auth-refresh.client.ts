/**
 * Keeps the session alive:
 *  - on start, an expired access token is replaced using the refresh token (instead of logging out)
 *  - every 10 minutes while signed in the access token is renewed in the background
 */
export default defineNuxtPlugin(async () => {
  const { data, getSession } = useAuth()
  const { rawRefreshToken } = useAuthState()
  const api = useApi()

  if (!data.value && rawRefreshToken.value) {
    if (await api.refreshToken()) await getSession()
  }

  setInterval(async () => {
    if (data.value && document.visibilityState === 'visible') await api.refreshToken()
  }, 10 * 60 * 1000)
})
