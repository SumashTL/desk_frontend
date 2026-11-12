/**
 * Pages declare what they need:  definePageMeta({ capability: 'broadcasts.manage' })
 * The menu hides what you cannot open, this stops typed URLs, and the API refuses anyway.
 */
import { toast } from 'vue-sonner'

export default defineNuxtRouteMiddleware((to) => {
  const needed = to.meta.capability as string | string[] | undefined
  if (!needed) return
  const { me, can } = useSession()
  if (!me.value) return // auth middleware sends to /login
  const list = Array.isArray(needed) ? needed : [needed]
  if (list.every(c => can(c as any))) return
  if (import.meta.client) toast.error('You do not have access to that page.')
  return navigateTo('/dashboard/inbox')
})
