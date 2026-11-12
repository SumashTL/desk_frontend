/**
 * After reset-password / accept-invite the API returns {access, refresh}.
 * Call in setup:  const signInWithTokens = useTokenSignIn();  later: await signInWithTokens(tokens)
 */
export function useTokenSignIn() {
  const { rawToken, rawRefreshToken } = useAuthState()
  const { getSession } = useAuth()
  return async (tokens: { access: string, refresh: string }) => {
    rawToken.value = tokens.access
    rawRefreshToken.value = tokens.refresh
    await nextTick()
    await getSession()
  }
}
