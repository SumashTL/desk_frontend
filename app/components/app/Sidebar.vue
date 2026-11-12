<template>
  <aside :class="['h-full shrink-0 flex-col border-r border-[var(--sd-border)] bg-[var(--sd-sidebar)] transition-[width] duration-200', narrow ? 'w-[72px]' : 'w-[252px]']">
    <div class="flex h-16 items-center gap-3 px-4">
      <NuxtLink to="/dashboard/inbox" class="flex min-w-0 items-center gap-3">
        <AppLogo class="h-9 w-9 shrink-0" />
        <span v-if="!narrow" class="min-w-0 leading-tight">
          <span class="block truncate text-[16px] font-extrabold tracking-tight">SumashDesk</span>
          <span class="block truncate text-[10.5px] font-medium text-[var(--sd-muted)]">WhatsApp team inbox</span>
        </span>
      </NuxtLink>
      <button v-if="mobile" class="ml-auto rounded-lg p-1.5 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)]" aria-label="Close menu" @click="$emit('close')"><X class="h-4 w-4" /></button>
      <button v-else-if="!narrow" class="ml-auto rounded-lg p-1.5 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)]" title="Collapse" aria-label="Collapse sidebar" @click="$emit('toggle')"><PanelLeftClose class="h-4 w-4" /></button>
    </div>
    <button v-if="narrow" class="mx-auto mb-1 rounded-lg p-1.5 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)]" title="Expand" aria-label="Expand sidebar" @click="$emit('toggle')"><PanelLeftOpen class="h-4 w-4" /></button>

    <nav class="sd-scroll flex-1 px-3 pb-3">
      <template v-for="group in groups" :key="group.label">
        <p v-if="!narrow" class="px-3 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[.12em] text-[var(--sd-faint)]">{{ group.label }}</p>
        <div v-else class="mx-3 my-3 h-px bg-[var(--sd-border)]" />
        <NuxtLink v-for="item in group.items" :key="item.to" :to="item.to" :title="narrow ? item.label : undefined"
          :class="['group relative mb-0.5 flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition',
                   isActive(item.to) ? 'bg-[var(--sd-primary-soft)] font-semibold text-[var(--sd-primary-ink)]' : 'text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]',
                   narrow && 'justify-center px-0']">
          <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
          <span v-if="!narrow" class="truncate">{{ item.label }}</span>
          <span v-if="item.badge && !narrow" class="ml-auto min-w-[20px] rounded-full bg-[var(--sd-primary)] px-1.5 text-center text-[10.5px] font-bold leading-5 text-[var(--sd-on-primary)]">{{ item.badge > 99 ? '99+' : item.badge }}</span>
          <span v-else-if="item.badge && narrow" class="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-[var(--sd-primary)]" />
        </NuxtLink>
      </template>
    </nav>

    <div class="border-t border-[var(--sd-border)] p-3">
      <div :class="['flex items-center gap-1', narrow && 'flex-col']">
        <NuxtLink to="/dashboard/notifications" class="relative rounded-lg p-2 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]" title="Notifications" aria-label="Notifications">
          <Bell class="h-[18px] w-[18px]" />
          <span v-if="notifications" class="absolute right-1 top-1 min-w-[16px] rounded-full bg-[var(--sd-danger)] px-1 text-center text-[9px] font-bold leading-4 text-white">{{ notifications > 9 ? '9+' : notifications }}</span>
        </NuxtLink>
        <button class="rounded-lg p-2 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]" :title="isDark ? 'Light mode' : 'Dark mode'" aria-label="Toggle theme" @click="toggle()">
          <Sun v-if="isDark" class="h-[18px] w-[18px]" /><Moon v-else class="h-[18px] w-[18px]" />
        </button>
        <span v-if="!narrow" :class="['ml-auto flex items-center gap-1.5 text-[11px] font-medium', rtStatus === 'open' ? 'text-[var(--sd-primary)]' : 'text-[var(--sd-faint)]']" :title="rtStatus === 'open' ? 'Live updates connected' : 'Reconnecting…'">
          <span :class="['h-1.5 w-1.5 rounded-full', rtStatus === 'open' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500']" />{{ rtStatus === 'open' ? 'Live' : 'Offline' }}
        </span>
      </div>

      <SdMenu :items="userMenu" align="start">
        <button :class="['mt-2 flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-[var(--sd-surface-strong)]', narrow && 'justify-center']">
          <SdAvatar :name="me?.name" :src="me?.avatar" :seed="me?.id" size="sm" :online="me?.is_available" />
          <span v-if="!narrow" class="min-w-0 flex-1">
            <span class="block truncate text-[12.5px] font-semibold">{{ me?.name }}</span>
            <span class="block truncate text-[11px] text-[var(--sd-muted)]">{{ roleLabel }} · {{ me?.is_available ? 'Available' : 'Away' }}</span>
          </span>
          <ChevronsUpDown v-if="!narrow" class="h-4 w-4 text-[var(--sd-faint)]" />
        </button>
      </SdMenu>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Bell, CalendarClock, ChartNoAxesCombined, ChevronsUpDown, Circle, CircleDot, Contact, FileText, HeartHandshake,
  LayoutDashboard, LogOut, Megaphone, MessagesSquare, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun, UserRound,
  UserRoundCog, Users, X, Zap,
} from '@lucide/vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ collapsed?: boolean, mobile?: boolean }>()
defineEmits(['toggle', 'close'])
const narrow = computed(() => props.collapsed && !props.mobile)

