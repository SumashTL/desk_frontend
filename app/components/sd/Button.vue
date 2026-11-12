<template>
  <component :is="to ? NuxtLink : 'button'" :to="to" :type="to ? undefined : type" :disabled="disabled || loading"
    :class="['inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[.98]', sizes[size], variants[variant], block && 'w-full']">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <component :is="icon" v-else-if="icon" :class="size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
    <slot />
  </component>
</template>
<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import { NuxtLink } from '#components'
withDefaults(defineProps<{
  variant?: 'primary' | 'quiet' | 'ghost' | 'danger' | 'soft' | 'danger-soft'
  size?: 'xs' | 'sm' | 'md' | 'icon' | 'icon-sm'
  type?: 'button' | 'submit'
  icon?: any
  loading?: boolean
  disabled?: boolean
  block?: boolean
  to?: string
}>(), { variant: 'quiet', size: 'md', type: 'button' })
const sizes = {
  xs: 'h-7 px-2.5 text-[11.5px]',
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-[13px]',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}
const variants = {
  primary: 'bg-[var(--sd-primary)] text-[var(--sd-on-primary)] shadow-sm hover:bg-[var(--sd-primary-hover)]',
  quiet: 'border border-[var(--sd-border)] bg-[var(--sd-surface)] text-[var(--sd-text)] hover:border-[var(--sd-border-strong)] hover:bg-[var(--sd-surface-soft)]',
  ghost: 'text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]',
  soft: 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary-ink)] hover:brightness-95',
  danger: 'bg-[var(--sd-danger)] text-white hover:brightness-95',
  'danger-soft': 'text-[var(--sd-danger)] hover:bg-[color-mix(in_srgb,var(--sd-danger)_10%,transparent)]',
}
</script>
