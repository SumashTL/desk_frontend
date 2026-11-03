<template>
  <div ref="containerRef" class="relative inline-block text-left">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleOpen"
      :class="[
        'h-[42px] w-[190px] sm:w-[210px] shrink-0 px-3.5 sm:px-4 rounded-full border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-card-surface hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-green/20 select-none relative',
        isOpen ? 'ring-2 ring-primary-green/20 border-primary-green' : ''
      ]"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
    >
      <Calendar class="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
      <span class="truncate text-center">{{ displayLabel }}</span>

      <!-- Quick reset 'x' icon matching the screenshot -->
      <span
        v-if="canReset"
        @click.stop="handleQuickReset"
        class="absolute right-3 w-4 h-4 rounded-full flex items-center justify-center hover:bg-zinc-200/70 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        title="Reset date filter"
      >
        <X class="w-3 h-3 stroke-[2.5]" />
      </span>
    </button>

    <!-- Popover Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 z-50 w-[95vw] sm:w-[680px] md:w-[710px] max-w-[730px] bg-white dark:bg-card-surface rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-0 overflow-hidden font-sans select-none"
      >
        <!-- Main Body: Presets Sidebar + Custom Range Calendar -->
        <div class="flex flex-col sm:flex-row p-4 sm:p-5 gap-4 sm:gap-5">
          <!-- Left: Presets Sidebar -->
          <div class="w-full sm:w-44 shrink-0 flex flex-col pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-zinc-200/70 dark:border-zinc-800 pb-3 sm:pb-0">
            <div class="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase mb-3 px-2">
              PRESETS
            </div>

            <div class="space-y-1">
              <button
                v-for="item in primaryPresets"
                :key="item.id"
                type="button"
                @click="selectPreset(item.id)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                  activePreset === item.id
                    ? 'bg-[#ECF7EE] dark:bg-emerald-950/50 text-primary-green font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                ]"
              >
                <span>{{ item.label }}</span>
                <Check v-if="activePreset === item.id" class="w-4 h-4 text-primary-green stroke-[2.5]" />
              </button>

              <!-- Divider -->
              <div class="my-2 border-t border-zinc-200/60 dark:border-zinc-800/80 mx-1" />

              <button
                v-for="item in secondaryPresets"
                :key="item.id"
                type="button"
                @click="selectPreset(item.id)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                  activePreset === item.id
                    ? 'bg-[#ECF7EE] dark:bg-emerald-950/50 text-primary-green font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                ]"
              >
                <span>{{ item.label }}</span>
                <Check v-if="activePreset === item.id" class="w-4 h-4 text-primary-green stroke-[2.5]" />
              </button>
            </div>
          </div>

          <!-- Right: Custom Range Calendar Area -->
          <div class="flex-1 min-w-0">
            <div class="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase mb-3 px-1">
              CUSTOM RANGE
            </div>

            <!-- Soft Background Calendar Container -->
            <div class="bg-[#FAF9F5] dark:bg-zinc-800/40 rounded-2xl p-3.5 sm:p-4 border border-zinc-200/50 dark:border-zinc-800/60">
              <!-- Calendar Navigation & Month Titles -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-3">
                <!-- Month 1 Header -->
                <div class="flex items-center justify-between px-1">
                  <button
                    type="button"
                    @click="changeMonth(-1)"
                    class="p-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft class="w-4 h-4" />
                  </button>
                  <span class="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {{ month1Name }}
                  </span>
                  <!-- Empty spacer for symmetry on mobile, or spacer -->
                  <div class="w-6 sm:hidden" />
                </div>

                <!-- Month 2 Header -->
                <div class="hidden sm:flex items-center justify-between px-1">
                  <div class="w-6" />
                  <span class="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {{ month2Name }}
                  </span>
                  <button
                    type="button"
                    :disabled="isNextMonthDisabled"
                    @click="changeMonth(1)"
                    :class="[
                      'p-1 rounded-lg transition-colors',
                      isNextMonthDisabled
                        ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-30'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 cursor-pointer'
                    ]"
                    title="Next month"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Dual Month Calendars -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <!-- Month 1 Grid -->
                <div>
                  <div class="grid grid-cols-7 mb-2 text-center text-[11px] font-medium text-zinc-500">
                    <span v-for="w in weekdays" :key="w">{{ w }}</span>
                  </div>
                  <div class="grid grid-cols-7 gap-y-1 text-center text-xs">
                    <div
                      v-for="(day, idx) in month1Days"
                      :key="'m1-' + idx"
                      class="relative h-8 flex items-center justify-center"
                      :class="getDayRangeBgClass(day)"
                    >
                      <button
                        type="button"
                        :disabled="day.isFuture"
                        @click="handleDayClick(day)"
                        @mouseenter="!day.isFuture && (hoveredDate = day.date)"
                        :class="getDayButtonClass(day)"
                      >
                        {{ day.dayNumber }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Month 2 Grid -->
                <div class="hidden sm:block">
                  <div class="grid grid-cols-7 mb-2 text-center text-[11px] font-medium text-zinc-500">
                    <span v-for="w in weekdays" :key="w">{{ w }}</span>
                  </div>
                  <div class="grid grid-cols-7 gap-y-1 text-center text-xs">
                    <div
                      v-for="(day, idx) in month2Days"
                      :key="'m2-' + idx"
                      class="relative h-8 flex items-center justify-center"
                      :class="getDayRangeBgClass(day)"
                    >
                      <button
                        type="button"
                        :disabled="day.isFuture"
                        @click="handleDayClick(day)"
                        @mouseenter="!day.isFuture && (hoveredDate = day.date)"
                        :class="getDayButtonClass(day)"
                      >
                        {{ day.dayNumber }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Footer Action Bar -->
        <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3 flex items-center justify-between bg-zinc-50/50 dark:bg-card-surface">
          <div class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            {{ selectedDaysCount }} {{ selectedDaysCount === 1 ? 'day' : 'days' }} selected
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              :disabled="!hasSelection"
              @click="clearSelection"
              :class="[
                'text-xs font-bold px-3 py-1.5 transition-colors',
                hasSelection
                  ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer'
                  : 'text-zinc-400/50 dark:text-zinc-600 cursor-not-allowed'
              ]"
            >
              Clear
            </button>
            <button
              type="button"
              :disabled="!hasSelection"
              @click="applySelection"
              :class="[
                'text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-sm',
                hasSelection
                  ? 'bg-primary-green hover:bg-[#13760a] text-white active:scale-95 cursor-pointer'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
              ]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Calendar, Check, ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'Today'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'rangeChange'])

