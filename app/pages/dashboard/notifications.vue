<template>
  <div class="sd-page"><div class="sd-page-inner max-w-3xl">
    <SdPageHeader title="Notifications" subtitle="What needs your attention right now. Updates live as chats come in.">
      <SdButton :icon="RefreshCw" :loading="loading" @click="load">Refresh</SdButton>
    </SdPageHeader>
    <div v-if="permission === 'default'" class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-surface)] p-4 text-[13px]">
      <BellRing class="h-5 w-5 text-[var(--sd-primary)]" /><span class="flex-1">Get a desktop alert when a customer writes while this tab is in the background.</span>
      <SdButton size="sm" variant="primary" @click="askPermission">Turn on alerts</SdButton>
    </div>
    <div class="sd-card overflow-hidden">
      <SdTableSkeleton v-if="loading && !items.length" />
      <SdErrorState v-else-if="error" :message="error" @retry="load" />
      <SdEmpty v-else-if="!items.length" :icon="BellOff" title="You're all caught up" text="Waiting customers, due follow-ups, low ratings and failed messages show up here." />
      <NuxtLink v-for="n in items" v-else :key="n.id" :to="n.link" class="flex items-start gap-3 border-b border-[var(--sd-border)] px-4 py-3.5 last:border-0 hover:bg-[var(--sd-surface-soft)]">
        <span :class="['mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', TONE[n.level]]"><component :is="ICON[n.kind] || Bell" class="h-4 w-4" /></span>
        <div class="min-w-0 flex-1">
          <p class="text-[13.5px] font-semibold">{{ n.title }}</p>
          <p v-if="n.text" class="truncate text-[12.5px] text-[var(--sd-muted)]">{{ n.text }}</p>
        </div>
        <span class="shrink-0 text-[11.5px] text-[var(--sd-faint)]">{{ timeAgo(n.at, true) }}</span>
      </NuxtLink>
    </div>
  </div></div>
</template>
<script setup lang="ts">
import { AlertCircle, Bell, BellOff, BellRing, CalendarClock, Frown, Hourglass, Inbox, Megaphone, RefreshCw } from '@lucide/vue'
definePageMeta({ layout: 'dashboard', capability: 'inbox.view' })
useHead({ title: 'Notifications' })
const api = useApi()
const rt = useRealtime()
const { notifications } = useAppBadges()
const items = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const permission = ref<string>('granted')
const ICON: Record<string, any> = { waiting: Hourglass, queue: Inbox, followup: CalendarClock, rating: Frown, failed: AlertCircle, broadcast: Megaphone }
const TONE: Record<string, string> = {
  warning: 'bg-amber-500/12 text-amber-600', info: 'bg-sky-500/10 text-sky-600', danger: 'bg-rose-500/10 text-rose-600', success: 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary)]',
}
async function load() {
  loading.value = true
  error.value = null
  try { const r = await api.get('notifications/', { silent: true }); items.value = r.results; notifications.value = r.count } catch (e: any) { error.value = e.message } finally { loading.value = false }
}
async function askPermission() { try { permission.value = await Notification.requestPermission() } catch {} }
let t: any
rt.on((e) => { if (['message.created', 'conversation.updated', 'resync'].includes(e.type)) { clearTimeout(t); t = setTimeout(load, 800) } })
onMounted(() => { load(); permission.value = 'Notification' in window ? Notification.permission : 'denied' })
</script>
