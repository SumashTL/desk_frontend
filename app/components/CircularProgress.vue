<template>
  <div
    :class="cn('relative inline-flex items-center justify-center select-none', wrapperSizeClass, props.class)"
    :style="wrapperStyle"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
    :aria-valuemin="0"
    :aria-valuemax="100"
  >
    <svg
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      class="w-full h-full -rotate-90 transform"
      :class="{ 'animate-spin': indeterminate }"
    >
      <defs>
        <!-- Optional sleek brand gradient for primary variant -->
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="gradientColors.start" />
          <stop offset="100%" :stop-color="gradientColors.end" />
        </linearGradient>
      </defs>

      <!-- Background Track -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke-width="strokeWidth"
        :class="cn('stroke-zinc-200 dark:stroke-zinc-700/80 transition-colors', trackClass)"
      />

      <!-- Active Indicator Track -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="useGradient ? `url(#${gradientId})` : undefined"
        :stroke-width="strokeWidth"
        :stroke-linecap="rounded ? 'round' : 'butt'"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :class="cn(
          'transition-[stroke-dashoffset] duration-500 ease-out',
          !useGradient && variantClasses[variant],
          indicatorClass
        )"
      />
    </svg>

    <!-- Center Content / Slot -->
    <div
      v-if="$slots.default || showValue"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1"
    >
      <slot :value="normalizedValue">
        <span
          :class="cn(
            'font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none transition-colors inline-flex items-baseline justify-center',
            valueSizeClass,
            textClass
          )"
        >
          {{ normalizedValue }}<span v-if="showPercent" class="text-[0.78em] font-bold opacity-90 ml-0.5">%</span>
        </span>
        <span
          v-if="label"
          class="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[85%]"
        >
          {{ label }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  value: {
    type: Number,
    default: undefined
  },
  size: {
    type: [Number, String],
    default: 'md' // 'sm' | 'md' | 'lg' | 'xl' or number in px (e.g. 72, 96, 120)
  },
  strokeWidth: {
    type: Number,
    default: undefined
  },
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
  },
  rounded: {
    type: Boolean,
    default: true
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showPercent: {
    type: Boolean,
    default: true
  },
  indeterminate: {
    type: Boolean,
    default: false
  },
  useGradient: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  trackClass: {
    type: String,
    default: ''
  },
  indicatorClass: {
    type: String,
    default: ''
  },
  textClass: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  }
})

const uid = useId()
const gradientId = `circular-progress-grad-${uid}`

// Size presets
const sizePresets = {
  xs: { px: 36, stroke: 3.5, text: 'text-[11px]' },
  sm: { px: 48, stroke: 4.5, text: 'text-[13px]' },
  md: { px: 72, stroke: 6, text: 'text-base' },
  lg: { px: 96, stroke: 8, text: 'text-xl' },
  xl: { px: 128, stroke: 10, text: 'text-2xl' }
}

const resolvedPx = computed(() => {
  if (typeof props.size === 'number') return props.size
  if (sizePresets[props.size]) return sizePresets[props.size].px
  const parsed = Number.parseInt(props.size, 10)
  return Number.isNaN(parsed) ? 76 : parsed
})

const wrapperSizeClass = computed(() => {
  if (typeof props.size === 'string' && sizePresets[props.size]) {
    const map = {
      xs: 'w-9 h-9',
      sm: 'w-12 h-12',
      md: 'w-[72px] h-[72px]',
      lg: 'w-24 h-24',
      xl: 'w-32 h-32'
    }
    return map[props.size]
  }
  return ''
})

const wrapperStyle = computed(() => {
  if (typeof props.size === 'number' || !sizePresets[props.size]) {
    return {
      width: `${resolvedPx.value}px`,
      height: `${resolvedPx.value}px`
    }
  }
  return {}
})

const valueSizeClass = computed(() => {
  if (typeof props.size === 'string' && sizePresets[props.size]) {
    return sizePresets[props.size].text
  }
  const px = resolvedPx.value
  if (px <= 40) return 'text-[10px]'
  if (px <= 48) return 'text-xs'
  if (px <= 64) return 'text-sm'
  if (px <= 88) return 'text-base'
  if (px <= 112) return 'text-xl'
  return 'text-2xl'
})

// Normalized value between 0 and 100
const normalizedValue = computed(() => {
  const raw = props.value !== undefined ? props.value : props.modelValue
  if (Number.isNaN(raw)) return 0
  return Math.min(100, Math.max(0, Math.round(raw)))
})

// SVG calculations (based on 100x100 virtual viewport)
const viewBoxSize = 100
const center = viewBoxSize / 2

const strokeWidth = computed(() => {
  if (props.strokeWidth !== undefined) {
    // scale to viewBox
    return (props.strokeWidth / resolvedPx.value) * viewBoxSize
  }
  const preset = typeof props.size === 'string' ? sizePresets[props.size] : null
  const defaultStroke = preset ? preset.stroke : Math.max(4, resolvedPx.value * 0.085)
  return (defaultStroke / resolvedPx.value) * viewBoxSize
})

const radius = computed(() => {
  return center - strokeWidth.value / 2
})

const circumference = computed(() => {
  return 2 * Math.PI * radius.value
})

const dashOffset = computed(() => {
  if (props.indeterminate) {
    return circumference.value * 0.75
  }
  return circumference.value - (normalizedValue.value / 100) * circumference.value
})

// Variant colors matching codebase design system
const variantClasses = {
  primary: 'stroke-primary-green dark:stroke-primary-green',
  success: 'stroke-emerald-600 dark:stroke-emerald-500',
  danger: 'stroke-rose-600 dark:stroke-rose-500',
  warning: 'stroke-amber-500 dark:stroke-amber-400',
  info: 'stroke-sky-600 dark:stroke-sky-400',
  neutral: 'stroke-zinc-800 dark:stroke-zinc-200'
}

const gradientColors = computed(() => {
  switch (props.variant) {
    case 'primary':
      return { start: '#17900D', end: '#005700' }
    case 'success':
      return { start: '#10B981', end: '#059669' }
    case 'danger':
      return { start: '#F43F5E', end: '#BE123C' }
    case 'warning':
      return { start: '#FBBF24', end: '#D97706' }
    case 'info':
      return { start: '#38BDF8', end: '#0284C7' }
    default:
      return { start: '#17900D', end: '#005700' }
  }
})
</script>

