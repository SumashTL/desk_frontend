<template>
  <div class="relative">
    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sd-faint)]" />
    <input :value="modelValue" type="search" :placeholder="placeholder" class="sd-input !pl-9" @input="e => $emit('update:modelValue', (e.target as HTMLInputElement).value)">
  </div>
</template>
<script setup lang="ts">
import { Search } from '@lucide/vue'
withDefaults(defineProps<{ modelValue: string, placeholder?: string }>(), { placeholder: 'Search…' })
defineEmits<{ 'update:modelValue': [string] }>()
</script>
