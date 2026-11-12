/**
 * Files (photos, voice notes, avatars) are served by the Django API, not by this app.
 * Realtime events are built without an HTTP request, so their file URLs can be relative ("/media/…");
 * resolve those against the API's origin, otherwise the browser asks the Nuxt server and gets a broken image.
 */
export function assetUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (/^(https?:|blob:|data:)/i.test(url)) return url
  try {
    return new URL(url, new URL(useRuntimeConfig().public.apiBase as string).origin).toString()
  } catch {
    return url
  }
}
