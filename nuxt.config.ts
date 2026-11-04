export default defineNuxtConfig({
  alias: {
    "lucide-vue-next": "@lucide/vue",
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@sidebase/nuxt-auth",
    "nuxt-echarts",

    "@pinia/nuxt",
  ],
  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "SumashDesk",
      demoMode: process.env.NUXT_PUBLIC_DEMO_MODE !== "false",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1",
    },
  },
  echarts: {
    renderer: ["canvas", "svg"],
    charts: ["LineChart", "PieChart", "BarChart"],
    components: ["GridComponent", "TooltipComponent", "LegendComponent"],
  },
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },

  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
  },

  postcss: {
    plugins: {
      "tailwindcss/nesting": false,
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  auth: {
    isEnabled: true,
    baseURL: process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1",
    globalAppMiddleware: false, // Keep the mock-data frontend accessible before backend integration.

    provider: {
      type: "local",

      endpoints: {
        signIn: { path: "/auth/login/", method: "post" },
        getSession: { path: "/auth/me/", method: "get" },
        signOut: false,
      },

      pages: {
        login: "/login",
      },

      token: {
        signInResponseTokenPointer: "/access",
        type: "Bearer",
        headerName: "Authorization",
        maxAgeInSeconds: 60 * 15,
      },

      refresh: {
        isEnabled: true,
        endpoint: { path: "/auth/refresh/", method: "post" },
        refreshOnlyToken: false,

        token: {
          signInResponseRefreshTokenPointer: "/refresh",
          refreshRequestTokenPointer: "/refresh",
          maxAgeInSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  },
});