const route = useRoute()
const { me, can, roleLabel, refreshMe } = useSession()
const { isDark, toggle } = useTheme()
const { inbox, notifications } = useAppBadges()
const { logout } = useLogout()
const rtStatus = useRealtime().status
const api = useApi()

const groups = computed(() => [
  { label: 'Conversations', items: [
    { label: 'Inbox', to: '/dashboard/inbox', icon: MessagesSquare, cap: 'inbox.view', badge: inbox.value.unread || 0 },
    { label: 'Contacts', to: '/dashboard/contacts', icon: Users, cap: 'contacts.view' },
    { label: 'Customer 360°', to: '/dashboard/customer-360', icon: Contact, cap: 'contacts.view' },
    { label: 'Follow-ups', to: '/dashboard/follow-ups', icon: CalendarClock, cap: 'followups.view' },
  ] },
  { label: 'Engage', items: [
    { label: 'Broadcast', to: '/dashboard/broadcast', icon: Megaphone, cap: 'broadcasts.manage' },
    { label: 'Templates', to: '/dashboard/templates', icon: FileText, cap: 'templates.view' },
    { label: 'Quick replies', to: '/dashboard/quick-replies', icon: Zap, cap: 'quick_replies.view' },
  ] },
  { label: 'Insights', items: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, cap: 'dashboard.view' },
    { label: 'Reports', to: '/dashboard/reports', icon: ChartNoAxesCombined, cap: 'reports.view' },
    { label: 'Satisfaction', to: '/dashboard/csat', icon: HeartHandshake, cap: 'csat.view' },
  ] },
  { label: 'Workspace', items: [
    { label: 'Team members', to: '/dashboard/members', icon: UserRoundCog, cap: 'members.view' },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings, cap: 'settings.personal' },
  ] },
].map(g => ({ ...g, items: g.items.filter(i => can(i.cap as any)) })).filter(g => g.items.length))

const isActive = (to: string) => to === '/dashboard' ? route.path === '/dashboard' : route.path.startsWith(to)

async function setAvailable(value: boolean) {
  try {
    await api.patch('auth/me/availability/', { is_available: value })
    await refreshMe()
    toast.success(value ? 'You are available for new chats' : 'You are away — no new chats will be auto-assigned')
  } catch {}
}

const userMenu = computed(() => [
  { label: 'My profile', icon: UserRound, onSelect: () => navigateTo('/dashboard/profile') },
  { label: 'Available', icon: me.value?.is_available ? CircleDot : Circle, onSelect: () => setAvailable(true) },
  { label: 'Away', icon: me.value?.is_available ? Circle : CircleDot, onSelect: () => setAvailable(false) },
  { separator: true },
  { label: 'Sign out', icon: LogOut, danger: true, onSelect: () => logout() },
])
</script>