const isOpen = ref(false)
const containerRef = ref(null)

// Close when clicking outside
onClickOutside(containerRef, () => {
  isOpen.value = false
})

// Close on Escape key
const onKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// Preset definitions
const primaryPresets = [
  { id: 'Today', label: 'Today' },
  { id: '7 Days', label: '7 Days' },
  { id: '30 Days', label: '30 Days' },
  { id: '90 Days', label: '90 Days' }
]

const secondaryPresets = [
  { id: 'This month', label: 'This month' },
  { id: 'Last month', label: 'Last month' },
  { id: 'Last 14 days', label: 'Last 14 days' }
]

const activePreset = ref(props.modelValue || 'Today')
const displayLabel = ref(props.modelValue || 'Today')

// Date state
const today = new Date()
const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

const isFutureDate = (d) => {
  if (!d) return false
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return target > todayStart
}

const currentViewYear = ref(today.getFullYear())
const currentViewMonth = ref(today.getMonth()) // 0-indexed

const startDate = ref(null)
const endDate = ref(null)
const hoveredDate = ref(null)

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const month1Name = computed(() => {
  return `${monthNames[currentViewMonth.value]} ${currentViewYear.value}`
})

const month2Name = computed(() => {
  let m = currentViewMonth.value + 1
  let y = currentViewYear.value
  if (m > 11) {
    m = 0
    y++
  }
  return `${monthNames[m]} ${y}`
})

const isNextMonthDisabled = computed(() => {
  if (currentViewYear.value > today.getFullYear()) return true
  if (currentViewYear.value === today.getFullYear() && currentViewMonth.value >= today.getMonth()) {
    return true
  }
  return false
})

