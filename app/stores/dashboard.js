import { defineStore } from 'pinia'
import { ref } from 'vue'

const PRESET_DAYS = { 'Today': 1, '7 Days': 7, '30 Days': 30, '90 Days': 90, 'Last 14 days': 14 }

// Shared dashboard filter. Each widget reads `range` and loads its own data.
export const useDashboardStore = defineStore('dashboard', () => {
  const range = ref({ label: 'Today', preset: 'Today', start: null, end: null, daysCount: 1 })

  function setRange(payload) {
    range.value = typeof payload === 'string'
      ? { label: payload, preset: payload, start: null, end: null, daysCount: PRESET_DAYS[payload] || 7 }
      : { start: null, end: null, daysCount: 7, preset: null, ...payload }
  }

  return { range, setRange }
})
