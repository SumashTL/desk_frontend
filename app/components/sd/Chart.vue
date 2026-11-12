<template>
  <div :style="{ height: `${height}px` }" class="w-full">
    <VChart v-if="ready" :option="themed" autoresize class="h-full w-full" />
  </div>
</template>
<script setup lang="ts">
/** Line/bar chart with SumashDesk colours. series: [{ name, data, type?: 'line'|'bar', color? }] */
const props = withDefaults(defineProps<{ labels: string[], series: { name: string, data: number[], type?: 'line' | 'bar', color?: string, stack?: string }[], height?: number }>(), { height: 260 })
const { isDark } = useTheme()
const ready = ref(false)
onMounted(() => { ready.value = true })
const palette = ['#13824b', '#2f6fd6', '#c27c0e', '#8b5cf6', '#d93a3a']
const themed = computed(() => {
  const text = isDark.value ? '#93a69c' : '#6b7d74'
  const grid = isDark.value ? '#26352d' : '#e9efec'
  return {
    color: props.series.map((s, i) => s.color || palette[i % palette.length]),
    grid: { left: 8, right: 12, top: 30, bottom: 4, containLabel: true },
    legend: { top: 0, right: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: text, fontSize: 11 } },
    tooltip: { trigger: 'axis', backgroundColor: isDark.value ? '#151f1a' : '#fff', borderColor: grid, textStyle: { color: isDark.value ? '#e3ece7' : '#14231c', fontSize: 12 } },
    xAxis: { type: 'category', data: props.labels, boundaryGap: props.series.some(s => s.type === 'bar'), axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: text, fontSize: 11 } },
    series: props.series.map(s => ({
      name: s.name, type: s.type || 'line', data: s.data, smooth: true, symbol: 'circle', symbolSize: 5, stack: s.stack,
      barMaxWidth: 22, itemStyle: { borderRadius: s.type === 'bar' ? [4, 4, 0, 0] : 0 },
      areaStyle: s.type === 'bar' ? undefined : { opacity: 0.08 },
    })),
  }
})
</script>