const changeMonth = (delta) => {
  if (delta > 0 && isNextMonthDisabled.value) return
  let m = currentViewMonth.value + delta
  let y = currentViewYear.value
  if (m < 0) {
    m = 11
    y--
  } else if (m > 11) {
    m = 0
    y++
  }
  currentViewMonth.value = m
  currentViewYear.value = y
}

// Helper to normalize date to YYYY-MM-DD
const toISODate = (d) => {
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Build grid cells for a given month
const generateMonthDays = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
  const days = []

  // Prev month filler
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      date: d,
      iso: toISODate(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isFuture: isFutureDate(d)
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d)
    days.push({
      date: dateObj,
      iso: toISODate(dateObj),
      dayNumber: d,
      isCurrentMonth: true,
      isFuture: isFutureDate(dateObj)
    })
  }

  // Next month filler to make 35 or 42 cells (5 or 6 rows)
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      date: d,
      iso: toISODate(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isFuture: isFutureDate(d)
    })
  }

  return days
}

const month1Days = computed(() => {
  return generateMonthDays(currentViewYear.value, currentViewMonth.value)
})

const month2Days = computed(() => {
  let m = currentViewMonth.value + 1
  let y = currentViewYear.value
  if (m > 11) {
    m = 0
    y++
  }
  return generateMonthDays(y, m)
})

// Selection calculation
const effectiveEndDate = computed(() => {
  if (endDate.value) return endDate.value
  if (startDate.value && hoveredDate.value) {
    return hoveredDate.value
  }
  return startDate.value
})

const selectedRange = computed(() => {
  if (!startDate.value) return { start: null, end: null }
  const s = startDate.value
  const e = effectiveEndDate.value || startDate.value
  if (s <= e) {
    return { start: s, end: e }
  } else {
    return { start: e, end: s }
  }
})

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const hasSelection = computed(() => {
  return Boolean(activePreset.value || startDate.value)
})

const selectedDaysCount = computed(() => {
  if (!startDate.value) return 0
  if (activePreset.value === 'Today') return 0
  const { start, end } = selectedRange.value
  if (!start || !end) return 0
  if (isSameDay(start, end)) return 0
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
})

// Preset click handler
const selectPreset = (presetId) => {
  activePreset.value = presetId
  const now = new Date()
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (presetId === 'Today') {
    startDate.value = t
    endDate.value = t
  } else if (presetId === '7 Days') {
    const s = new Date(t)
    s.setDate(s.getDate() - 6)
    startDate.value = s
    endDate.value = t
  } else if (presetId === 'Last 14 days') {
    const s = new Date(t)
    s.setDate(s.getDate() - 13)
    startDate.value = s
    endDate.value = t
  } else if (presetId === '30 Days') {
    const s = new Date(t)
    s.setDate(s.getDate() - 29)
    startDate.value = s
    endDate.value = t
  } else if (presetId === '90 Days') {
    const s = new Date(t)
    s.setDate(s.getDate() - 89)
    startDate.value = s
    endDate.value = t
  } else if (presetId === 'This month') {
    const s = new Date(t.getFullYear(), t.getMonth(), 1)
    startDate.value = s
    endDate.value = t
  } else if (presetId === 'Last month') {
    const s = new Date(t.getFullYear(), t.getMonth() - 1, 1)
    const e = new Date(t.getFullYear(), t.getMonth(), 0)
    startDate.value = s
    endDate.value = e
  }

  // Keep view aligned with selected start month
  if (startDate.value) {
    currentViewYear.value = startDate.value.getFullYear()
    currentViewMonth.value = startDate.value.getMonth()
  }
}

// Calendar day click handler
const handleDayClick = (day) => {
  if (day.isFuture) return
  activePreset.value = null
  const clicked = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate())

  if (!startDate.value || (startDate.value && endDate.value)) {
    // Start fresh selection
    startDate.value = clicked
    endDate.value = null
  } else {
    // Second click finishes range
    if (clicked < startDate.value) {
      endDate.value = startDate.value
      startDate.value = clicked
    } else {
      endDate.value = clicked
    }
  }
}

