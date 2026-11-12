<template>
  <div class="sd-card flex items-start gap-3 p-4">
    <div v-if="icon" :class="['hidden h-10 w-10 sm:grid shrink-0 place-items-center rounded-xl', tones[tone]]"><component :is="icon" class="h-[18px] w-[18px]" /></div>
    <div class="min-w-0">
      <p class="truncate text-[12px] font-medium text-[var(--sd-muted)]">{{ label }}</p>
      <p v-if="loading" class="sd-skeleton mt-2 h-6 w-16" />
      <p v-else class="mt-1 text-[22px] font-bold leading-tight tracking-tight">{{ value }}</p>
      <p v-if="hint" class="mt-0.5 truncate text-[11.5px] text-[var(--sd-faint)]">{{ hint }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ label: string, value?: string | number | null, hint?: string, icon?: any, tone?: 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'violet', loading?: boolean }>(), { tone: 'green' })
const tones = {
  green: 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary)]',
  blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  gray: 'bg-[var(--sd-surface-strong)] text-[var(--sd-muted)]',
}
</script>
