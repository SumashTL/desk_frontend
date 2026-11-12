<template>
  <label class="block">
    <span v-if="label" class="sd-label">{{ label }}<span v-if="required" class="text-[var(--sd-danger)]"> *</span><span v-if="optional" class="font-normal text-[var(--sd-faint)]"> (optional)</span></span>
    <slot />
    <p v-if="error" class="sd-error">{{ error }}</p>
    <p v-else-if="hint" class="sd-hint">{{ hint }}</p>
  </label>
</template>
<script setup lang="ts">
defineProps<{ label?: string, error?: string, hint?: string, required?: boolean, optional?: boolean }>()
</script>
