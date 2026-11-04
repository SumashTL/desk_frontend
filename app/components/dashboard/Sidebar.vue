<template>
  <aside :class="['sumash-sidebar z-40 flex h-screen shrink-0 flex-col border-r transition-all duration-200', collapsed ? 'w-[76px]' : 'w-[248px]']">
    <div class="flex h-[76px] items-center justify-between border-b px-4">
      <NuxtLink to="/dashboard/inbox" class="flex items-center gap-3 overflow-hidden">
        <span class="sumash-brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg font-black text-white">S</span>
        <span v-if="!collapsed" class="min-w-0"><span class="block text-[19px] font-extrabold tracking-tight">SumashDesk</span><span class="block text-[10px] font-semibold tracking-[.13em] opacity-55">WHATSAPP WORKSPACE</span></span>
      </NuxtLink>
      <button class="rounded-xl p-2 opacity-60 transition hover:bg-black/5 hover:opacity-100" @click="collapsed = !collapsed" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"><PanelLeftClose class="h-4 w-4" /></button>
    </div>
    <div v-if="!collapsed" class="px-4 pb-2 pt-5"><p class="text-[10px] font-bold uppercase tracking-[.16em] opacity-40">Workspace</p></div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-3">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :title="collapsed ? item.label : ''" :class="['sumash-nav-item group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-all', active(item.to) ? 'is-active' : '', collapsed ? 'justify-center px-0' : '']">
        <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        <span v-if="item.badge && !collapsed" class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold">{{ item.badge }}</span>
      </NuxtLink>
    </nav>
    <div class="border-t p-3">
      <div :class="['mb-2 flex items-center gap-2 rounded-2xl p-2.5', collapsed ? 'justify-center' : 'sumash-user-card']">
        <span class="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">SI<span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span></span>
        <div v-if="!collapsed" class="min-w-0 flex-1"><p class="truncate text-xs font-bold">Sadikul Islam</p><p class="truncate text-[10px] opacity-55">Workspace admin</p></div>
        <button v-if="!collapsed" @click="toggleTheme" class="rounded-xl p-2 opacity-65 transition hover:bg-black/5 hover:opacity-100" :title="isDark ? 'Switch to day mode' : 'Switch to night mode'"><Moon v-if="!isDark" class="h-4 w-4"/><Sun v-else class="h-4 w-4"/></button>
      </div>
      <button @click="signOut" :class="['flex h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-semibold opacity-60 transition hover:bg-rose-500/10 hover:text-rose-600 hover:opacity-100', collapsed ? 'justify-center px-0' : '']"><LogOut class="h-4 w-4" /><span v-if="!collapsed">Sign out</span></button>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MessagesSquare, LayoutDashboard, Users, Megaphone, Zap, FileText, UserRoundCog, ChartNoAxesCombined, Settings, PanelLeftClose, Sun, Moon, LogOut, HeartHandshake, UserRound, CalendarClock } from '@lucide/vue'
const route = useRoute()
const collapsed = ref(false)
const isDark = ref(false)
onMounted(() => {
  if (window.innerWidth < 768) collapsed.value = true
  const saved = localStorage.getItem('sumashdesk-theme')
  isDark.value = saved === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})
const items = [
  { label: 'Inbox', to: '/dashboard/inbox', icon: MessagesSquare, badge: '12' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Contacts', to: '/dashboard/contacts', icon: Users },
  { label: 'Customer 360°', to: '/dashboard/customer-360', icon: UserRound },
  { label: 'Broadcast', to: '/dashboard/broadcast', icon: Megaphone },
  { label: 'Quick Replies', to: '/dashboard/quick-replies', icon: Zap },
  { label: 'Templates', to: '/dashboard/templates', icon: FileText },
  { label: 'Team Members', to: '/dashboard/members', icon: UserRoundCog },
  { label: 'Follow-ups', to: '/dashboard/follow-ups', icon: CalendarClock },
  { label: 'Customer Satisfaction', to: '/dashboard/csat', icon: HeartHandshake },
  { label: 'Reports', to: '/dashboard/reports', icon: ChartNoAxesCombined },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]
const active = (path: string) => path === '/dashboard' ? route.path === path : route.path.startsWith(path)
const toggleTheme = () => { isDark.value = !isDark.value; document.documentElement.classList.toggle('dark', isDark.value); localStorage.setItem('sumashdesk-theme', isDark.value ? 'dark' : 'light') }
const { logout } = useLogout()
const signOut = async () => { try { await logout() } catch { await navigateTo('/login') } }
</script>
