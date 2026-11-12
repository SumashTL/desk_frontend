<template>
  <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="text-[22px] font-bold leading-tight tracking-tight sm:text-[24px]">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 max-w-2xl text-[13px] leading-5 text-[var(--sd-muted)]">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2"><slot /></div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()
</script>
