<template>
  <div class="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[var(--sd-surface-strong)] p-1" role="tablist">
    <button v-for="t in tabs" :key="t.value" type="button" role="tab" :aria-selected="modelValue === t.value"
      :class="['flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition', modelValue === t.value ? 'bg-[var(--sd-surface)] text-[var(--sd-text)] shadow-sm' : 'text-[var(--sd-muted)] hover:text-[var(--sd-text)]']"
      @click="$emit('update:modelValue', t.value)">
      <component :is="t.icon" v-if="t.icon" class="h-3.5 w-3.5" />{{ t.label }}
      <span v-if="t.count" :class="['rounded-full px-1.5 text-[10.5px] leading-[18px]', modelValue === t.value ? 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary-ink)]' : 'bg-[var(--sd-surface)] text-[var(--sd-muted)]']">{{ t.count > 999 ? '999+' : t.count }}</span>
    </button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ modelValue: string, tabs: { value: string, label: string, count?: number | null, icon?: any }[] }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>
