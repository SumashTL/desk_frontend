// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
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
