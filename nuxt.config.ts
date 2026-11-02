// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    'lucide-vue-next': '@lucide/vue'
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    'nuxt-echarts'
  ],
  echarts: {
    renderer: ['canvas', 'svg'],
    charts: ['LineChart', 'PieChart'],
    components: ['GridComponent', 'TooltipComponent', 'LegendComponent']
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
  },
  postcss: {
    plugins: {
      'tailwindcss/nesting': false
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
