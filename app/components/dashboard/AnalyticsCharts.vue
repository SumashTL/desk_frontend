<template>
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
    <!-- 1. Left Card: Conversation Volume (8 cols on XL) -->
    <div class="card xl:col-span-8 flex flex-col justify-between">
      <!-- Card Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Conversation Volume
            </h3>
            <TrendingUp class="w-4 h-4 text-zinc-400" />
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-4 mt-2">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Incoming</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Resolved</span>
            </div>
          </div>
        </div>

        <!-- Filter Pills (Today, 7 Days, 30 Days) or Custom Range Badge -->
        <div v-if="isCustomPeriod" class="shrink-0 self-start sm:self-auto">
          <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-zinc-700 text-xs font-bold shadow-xs">
            <span>{{ internalPeriod }}</span>
          </div>
        </div>
        <PillTabs
          v-else
          :model-value="internalPeriod"
          :items="filterPeriods"
          :disabled="loading"
          class="self-start sm:self-auto"
          @update:model-value="setPeriod"
        />
      </div>

      <!-- Line Chart Container -->
      <div class="w-full h-[270px] sm:h-[290px] relative">
        <div
          v-if="loading"
          class="w-full h-full flex flex-col justify-end gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl animate-pulse"
        >
          <div class="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div class="h-2 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div class="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>

        <ClientOnly v-else>
          <VChart :option="lineChartOption" autoresize class="w-full h-full" />
          <template #fallback>
            <div class="w-full h-full flex items-center justify-center animate-pulse bg-zinc-50 dark:bg-zinc-800/40 rounded-xl" />
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- 2. Right Card: Channel Mix (4 cols on XL) -->
    <div class="card xl:col-span-4 flex flex-col justify-between">
      <!-- Card Header -->
      <div>
        <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Channel Mix
        </h3>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {{ channelSubtitle }}
        </p>
      </div>

      <!-- Donut Chart & Legend Section -->
      <div class="flex flex-col sm:flex-row xl:flex-row items-center justify-between gap-6 my-auto py-4">
        <!-- Donut Chart with Center Total -->
        <div class="w-[170px] h-[170px] sm:w-[180px] sm:h-[180px] relative shrink-0">
          <div
            v-if="loading"
            class="w-full h-full rounded-full border-8 border-zinc-200 dark:border-zinc-800 animate-pulse"
          />

          <ClientOnly v-else>
            <VChart :option="donutChartOption" autoresize class="w-full h-full" />
            <template #fallback>
              <div class="w-full h-full rounded-full border-8 border-zinc-100 dark:border-zinc-800 animate-pulse" />
            </template>
          </ClientOnly>

          <!-- Centered Total Number -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              {{ formattedChannelTotal }}
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">
              TOTAL
            </span>
          </div>
        </div>

        <!-- Channel List -->
        <div class="w-full flex-1 min-w-0 space-y-2">
          <div
            v-for="channel in parsedChannels"
            :key="channel.name"
            class="p-3.5 rounded-2xl bg-subtle-bg dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <WhatsAppIcon v-if="channel.isWhatsApp" class="w-7 h-7 shrink-0" />
              <div
                v-else
                :class="[
                  'w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0',
                  channel.badgeBgClass
                ]"
              >
                <component :is="channel.icon" class="w-4 h-4" />
              </div>
              <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {{ channel.name }}
              </span>
            </div>
            <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
              {{ channel.percentage }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Mail,
  MessageSquare,
  Send,
  TrendingUp
} from '@lucide/vue';
import { computed } from 'vue';
import PillTabs from '~/components/PillTabs.vue';
import { useDashboardStore } from '~/stores/dashboard';
import WhatsAppIcon from '../icons/WhatsAppIcon.vue';

