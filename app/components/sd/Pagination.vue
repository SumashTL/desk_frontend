<template>
  <div v-if="count > 0" class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[12.5px] text-[var(--sd-muted)]">
    <span>{{ from }}–{{ to }} of {{ num(count) }}</span>
    <div v-if="pages > 1" class="flex items-center gap-1">
      <SdButton size="icon-sm" variant="ghost" :icon="ChevronLeft" :disabled="page <= 1" aria-label="Previous page" @click="$emit('update:page', page - 1)" />
      <span class="px-2 font-semibold text-[var(--sd-text)]">{{ page }} / {{ pages }}</span>
      <SdButton size="icon-sm" variant="ghost" :icon="ChevronRight" :disabled="page >= pages" aria-label="Next page" @click="$emit('update:page', page + 1)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
const props = withDefaults(defineProps<{ page: number, count: number, pageSize?: number }>(), { pageSize: 25 })
defineEmits<{ 'update:page': [number] }>()
const pages = computed(() => Math.max(1, Math.ceil(props.count / props.pageSize)))
const from = computed(() => (props.page - 1) * props.pageSize + 1)
const to = computed(() => Math.min(props.count, props.page * props.pageSize))
</script>