const getDayRangeBgClass = (day) => {
  if (day.isFuture) return ''
  if (!startDate.value) return ''
  const { start, end } = selectedRange.value
  if (!start || !end) return ''

  const current = day.date
  const isStart = isSameDay(current, start)
  const isEnd = isSameDay(current, end)
  const inRange = current > start && current < end

  if (isSameDay(start, end)) {
    return ''
  }

  if (isStart) {
    return 'bg-[#EAF7EC] dark:bg-emerald-950/40 rounded-l-full'
  }
  if (isEnd) {
    return 'bg-[#EAF7EC] dark:bg-emerald-950/40 rounded-r-full'
  }
  if (inRange) {
    return 'bg-[#EAF7EC] dark:bg-emerald-950/40'
  }
  return ''
}

const getDayButtonClass = (day) => {
  const current = day.date
  const isTodayDate = isSameDay(current, today)
  const { start, end } = selectedRange.value

  const isStart = isSameDay(current, start)
  const isEnd = isSameDay(current, end)
  const isSingleDay = start && end && isSameDay(start, end)
  const inRange = start && end && current >= start && current <= end

  // Base
  let classes = 'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer font-medium '

  // Future dates cannot be selected
  if (day.isFuture) {
    return classes + 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-25 hover:bg-transparent pointer-events-none select-none'
  }

  // Single date selected (e.g. "Today") -> soft circular pill with brand green text
  if (isSingleDay && isStart) {
    return classes + 'bg-[#ECF7EE] dark:bg-emerald-950/60 text-primary-green font-bold ring-1 ring-primary-green/30'
  }

  // Multi-day range start and end dates -> solid primary green circle
  if (isStart || isEnd) {
    return classes + 'bg-primary-green text-white font-bold shadow-sm z-10'
  }

  // Inside range dates
  if (inRange) {
    return classes + 'text-primary-green font-semibold'
  }

  // Dates outside the current month (leading/trailing filler)
  if (!day.isCurrentMonth) {
    return classes + 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
  }

  // Today indicator if unselected
  if (isTodayDate) {
    return classes + 'text-primary-green font-bold bg-[#ECF7EE]/60 dark:bg-emerald-950/40'
  }

  return classes + 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60'
}

// Action bar handlers
const clearSelection = () => {
  startDate.value = null
  endDate.value = null
  hoveredDate.value = null
  activePreset.value = null
}

const applySelection = () => {
  if (!hasSelection.value) return
  let label = ''
  if (activePreset.value) {
    label = activePreset.value
  } else if (startDate.value && endDate.value) {
    const sMonth = monthNames[startDate.value.getMonth()].slice(0, 3)
    const sDay = startDate.value.getDate()
    const eMonth = monthNames[endDate.value.getMonth()].slice(0, 3)
    const eDay = endDate.value.getDate()
    const eYear = endDate.value.getFullYear()

    if (isSameDay(startDate.value, endDate.value)) {
      label = `${sMonth} ${sDay}, ${eYear}`
    } else {
      label = `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${eYear}`
    }
  } else if (startDate.value) {
    const sMonth = monthNames[startDate.value.getMonth()].slice(0, 3)
    label = `${sMonth} ${startDate.value.getDate()}`
  } else {
    label = 'Select range'
  }

  displayLabel.value = label
  isOpen.value = false

  const payload = {
    label,
    preset: activePreset.value,
    start: startDate.value ? toISODate(startDate.value) : null,
    end: endDate.value ? toISODate(endDate.value) : (startDate.value ? toISODate(startDate.value) : null),
    daysCount: selectedDaysCount.value
  }

  emit('update:modelValue', label)
  emit('change', payload)
  emit('rangeChange', payload)
}

const canReset = computed(() => {
  return displayLabel.value !== 'Today'
})

const handleQuickReset = () => {
  selectPreset('Today')
  applySelection()
}

// Sync external modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal !== displayLabel.value) {
      displayLabel.value = newVal
      selectPreset(newVal)
    }
  }
)

// Initialize
onMounted(() => {
  if (props.modelValue) {
    selectPreset(props.modelValue)
    displayLabel.value = props.modelValue
  } else {
    selectPreset('Today')
    displayLabel.value = 'Today'
  }
})
</script>
