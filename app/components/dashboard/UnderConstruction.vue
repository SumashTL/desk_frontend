<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-zinc-900">{{ title }}</h1>
      <p class="text-sm text-zinc-500 mt-0.5">{{ subtitle }}</p>
    </div>

    <div class="card p-12 flex flex-col items-center justify-center text-center min-h-[420px]">
      <div class="w-14 h-14 rounded-2xl bg-stat-icon-bg flex items-center justify-center text-primary-green mb-4">
        <Construction class="w-7 h-7" />
      </div>
      <h2 class="text-xl font-bold text-zinc-900">
        {{ title }} is Under Construction
      </h2>
      <p class="text-sm text-zinc-500 max-w-sm mt-1.5">
        This page is currently under construction. Content will be added here soon.
      </p>
    </div>
  </div>
</template>

<script setup>
import { Construction } from '@lucide/vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: 'Oct 27 – Nov 2, 2026'
  }
})
</script>