const props = defineProps({
  /**
   * API Volume Data payload:
   * {
   *   dates: string[],
   *   incoming: number[],
   *   resolved: number[]
   * }
   */
  volumeData: {
    type: Object,
    default: () => ({})
  },
  /**
   * API Channel Data payload:
   * {
   *   total?: number | string,
   *   subtitle?: string,
   *   channels?: Array<{ name: string, count: number, percentage?: string, color?: string }>
   * }
   */
  channelData: {
    type: Object,
    default: () => ({})
  },
  /**
   * Active filter period (can use v-model:period)
   */
  period: {
    type: String,
    default: 'Today'
  },
  /**
   * Available period buttons
   */
  periods: {
    type: Array,
    default: () => ['Today', '7 Days', '30 Days']
  },
  /**
   * Async loading state for API fetching
   */
  loading: {
    type: Boolean,
    default: false
  }
})

const filterPeriods = computed(() => props.periods)
const store = useDashboardStore()
const internalPeriod = computed(() => store.range.label)
const isCustomPeriod = computed(() => {
  return !filterPeriods.value.includes(internalPeriod.value)
})

function setPeriod(newPeriod) {
  store.setRange(newPeriod)
}

// Icon mapper for popular channels
function resolveChannelIcon(name = '') {
  const lower = name.toLowerCase()
  if (lower.includes('telegram')) return Send
  if (lower.includes('mail') || lower.includes('email')) return Mail
  return MessageSquare
}

function resolveChannelBadge(name = '') {
  const lower = name.toLowerCase()
  if (lower.includes('whatsapp')) return 'bg-emerald-500'
  if (lower.includes('messenger')) return 'bg-blue-600'
  if (lower.includes('telegram')) return 'bg-sky-500'
  if (lower.includes('instagram')) return 'bg-pink-600'
  return 'bg-primary-green'
}

// 1. Processed Channel Mix Data
const defaultChannelPeriodData = {
  'Today': {
    total: 142,
    subtitle: 'Today',
    channels: [
      {
        name: 'WhatsApp',
        count: 142,
        percentage: '100.0%',
        color: '#22C55E'
      }
    ]
  },
  '7 Days': {
    total: 2157,
    subtitle: 'Last 7 days',
    channels: [
      {
        name: 'WhatsApp',
        count: 2157,
        percentage: '100.0%',
        color: '#22C55E'
      }
    ]
  },
  '30 Days': {
    total: 8490,
    subtitle: 'Last 30 days',
    channels: [
      {
        name: 'WhatsApp',
        count: 8490,
        percentage: '100.0%',
        color: '#22C55E'
      }
    ]
  }
}

const currentChannelData = computed(() => {
  // 1. If API provides period-keyed dictionary: { 'Today': {...}, '7 Days': {...} }
  if (props.channelData?.[internalPeriod.value]) {
    return props.channelData[internalPeriod.value]
  }
  // 2. If API provides flat { total, channels }
  if (props.channelData?.channels) {
    return props.channelData
  }
  // 3. Dynamic default period dataset
  return defaultChannelPeriodData[internalPeriod.value] || defaultChannelPeriodData['7 Days']
})

const parsedChannels = computed(() => {
  const rawList = currentChannelData.value.channels || []
  const totalCount = rawList.reduce((acc, c) => acc + (Number(c.count) || 0), 0) || 1

  return rawList.map((item) => {
    const count = Number(item.count) || 0
    const pct = item.percentage || `${((count / totalCount) * 100).toFixed(1)}%`
    return {
      name: item.name || 'Unknown',
      count,
      percentage: pct,
      color: item.color || '#22C55E',
      isWhatsApp: (item.name || '').toLowerCase().includes('whatsapp'),
      icon: item.icon || resolveChannelIcon(item.name),
      badgeBgClass: item.badgeBgClass || resolveChannelBadge(item.name)
    }
  })
})

const channelTotalRaw = computed(() => {
  if (currentChannelData.value.total !== undefined) {
    return currentChannelData.value.total
  }
  return parsedChannels.value.reduce((acc, c) => acc + c.count, 0)
})

const formattedChannelTotal = computed(() => {
  if (typeof channelTotalRaw.value === 'number') {
    return new Intl.NumberFormat('en-US').format(channelTotalRaw.value)
  }
  return String(channelTotalRaw.value || '0')
})

