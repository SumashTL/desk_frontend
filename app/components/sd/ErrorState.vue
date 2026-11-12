<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div class="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--sd-danger)_12%,transparent)] text-[var(--sd-danger)]"><CloudOff class="h-5 w-5" /></div>
    <p class="text-sm font-semibold">Could not load this</p>
    <p class="mt-1 max-w-sm text-[12.5px] text-[var(--sd-muted)]">{{ message }}</p>
    <SdButton class="mt-4" size="sm" :icon="RefreshCw" @click="$emit('retry')">Try again</SdButton>
  </div>
</template>
<script setup lang="ts">
import { CloudOff, RefreshCw } from '@lucide/vue'
defineProps<{ message?: string | null }>()
defineEmits(['retry'])
</script>
