<template>
  <div class="space-y-4">
    <!-- Top 5 Metric Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <!-- 1. Available Now -->
      <div class="rounded-2xl p-4 bg-active-nav-bg/70 dark:bg-emerald-950/20 border border-light-green-border/30 dark:border-emerald-800/40 flex flex-col justify-between">
        <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-primary-green dark:text-emerald-400">
          Available Now
        </span>
        <div class="mt-2 flex items-baseline gap-1 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          <span>{{ stats.available }}</span>
          <span class="text-sm font-semibold text-zinc-400">/{{ stats.total }}</span>
        </div>
      </div>

      <!-- 2. Total Assigned -->
      <div class="rounded-2xl p-4 bg-subtle-bg dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between">
        <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Total Assigned
        </span>
        <div class="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {{ stats.totalAssigned }}
        </div>
      </div>

      <!-- 3. Total Open -->
      <div class="rounded-2xl p-4 bg-subtle-bg dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between">
        <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Total Open
        </span>
        <div class="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          {{ stats.totalOpen }}
        </div>
      </div>

      <!-- 4. Avg Response -->
      <div class="rounded-2xl p-4 bg-subtle-bg dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between">
        <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Avg Response
        </span>
        <div class="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {{ stats.avgResponse }}
        </div>
      </div>

      <!-- 5. Team Progress -->
      <div class="col-span-2 sm:col-span-1 rounded-2xl p-4 bg-subtle-bg dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-primary-green dark:text-emerald-400">
            Team Progress
          </span>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            {{ stats.progressFraction }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5 text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          <span class="text-primary-green">{{ stats.progressPercent }}%</span>
          <span class="text-xs font-semibold text-zinc-400">replied</span>
        </div>
        <!-- ECharts Progress Bar -->
        <TeamProgressBarChart
          :progress="stats.progressPercent"
          :height="6"
          class="mt-2.5"
        />
      </div>
    </div>

    <!-- Dual Ratio Split Bar (Online vs Offline - Powered by ECharts) -->
    <div class="space-y-2 pt-1">
      <TeamRatioBarChart
        :segments="ratioSegments"
        :height="8"
      />

      <!-- Legend -->
      <div class="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span class="inline-flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary-green" />
          <strong class="font-bold text-zinc-700 dark:text-zinc-200">{{ stats.available }}</strong> online
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <strong class="font-bold text-zinc-700 dark:text-zinc-200">{{ stats.total - stats.available }}</strong> offline
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TeamProgressBarChart from './TeamProgressBarChart.vue'
import TeamRatioBarChart from './TeamRatioBarChart.vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      available: 5,
      total: 8,
      totalAssigned: 67,
      totalOpen: 67,
      avgResponse: '48m 36s',
      progressFraction: '51/67',
      progressPercent: 76.1,
    }),
  },
})

const ratioSegments = computed(() => [
  { name: 'Online', value: props.stats.available, color: '#17900D' },
  { name: 'Offline', value: Math.max(0, props.stats.total - props.stats.available), color: '#CBD5E1' },
])
</script>

