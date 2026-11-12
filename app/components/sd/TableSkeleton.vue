<template>
  <div class="space-y-3 p-4">
    <div v-for="i in rows" :key="i" class="flex items-center gap-3">
      <div class="sd-skeleton h-9 w-9 rounded-full" />
      <div class="flex-1 space-y-2"><div class="sd-skeleton h-3 w-1/3" /><div class="sd-skeleton h-3 w-1/5" /></div>
      <div class="sd-skeleton hidden h-3 w-24 sm:block" />
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>
