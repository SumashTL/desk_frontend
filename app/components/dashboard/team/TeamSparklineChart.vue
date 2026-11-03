<template>
  <div class="w-9 h-5 shrink-0 flex items-center justify-center">
    <ClientOnly>
      <VChart :option="chartOption" autoresize class="w-full h-full" />
      <template #fallback>
        <div class="flex items-end gap-1 h-5">
          <span
            v-for="(val, idx) in data"
            :key="idx"
            class="w-1 rounded-full"
            :class="isOnline ? 'bg-primary-green' : 'bg-zinc-300 dark:bg-zinc-600'"
            :style="{ height: `${val}%` }"
          />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [30, 50, 75, 100, 60],
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
})

const chartOption = computed(() => ({
  grid: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  xAxis: {
    type: 'category',
    show: false,
    data: [1, 2, 3, 4, 5],
  },
  yAxis: {
    type: 'value',
    show: false,
    min: 0,
    max: 100,
  },
  series: [
    {
      type: 'bar',
      data: props.data,
      barWidth: 4,
      itemStyle: {
        color: props.isOnline ? '#17900D' : '#A1A1AA',
        borderRadius: [2, 2, 2, 2],
      },
      animationDuration: 500,
    },
  ],
}))
</script>

