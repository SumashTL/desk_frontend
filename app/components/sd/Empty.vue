<template>
  <div :class="['flex flex-col items-center justify-center px-6 text-center', compact ? 'py-8' : 'py-14']">
    <div class="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--sd-primary-soft)] text-[var(--sd-primary)]">
      <component :is="icon || Inbox" class="h-5 w-5" />
    </div>
    <p class="text-sm font-semibold">{{ title }}</p>
    <p v-if="text" class="mt-1 max-w-sm text-[12.5px] leading-5 text-[var(--sd-muted)]">{{ text }}</p>
    <div v-if="$slots.default" class="mt-4"><slot /></div>
  </div>
</template>
<script setup lang="ts">
import { Inbox } from '@lucide/vue'
defineProps<{ title: string, text?: string, icon?: any, compact?: boolean }>()
</script>
