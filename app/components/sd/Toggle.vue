<template>
  <div class="flex items-start justify-between gap-4">
    <div v-if="label || description" class="min-w-0">
      <p class="text-[13px] font-semibold">{{ label }}</p>
      <p v-if="description" class="mt-0.5 text-[12px] leading-5 text-[var(--sd-muted)]">{{ description }}</p>
    </div>
    <SwitchRoot :model-value="modelValue" :disabled="disabled" :aria-label="label"
      class="relative mt-0.5 inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full bg-[var(--sd-border-strong)] transition data-[state=checked]:bg-[var(--sd-primary)] disabled:cursor-not-allowed disabled:opacity-50"
      @update:model-value="v => $emit('update:modelValue', v)">
      <SwitchThumb class="block h-[18px] w-[18px] translate-x-[2px] rounded-full bg-white shadow transition data-[state=checked]:translate-x-[20px]" />
    </SwitchRoot>
  </div>
</template>
<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
defineProps<{ modelValue: boolean, label?: string, description?: string, disabled?: boolean }>()
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>
