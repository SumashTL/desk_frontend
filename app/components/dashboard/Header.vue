<template>
  <header
    class="card p-5 md:px-7 md:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
  >
    <!-- Left: Title & Date Subtitle -->
    <div class="shrink-0 xl:w-[200px]">
      <h1 class="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
        {{ title }}
      </h1>
      <p class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
        {{ subtitleText }}
      </p>
    </div>

    <!-- Middle: Quick Progress Stats -->
    <div class="flex items-center flex-wrap gap-6 sm:gap-8 py-1">
      <!-- 1. Conversations -->
      <div class="flex items-center gap-3">
        <CircularProgress
          :value="statData.conversations.percentage"
          size="sm"
          variant="primary"
          track-class="stroke-zinc-200 dark:stroke-zinc-700/80"
        />
        <div class="flex flex-col">
          <div class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            {{ statData.conversations.current }}
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">/{{ statData.conversations.max }}</span>
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-0.5">
            CONVERSATIONS
          </span>
        </div>
      </div>

      <!-- 2. Channels -->
      <div class="flex items-center gap-3">
        <CircularProgress
          :value="statData.channels.percentage"
          size="sm"
          variant="primary"
          track-class="stroke-zinc-200 dark:stroke-zinc-700/80"
        />
        <div class="flex flex-col">
          <div class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            {{ statData.channels.current }}
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">/{{ statData.channels.max }}</span>
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-0.5">
            CHANNELS
          </span>
        </div>
      </div>

      <!-- 3. Team Members -->
      <div class="flex items-center gap-3">
        <CircularProgress
          :value="statData.members.percentage"
          size="sm"
          variant="primary"
          track-class="stroke-zinc-200 dark:stroke-zinc-700/80"
        />
        <div class="flex flex-col">
          <div class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            {{ statData.members.current }}
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">/{{ statData.members.max }}</span>
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-0.5">
            TEAM MEMBERS
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Actions (Search, Date Filter, Notification) -->
    <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1 sm:flex-initial">
        <Search class="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full sm:w-56 md:w-64 lg:w-72 h-[42px] pl-10 pr-4 rounded-full bg-search-bg dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-colors duration-150"
        />
      </div>

      <!-- Date Range Filter Popover -->
      <DashboardDateRangePicker
        :model-value="store.range.label"
        @rangeChange="store.setRange"
      />

      <!-- Notifications Bell -->
      <NuxtLink
        to="/dashboard/notifications"
        class="w-[42px] h-[42px] rounded-full border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-card-surface hover:bg-zinc-50 dark:hover:bg-zinc-800/80 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-primary-green/20"
        title="Notifications"
      >
        <Bell class="w-4 h-4" />
        <span
          v-if="hasUnreadNotifications"
          class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-green ring-2 ring-white dark:ring-card-surface"
        />
      </NuxtLink>
    </div>
  </header>
</template>

<script setup>
import { Bell, Search } from '@lucide/vue'
import { computed } from 'vue'
import { useDashboardStore } from '~/stores/dashboard'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  stats: {
    type: Object,
    default: () => ({})
  },
  search: {
    type: String,
    default: ''
  },
  hasUnreadNotifications: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:search', 'search'])

const searchQuery = computed({
  get: () => props.search,
  set: (val) => {
    emit('update:search', val)
    emit('search', val)
  }
})

const store = useDashboardStore()

const subtitleText = computed(() => {
  if (store.range.label !== 'Today') return store.range.label
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const defaultStats = {
  conversations: { current: '6.8K', max: '60K', percentage: 11 },
  channels: { current: '1', max: '6', percentage: 17 },
  members: { current: '7', max: '20', percentage: 35 }
}

const statData = computed(() => {
  return {
    conversations: { ...defaultStats.conversations, ...props.stats?.conversations },
    channels: { ...defaultStats.channels, ...props.stats?.channels },
    members: { ...defaultStats.members, ...props.stats?.members }
  }
})
</script>

