<template>
  <div class="w-full relative h-[8px] flex items-center overflow-hidden">
    <ClientOnly>
      <VChart :option="chartOption" autoresize class="w-full h-full" />
      <template #fallback>
        <div class="w-full h-[6px] bg-zinc-200/70 dark:bg-zinc-700/80 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="isOnline && progress > 0 ? 'bg-primary-green' : 'bg-zinc-400 dark:bg-zinc-500'"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 6,
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  activeColor: {
    type: String,
    default: '#17900D',
  },
  inactiveColor: {
    type: String,
    default: '#94A3B8',
  },
  trackColor: {
    type: String,
    default: '#E2E8F0',
  },
})

const chartOption = computed(() => ({
  grid: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    containLabel: false,
  },
  xAxis: {
    type: 'value',
    show: false,
    min: 0,
    max: 100,
  },
  yAxis: {
    type: 'category',
    show: false,
    data: ['progress'],
  },
  series: [
    {
      type: 'bar',
      data: [Math.min(100, Math.max(0, props.progress))],
      barWidth: props.height,
      showBackground: true,
      backgroundStyle: {
        color: props.trackColor,
        borderRadius: [999, 999, 999, 999],
      },
      itemStyle: {
        color: props.isOnline && props.progress > 0 ? props.activeColor : props.inactiveColor,
        borderRadius: [999, 999, 999, 999],
      },
      animationDuration: 600,
    },
  ],
}))
</script>
