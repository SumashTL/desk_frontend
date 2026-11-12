<template>
  <div class="relative">
    <input :value="modelValue" :type="show ? 'text' : 'password'" :autocomplete="autocomplete" :placeholder="placeholder"
      :class="['sd-input !pr-10', invalid && 'is-invalid']" @input="e => $emit('update:modelValue', (e.target as HTMLInputElement).value)">
    <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--sd-faint)] hover:text-[var(--sd-text)]" :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
      <EyeOff v-if="show" class="h-4 w-4" /><Eye v-else class="h-4 w-4" />
    </button>
  </div>
</template>
<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
withDefaults(defineProps<{ modelValue: string, autocomplete?: string, placeholder?: string, invalid?: boolean }>(), { autocomplete: 'current-password', placeholder: '••••••••' })
defineEmits<{ 'update:modelValue': [string] }>()
const show = ref(false)
</script>
