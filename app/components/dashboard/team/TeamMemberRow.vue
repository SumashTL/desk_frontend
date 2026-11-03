<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3.5 px-3 rounded-2xl hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
    <!-- Left Column: Avatar, Name, Status Badge (Fixed width on desktop for 100% alignment consistency) -->
    <div class="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex items-center gap-3 min-w-0">
      <!-- Initials Avatar with Status Dot -->
      <div class="relative shrink-0">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
          :class="isOnline
            ? 'bg-active-nav-bg text-primary-green border border-light-green-border/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
            : 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'"
        >
          {{ member.initials }}
        </div>
        <span
          class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-card-surface"
          :class="isOnline ? 'bg-primary-green' : 'bg-zinc-400 dark:bg-zinc-500'"
        />
      </div>

      <!-- Name & Status Info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {{ member.name }}
          </h4>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
            :class="isOnline
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
              : 'bg-zinc-100 text-zinc-500 border border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="isOnline ? 'bg-emerald-500' : 'bg-zinc-400'"
            />
            {{ member.status }}
          </span>
        </div>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
          {{ member.statusText }}
        </p>
      </div>
    </div>

    <!-- Middle Column: Workload Stats & ECharts Progress Bar (Half-width: compact ~340px-380px) -->
    <div class="w-full lg:w-[320px] xl:w-[360px] shrink-0">
      <div class="flex items-center justify-between text-xs mb-1.5">
        <span class="text-zinc-500 dark:text-zinc-400 font-medium truncate">
          <strong class="font-semibold text-zinc-700 dark:text-zinc-300">{{ member.replied }}</strong> replied ·
          <strong class="font-semibold text-zinc-700 dark:text-zinc-300">{{ member.open }}</strong> open ·
          <strong class="font-semibold text-zinc-700 dark:text-zinc-300">{{ member.assigned }}</strong> assigned
        </span>
        <span class="font-bold text-zinc-700 dark:text-zinc-300 ml-2 shrink-0">
          {{ member.progress }}%
        </span>
      </div>

      <!-- Horizontal Progress Bar (Powered by ECharts) -->
      <TeamProgressBarChart
        :progress="member.progress"
        :is-online="isOnline"
        :height="6"
      />
    </div>

    <!-- Right Column: Mini Activity Signal Bars & Response Time (Fixed width for exact right alignment) -->
    <div class="w-full lg:w-[130px] shrink-0 flex items-center justify-end gap-3 self-end lg:self-center">
      <!-- 5-bar Sparkline Activity Chart (Powered by ECharts) -->
      <TeamSparklineChart
        :data="activityBars"
        :is-online="isOnline"
      />

      <!-- Response Time -->
      <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 w-16 text-right">
        {{ member.responseTime }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TeamProgressBarChart from './TeamProgressBarChart.vue'
import TeamSparklineChart from './TeamSparklineChart.vue'

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
})

const isOnline = computed(() => props.member.status === 'online')

const defaultBars = [35, 60, 45, 90, 75]
const activityBars = computed(() => {
  return props.member.bars || defaultBars
})
</script>
