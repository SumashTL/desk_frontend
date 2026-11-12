<template>
  <div class="w-full max-w-[420px]">
    <div class="sd-card p-7 sm:p-9">
      <p v-if="eyebrow" class="mb-3 inline-flex rounded-full bg-[var(--sd-primary-soft)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[.14em] text-[var(--sd-primary-ink)]">{{ eyebrow }}</p>
      <h1 class="text-[26px] font-extrabold leading-tight tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="mt-2 text-[13.5px] leading-6 text-[var(--sd-muted)]">{{ subtitle }}</p>
      <div class="mt-6"><slot /></div>
    </div>
    <div v-if="$slots.footer" class="mt-5 text-center text-[13px] text-[var(--sd-muted)]"><slot name="footer" /></div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title: string, subtitle?: string, eyebrow?: string }>()
</script>
