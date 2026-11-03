<template>
  <div class="w-full relative overflow-hidden" :style="{ height: `${height}px` }">
    <ClientOnly>
      <VChart :option="chartOption" autoresize class="w-full h-full" />
      <template #fallback>
        <div class="w-full h-full rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-700">
          <div
            v-for="(seg, idx) in normalizedSegments"
            :key="idx"
            class="h-full transition-all"
            :style="{
              width: `${seg.percentage}%`,
              backgroundColor: seg.color
            }"
          />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  segments: {
    type: Array,
    required: true,
    default: () => [
      { name: 'Online', value: 5, color: '#17900D' },
      { name: 'Offline', value: 3, color: '#CBD5E1' },
    ],
  },
  height: {
    type: Number,
    default: 8,
  },
})

const totalValue = computed(() => {
  return props.segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0)
})

const normalizedSegments = computed(() => {
  const total = totalValue.value || 1
  return props.segments.map((seg) => ({
    name: seg.name || '',
    value: Number(seg.value) || 0,
    color: seg.color || '#CBD5E1',
    percentage: Math.round(((Number(seg.value) || 0) / total) * 100),
  }))
})

const chartOption = computed(() => {
  const total = totalValue.value || 1
  const nonZeroSegments = normalizedSegments.value.filter((s) => s.value > 0)

  return {
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    xAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: total,
    },
    yAxis: {
      type: 'category',
      show: false,
      data: ['ratio'],
    },
    series: props.segments.map((segment) => {
      const segVal = Number(segment.value) || 0
      const activeIdx = nonZeroSegments.findIndex((s) => s.name === segment.name)
      const isFirst = activeIdx === 0
      const isLast = activeIdx === nonZeroSegments.length - 1

      let radius = [0, 0, 0, 0]
      if (isFirst && isLast) {
        radius = [999, 999, 999, 999]
      } else if (isFirst) {
        radius = [999, 0, 0, 999]
      } else if (isLast) {
        radius = [0, 999, 999, 0]
      }

      return {
        name: segment.name,
        type: 'bar',
        stack: 'total',
        data: [segVal],
        barWidth: props.height,
        itemStyle: {
          color: segment.color,
          borderRadius: radius,
        },
        animationDuration: 600,
      }
    }),
  }
})
</script>

