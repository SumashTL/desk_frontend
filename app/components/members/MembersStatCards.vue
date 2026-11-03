<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
    <div
      v-for="stat in stats"
      :key="stat.id"
      class="card p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {{ stat.label }}
        </span>
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 border', stat.iconBg, stat.iconColor, stat.iconBorder]">
          <component :is="stat.icon" class="w-4 h-4" />
        </div>
      </div>

      <div class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-3">
        {{ stat.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, Clock, Users, UserX } from '@lucide/vue'
import { ref } from 'vue'

const stats = ref([
  {
    id: 'total',
    label: 'TOTAL PEOPLE',
    value: 8,
    icon: Users,
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBorder: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    id: 'active',
    label: 'ACTIVE NOW',
    value: 8,
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBorder: 'border-emerald-100 dark:border-emerald-800/40',
  },
  {
    id: 'pending',
    label: 'PENDING INVITES',
    value: 0,
    icon: Clock,
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBorder: 'border-amber-100 dark:border-amber-800/40',
  },
  {
    id: 'disabled',
    label: 'DISABLED',
    value: 0,
    icon: UserX,
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBorder: 'border-rose-100 dark:border-rose-800/40',
  },
])
</script>

