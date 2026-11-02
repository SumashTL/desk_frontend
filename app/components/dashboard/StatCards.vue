<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 select-none">
    <div
      v-for="card in metrics"
      :key="card.id"
      class="card flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 ease-out"
    >
      <!-- Top: Icon & Label -->
      <div>
        <div class="flex items-center gap-2">
          <div :class="['w-6 h-6 rounded-md flex items-center justify-center shrink-0', card.bg]">
            <component :is="card.icon" :class="['w-3.5 h-3.5', card.color]" />
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 truncate">
            {{ card.label }}
          </span>
        </div>

        <!-- Metric Value / Loading Skeleton -->
        <div class="my-2.5">
          <div v-if="loading" class="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div v-else class="text-2xl sm:text-[28px] font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
            {{ card.formattedValue }}
          </div>
        </div>
      </div>

      <!-- Bottom Subtitle / Comparison with Dynamic Trend Badge -->
      <div class="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 flex-wrap min-h-[42px]">
        <div v-if="loading" class="h-3.5 w-28 bg-zinc-100 dark:bg-zinc-800/60 rounded animate-pulse" />
        <template v-else>
          <!-- Trend Badge -->
          <span
            v-if="card.trend"
            :class="[
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border',
              card.trend.badgeClass
            ]"
          >
            <component :is="card.trend.icon" class="w-3 h-3 shrink-0" />
            <span>{{ card.trend.text }}</span>
          </span>

          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
            {{ card.subtitle }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '~/stores/dashboard'
import {
  MessageSquare,
  BookUser,
  Inbox,
  CheckCircle2,
  AlarmClock,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Minus
} from '@lucide/vue'

const props = defineProps({
  /**
   * Keyed API data object, e.g.:
   * {
   *   conversations: { value: 2145, change: -64.8 },
   *   contacts: { value: 1523 },
   *   unassigned: { value: 2078 },
   *   assigned: { value: 67 },
   *   avgFirstResponse: { value: '47m 30s', change: -94.7 },
   *   resolutionRate: { value: '0.0%' }
   * }
   */
  data: {
    type: Object,
    default: () => ({})
  },
  /**
   * Direct custom array of card objects (optional)
   */
  items: {
    type: Array,
    default: null
  },
  /**
   * Skeleton loading state during API fetching
   */
  loading: {
    type: Boolean,
    default: false
  }
})

const store = useDashboardStore()

// Temporary mock data per preset. Replace with a $fetch call keyed on store.range.
const MOCK_STATS = {
  'Today': {
    conversations: { value: 320, change: 18.2 }, contacts: { value: 210 }, unassigned: { value: 295 },
    assigned: { value: 25 }, avgFirstResponse: { value: '15m 10s', change: -22.5 }, resolutionRate: { value: '92.5%' }
  },
  '7 Days': {
    conversations: { value: 2148, change: -64.8 }, contacts: { value: 1523 }, unassigned: { value: 2078 },
    assigned: { value: 70 }, avgFirstResponse: { value: '47m 30s', change: -94.7 }, resolutionRate: { value: '0.0%' }
  },
  '30 Days': {
    conversations: { value: 6840, change: -24.2 }, contacts: { value: 4920 }, unassigned: { value: 6620 },
    assigned: { value: 220 }, avgFirstResponse: { value: '50m 10s', change: -12.1 }, resolutionRate: { value: '4.5%' }
  }
}

const stats = computed(() => {
  if (Object.keys(props.data || {}).length) return props.data
  return MOCK_STATS[store.range.preset] || MOCK_STATS['7 Days']
})

// Centralized badge styles dictionary
const TREND_STYLES = {
  positive: {
    icon: ArrowUpRight,
    badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
  },
  negative: {
    icon: ArrowDownRight,
    badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40'
  },
  neutral: {
    icon: Minus,
    badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200/70 dark:border-zinc-700'
  }
}

/**
 * Resolves trend value to an icon, text, and badge class.
 * Automatically handles numbers, strings, and inverted metrics (e.g. response time).
 */
function resolveTrend(change, invert = false) {
  if (change === null || change === undefined || change === '') return null

  const str = String(change).trim()
  const rawNum = typeof change === 'number' ? change : Number.parseFloat(str.replace('%', ''))
  const text = str.endsWith('%') ? str : `${str}%`

  if (Number.isNaN(rawNum) || rawNum === 0) {
    return { text, ...TREND_STYLES.neutral }
  }

  const isNegative = rawNum < 0 || str.startsWith('-')
  const status = invert
    ? (isNegative ? 'positive' : 'negative')
    : (isNegative ? 'negative' : 'positive')

  const style = TREND_STYLES[status]
  const displayText = status === 'positive' && !text.startsWith('+') && !text.startsWith('-')
    ? `+${text}`
    : text

  return {
    text: displayText,
    icon: style.icon,
    badgeClass: style.badgeClass
  }
}

/**
 * Formats raw numbers (e.g. 2145 -> '2,145')
 */
function formatMetricValue(val) {
  if (val === null || val === undefined) return '0'
  if (typeof val === 'number') {
    return new Intl.NumberFormat('en-US').format(val)
  }
  return String(val)
}

// Default metric card schema
const METRIC_SCHEMAS = [
  {
    id: 'conversations',
    label: 'TOTAL CONVERSATIONS',
    defaultValue: 2145,
    defaultChange: -64.8,
    defaultSubtitle: 'vs previous period',
    icon: MessageSquare,
    bg: 'bg-stat-icon-bg dark:bg-emerald-950/40',
    color: 'text-primary-green'
  },
  {
    id: 'contacts',
    label: 'UNIQUE CONTACTS',
    defaultValue: 1523,
    defaultChange: null,
    defaultSubtitle: 'current unique contact count',
    icon: BookUser,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'unassigned',
    label: 'UNASSIGNED CONVERSATION',
    defaultValue: 2078,
    defaultChange: null,
    defaultSubtitle: 'current unassigned load',
    icon: Inbox,
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    color: 'text-sky-600 dark:text-sky-400'
  },
  {
    id: 'assigned',
    label: 'ASSIGNED CONVERSATIONS',
    defaultValue: 67,
    defaultChange: null,
    defaultSubtitle: 'current assignment load',
    icon: CheckCircle2,
    bg: 'bg-stat-icon-bg dark:bg-emerald-950/40',
    color: 'text-primary-green'
  },
  {
    id: 'avgFirstResponse',
    label: 'AVG FIRST RESPONSE',
    defaultValue: '47m 30s',
    defaultChange: -94.7,
    invert: true, // Reduction in response time is positive
    defaultSubtitle: 'vs previous period',
    icon: AlarmClock,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    color: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'resolutionRate',
    label: 'RESOLUTION RATE',
    defaultValue: '0.0%',
    defaultChange: null,
    defaultSubtitle: 'vs previous period',
    icon: TrendingUp,
    bg: 'bg-stat-icon-bg dark:bg-emerald-950/40',
    color: 'text-primary-green'
  }
]

// Computed reactive metrics list
const metrics = computed(() => {
  if (props.items?.length) {
    return props.items.map((item) => ({
      ...item,
      formattedValue: formatMetricValue(item.value),
      trend: resolveTrend(item.change ?? item.trend, item.invert)
    }))
  }

  return METRIC_SCHEMAS.map((schema) => {
    const apiData = stats.value?.[schema.id] ?? {}
    const rawVal = apiData.value ?? schema.defaultValue
    const changeVal = apiData.change !== undefined
      ? apiData.change
      : (apiData.trend !== undefined ? apiData.trend : schema.defaultChange)
    const invert = apiData.invert ?? schema.invert ?? false
    const subtitle = apiData.subtitle ?? schema.defaultSubtitle

    return {
      id: schema.id,
      label: schema.label,
      formattedValue: formatMetricValue(rawVal),
      subtitle,
      icon: schema.icon,
      bg: schema.bg,
      color: schema.color,
      trend: resolveTrend(changeVal, invert)
    }
  })
})
</script>
