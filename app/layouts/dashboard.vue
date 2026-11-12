<template>
  <div class="flex h-[100dvh] overflow-hidden bg-[var(--sd-bg)] text-[var(--sd-text)]">
    <!-- desktop sidebar -->
    <AppSidebar class="hidden lg:flex" :collapsed="collapsed" @toggle="toggleCollapsed" />

    <!-- mobile sidebar -->
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition" leave-active-class="transition">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="mobileOpen = false" />
    </Transition>
    <Transition enter-from-class="-translate-x-full" leave-to-class="-translate-x-full" enter-active-class="transition duration-200" leave-active-class="transition duration-200">
      <AppSidebar v-if="mobileOpen" class="fixed inset-y-0 left-0 z-50 flex lg:hidden" mobile @close="mobileOpen = false" />
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--sd-border)] bg-[var(--sd-surface)] px-3 lg:hidden">
        <SdButton size="icon-sm" variant="ghost" :icon="Menu" aria-label="Open menu" @click="mobileOpen = true" />
        <NuxtLink to="/dashboard/inbox" class="flex items-center gap-2 font-bold"><AppLogo class="h-7 w-7" />SumashDesk</NuxtLink>
        <div class="flex-1" />
        <NuxtLink to="/dashboard/notifications" class="relative rounded-lg p-2 text-[var(--sd-muted)]" aria-label="Notifications">
          <Bell class="h-5 w-5" /><span v-if="notifications" class="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--sd-danger)]" />
        </NuxtLink>
      </header>
      <main class="sd-scroll min-h-0 flex-1"><slot /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, Menu } from '@lucide/vue'

const route = useRoute()
const mobileOpen = ref(false)
const collapsed = ref(false)
watch(() => route.fullPath, () => { mobileOpen.value = false })

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  try { localStorage.setItem('sd-sidebar-collapsed', collapsed.value ? '1' : '0') } catch {}
}

const rt = useRealtime()
const { notifications, refreshInbox, refreshNotifications } = useAppBadges()
const alerts = useIncomingAlerts()

onMounted(() => {
  try { collapsed.value = localStorage.getItem('sd-sidebar-collapsed') === '1' } catch {}
  rt.connect()
  refreshInbox()
  refreshNotifications()
  alerts.init()
})

rt.on((e) => {
  if (['message.created', 'conversation.updated', 'conversation.removed', 'resync'].includes(e.type)) refreshInbox()
  if (['message.created', 'conversation.updated', 'resync'].includes(e.type)) refreshNotifications()
  if (e.type === 'message.created') alerts.onMessage(e)
})

const poll = setInterval(refreshNotifications, 60000)
onBeforeUnmount(() => clearInterval(poll))
</script>
