<template>
  <div class="card p-5 sm:p-6 md:p-7 space-y-6">
    <!-- Header: Title, Live Status, Subtitle & Pill Tabs Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <div class="w-10 h-10 rounded-2xl bg-active-nav-bg border border-light-green-border/30 flex items-center justify-center text-primary-green shrink-0 shadow-xs">
          <Users class="w-5 h-5 stroke-[2.2]" />
        </div>

        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Team Command Center
            </h2>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Presence, workload & performance - one view - {{ onlineCount }}/{{ teamMembers.length }} team availability
          </p>
        </div>
      </div>

      <!-- Reusable Pill Tabs Filter (All / Online / Offline) -->
      <PillTabs
        v-model="activeFilter"
        :items="filterTabs"
        class="self-start sm:self-auto"
      />
    </div>

    <!-- Top 5 Stats Overview & Ratio Bar -->
    <TeamStatsOverview :stats="computedStats" />

    <!-- Team Members List -->
    <div class="divide-y divide-zinc-100 dark:divide-zinc-800/80 pt-2">
      <TeamMemberRow
        v-for="member in filteredMembers"
        :key="member.id"
        :member="member"
      />
    </div>
  </div>
</template>

<script setup>
import { Users } from '@lucide/vue'
import { computed, ref } from 'vue'
import PillTabs from '~/components/PillTabs.vue'
import TeamMemberRow from './team/TeamMemberRow.vue'
import TeamStatsOverview from './team/TeamStatsOverview.vue'

const activeFilter = ref('all')

// Demo Data matching the design
const teamMembers = ref([
  {
    id: 1,
    name: 'Sadikul Islam Sadi',
    initials: 'SI',
    status: 'online',
    statusText: 'Available now',
    replied: 31,
    open: 41,
    assigned: 41,
    progress: 75.6,
    responseTime: '34m 30s',
    bars: [30, 50, 75, 100, 60],
  },
  {
    id: 2,
    name: 'Ahsan Hossain Alvy',
    initials: 'AH',
    status: 'online',
    statusText: 'Available now',
    replied: 8,
    open: 9,
    assigned: 9,
    progress: 88.9,
    responseTime: '14m 36s',
    bars: [45, 60, 85, 100, 70],
  },
  {
    id: 3,
    name: 'Golam Farhan Samik',
    initials: 'GF',
    status: 'online',
    statusText: 'Available now',
    replied: 5,
    open: 7,
    assigned: 7,
    progress: 71.4,
    responseTime: '1h 45m',
    bars: [50, 70, 90, 80, 60],
  },
  {
    id: 4,
    name: 'Ubayda Alvii',
    initials: 'UA',
    status: 'offline',
    statusText: 'No active load',
    replied: 3,
    open: 5,
    assigned: 5,
    progress: 60,
    responseTime: '6h 35m',
    bars: [25, 40, 55, 75, 50],
  },
  {
    id: 5,
    name: 'Musaddiqur Rahman Asik',
    initials: 'MR',
    status: 'offline',
    statusText: 'No active load',
    replied: 2,
    open: 2,
    assigned: 2,
    progress: 100,
    responseTime: '7h 20m',
    bars: [20, 35, 50, 65, 45],
  },
  {
    id: 6,
    name: 'Subrina Afrin Onu',
    initials: 'SA',
    status: 'online',
    statusText: 'Available now',
    replied: 1,
    open: 2,
    assigned: 2,
    progress: 50,
    responseTime: '4m',
    bars: [40, 65, 80, 95, 60],
  },
  {
    id: 7,
    name: 'Asifur Rahman Akash',
    initials: 'AR',
    status: 'offline',
    statusText: 'No active load',
    replied: 1,
    open: 1,
    assigned: 1,
    progress: 100,
    responseTime: '24s',
    bars: [15, 30, 45, 60, 40],
  },
  {
    id: 8,
    name: 'Sumash Tech Limited',
    initials: 'ST',
    status: 'online',
    statusText: 'Available now',
    replied: 0,
    open: 0,
    assigned: 0,
    progress: 0,
    responseTime: '-',
    bars: [30, 50, 65, 80, 50],
  },
])

const onlineCount = computed(() => {
  return teamMembers.value.filter((m) => m.status === 'online').length
})

const offlineCount = computed(() => {
  return teamMembers.value.filter((m) => m.status === 'offline').length
})

const filterTabs = computed(() => [
  { label: 'All', value: 'all', badge: teamMembers.value.length },
  { label: 'Online', value: 'online', badge: onlineCount.value },
  { label: 'Offline', value: 'offline', badge: offlineCount.value },
])

const filteredMembers = computed(() => {
  if (activeFilter.value === 'online') {
    return teamMembers.value.filter((m) => m.status === 'online')
  }
  if (activeFilter.value === 'offline') {
    return teamMembers.value.filter((m) => m.status === 'offline')
  }
  return teamMembers.value
})

const computedStats = computed(() => {
  const total = teamMembers.value.length
  const available = onlineCount.value
  const totalAssigned = teamMembers.value.reduce((acc, m) => acc + m.assigned, 0)
  const totalOpen = teamMembers.value.reduce((acc, m) => acc + m.open, 0)
  const totalReplied = teamMembers.value.reduce((acc, m) => acc + m.replied, 0)
  const progressPercent = totalAssigned > 0 ? Number(((totalReplied / totalAssigned) * 100).toFixed(1)) : 0

  return {
    available,
    total,
    totalAssigned,
    totalOpen,
    avgResponse: '48m 36s',
    progressFraction: `${totalReplied}/${totalAssigned}`,
    progressPercent,
  }
})
</script>

