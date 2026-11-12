<template>
  <span :class="['inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5', tones[tone]]">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full bg-current" /><slot />
  </span>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'violet', dot?: boolean }>(), { tone: 'gray' })
const tones = {
  green: 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary-ink)]',
  blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  amber: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
  red: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  gray: 'bg-[var(--sd-surface-strong)] text-[var(--sd-muted)]',
}
</script>