const channelSubtitle = computed(() => {
  if (currentChannelData.value.subtitle) return currentChannelData.value.subtitle
  if (internalPeriod.value === 'Today') return 'Today'
  return `Last ${internalPeriod.value.toLowerCase()}`
})

// Period fallback dataset if custom props.volumeData is not provided
const defaultPeriodData = {
  'Today': {
    dates: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    incoming: [12, 6, 28, 95, 76, 38, 14],
    resolved: [0, 0, 0, 0, 0, 0, 0]
  },
  '7 Days': {
    dates: ['Oct 27', 'Oct 28', 'Oct 29', 'Oct 30', 'Oct 31', 'Nov 1', 'Nov 2'],
    incoming: [230, 210, 245, 220, 240, 245, 85],
    resolved: [0, 0, 0, 0, 0, 0, 0]
  },
  '30 Days': {
    dates: ['Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30', 'Nov 2'],
    incoming: [310, 280, 390, 420, 380, 450, 340],
    resolved: [0, 0, 0, 0, 0, 0, 0]
  }
}

// 2. Line Chart (Conversation Volume) ECharts Config
const lineChartOption = computed(() => {
  const current = props.volumeData?.dates
    ? props.volumeData
    : (defaultPeriodData[internalPeriod.value] || defaultPeriodData['7 Days'])

  const dates = current.dates || []
  const incoming = current.incoming || []
  const resolved = current.resolved || []

  // Calculate dynamic upper bound for Y-axis
  const maxIncoming = Math.max(...incoming, 0)
  const yMax = maxIncoming > 0 ? Math.max(500, Math.ceil(maxIncoming / 100) * 100) : 500

  return {
    animationDuration: 400,
    animationDurationUpdate: 300,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#E4E4E7',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#18181B', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); border-radius: 12px;'
    },
    grid: {
      left: 36,
      right: '3%',
      top: '12%',
      bottom: '5%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#A1A1AA',
        fontSize: 11,
        margin: 12
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yMax,
      interval: yMax / 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#A1A1AA',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#F1F3F6'
        }
      }
    },
    series: [
      {
        name: 'Incoming',
        type: 'line',
        smooth: 0.35,
        data: incoming,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6.5,
        itemStyle: {
          color: '#3B82F6',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        lineStyle: {
          width: 2.5,
          color: '#3B82F6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.22)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
            ]
          }
        }
      },
      {
        name: 'Resolved',
        type: 'line',
        smooth: 0.35,
        data: resolved,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6.5,
        itemStyle: {
          color: '#10B981',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        lineStyle: {
          width: 2.5,
          color: '#10B981'
        }
      }
    ]
  }
})

// 3. Donut Chart (Channel Mix) ECharts Config
const donutChartOption = computed(() => {
  const chartData = parsedChannels.value.map((item) => ({
    name: item.name,
    value: item.count,
    itemStyle: { color: item.color }
  }))

  return {
    tooltip: {
      show: true,
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#E4E4E7',
      borderWidth: 1,
      padding: [7, 16],
      extraCssText: 'border-radius: 9999px; box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.08); pointer-events: none; white-space: nowrap; z-index: 50;',
      position: (point, params, dom, rect, size) => {
        // Horizontally center with the donut ring and place right at the top
        const x = (size.viewSize[0] - size.contentSize[0]) / 2
        return [x, -14]
      },
      formatter: (params) => {
        const countFormatted = new Intl.NumberFormat('en-US').format(params.value || 0)
        const percent = params.percent !== undefined ? Number(params.percent).toFixed(1) : '100.0'
        return `<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 1.2;">
          <strong style="font-weight: 700; color: #09090B;">${params.name}</strong>
          <span style="color: #64748B; font-weight: 500;">${percent}% · ${countFormatted} conversations</span>
        </div>`
      }
    },
    series: [
      {
        name: 'Channel Mix',
        type: 'pie',
        radius: ['68%', '88%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { scale: false },
        data: chartData
      }
    ]
  }
})
</script>
