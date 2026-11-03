<template>
  <div
    :class="[
      'inline-flex items-center p-1 rounded-full bg-subtle-bg dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0 select-none',
      containerClass
    ]"
    role="tablist"
  >
    <button
      v-for="item in normalizedItems"
      :key="item.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.value"
      :disabled="disabled || item.disabled"
      :class="[
        'flex items-center justify-center font-semibold rounded-full transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-green/20 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        modelValue === item.value
          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/70 dark:border-zinc-700'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-transparent',
        itemClass
      ]"
      @click="selectItem(item.value)"
    >
      <slot name="item" :item="item" :active="modelValue === item.value">
        <component
          :is="item.icon"
          v-if="item.icon"
          class="w-3.5 h-3.5 mr-1.5 shrink-0"
        />
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge !== null && item.badge !== undefined"
          class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold"
          :class="modelValue === item.value ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200' : 'bg-zinc-200/70 text-zinc-600'"
        >
          {{ item.badge }}
        </span>
      </slot>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  size: {
    type: String,
    default: 'default', // 'sm' | 'default' | 'md' | 'lg'
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: [String, Array, Object],
    default: '',
  },
  itemClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const normalizedItems = computed(() => {
  return props.items.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return {
        label: item.label ?? String(item.value),
        value: item.value,
        disabled: Boolean(item.disabled),
        icon: item.icon ?? null,
        badge: item.badge ?? null,
      }
    }
    return {
      label: String(item),
      value: item,
      disabled: false,
      icon: null,
      badge: null,
    }
  })
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-6 px-2.5 text-[11px]'
    case 'sm':
      return 'h-6.5 px-3 text-xs'
    case 'md':
      return 'h-8 px-4 text-xs'
    case 'lg':
      return 'h-9 px-5 text-sm'
    case 'default':
    default:
      return 'w-16 sm:w-[72px] h-7 text-xs'
  }
})

const selectItem = (value) => {
  if (props.disabled) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

