/** Applies the saved theme before the first paint (light, dark or system). */
export default defineNuxtPlugin(() => {
  useTheme().apply()
})
