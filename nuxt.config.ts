// SumashDesk — Nuxt 4 SPA talking to the Django API (JWT) and the inbox WebSocket.
const apiBase = (process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '')

export default defineNuxtConfig({
  // An internal tool behind a login: no SEO, no server rendering needed, and tokens stay in the browser.
  ssr: false,

  alias: { 'lucide-vue-next': '@lucide/vue' },

  modules: ['@nuxtjs/tailwindcss', '@sidebase/nuxt-auth', 'nuxt-echarts'],

  app: {
    head: {
      titleTemplate: '%s · SumashDesk',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f7a43' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'SumashDesk',
      apiBase,
      // Optional: ws(s)://host:port. Derived from apiBase when empty.
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || '',
    },
  },

  echarts: {
    renderer: ['canvas'],
    charts: ['LineChart', 'BarChart', 'PieChart'],
    components: ['GridComponent', 'TooltipComponent', 'LegendComponent'],
  },

  tailwindcss: { cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }] },

  postcss: { plugins: { 'tailwindcss/nesting': false } },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  auth: {
    isEnabled: true,
    baseURL: apiBase,
    globalAppMiddleware: true,
    // Token refresh is handled in useApi (on 401) and plugins/auth-refresh (on start / timer),
    // so several open tabs never race each other with the same rotating refresh token.
    sessionRefresh: { enablePeriodically: false, enableOnWindowFocus: false },
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/auth/login/', method: 'post' },
        getSession: { path: '/auth/me/', method: 'get' },
        signOut: false,
      },
      pages: { login: '/login' },
      token: {
        signInResponseTokenPointer: '/access',
        type: 'Bearer',
        headerName: 'Authorization',
        cookieName: 'sd.access',
        maxAgeInSeconds: 60 * 60 * 12,
        sameSiteAttribute: 'lax',
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: '/auth/refresh/', method: 'post' },
        refreshOnlyToken: false,
        token: {
          signInResponseRefreshTokenPointer: '/refresh',
          refreshRequestTokenPointer: '/refresh',
          cookieName: 'sd.refresh',
          maxAgeInSeconds: 60 * 60 * 24 * 7,
          sameSiteAttribute: 'lax',
        },
      },
    },
  },
})
