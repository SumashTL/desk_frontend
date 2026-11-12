<template>
  <button
    type="button"
    :class="['group relative flex w-full gap-3 px-3 py-2.5 text-left transition', active ? 'bg-[var(--sd-primary-soft)]' : unread ? 'bg-[var(--sd-unread-bg)] hover:bg-[var(--sd-surface-soft)]' : 'hover:bg-[var(--sd-surface-soft)]']"
    @click="$emit('select', c.id)"
  >
    <span v-if="active" class="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[var(--sd-primary)]" />
    <span class="relative shrink-0">
      <SdAvatar :name="c.contact.name" :seed="c.contact.id" size="md" :class="!unread && !active && 'opacity-80'" />
      <!-- 24-hour window: green = free replies, amber = closing soon, grey lock = template needed -->
      <span
        :class="['absolute -bottom-0.5 -right-0.5 grid h-[17px] w-[17px] place-items-center rounded-full ring-2 ring-[var(--sd-surface)]', windowState.dot]"
        :title="windowState.title"
      >
        <Lock v-if="windowState.key === 'closed'" class="h-2.5 w-2.5 text-white" />
        <Clock3 v-else-if="windowState.key === 'soon'" class="h-2.5 w-2.5 text-white" />
      </span>
    </span>
    <span class="min-w-0 flex-1">
      <span class="flex items-baseline gap-1.5">
        <span :class="['truncate text-[13.5px]', unread ? 'font-bold text-[var(--sd-text)]' : 'font-medium text-[var(--sd-text-soft)]']">{{ c.contact.name }}</span>
        <Star v-if="c.is_starred" class="h-3 w-3 shrink-0 self-center fill-amber-400 text-amber-400" />
        <span :class="['ml-auto shrink-0 pl-2 text-[11px] tabular-nums', unread ? 'font-semibold text-[var(--sd-primary)]' : 'text-[var(--sd-faint)]']">{{ chatTime(c.last_message_at) }}</span>
      </span>
      <span v-if="number" :class="['block truncate text-[11.5px] tabular-nums', unread ? 'text-[var(--sd-muted)]' : 'text-[var(--sd-faint)]']">{{ number }}</span>
      <span class="mt-0.5 flex items-center gap-1.5">
        <CheckCheck v-if="c.last_message_direction === 'out'" class="h-3.5 w-3.5 shrink-0 text-[var(--sd-faint)]" />
        <span :class="['truncate text-[12.5px]', typing ? 'italic text-[var(--sd-primary)]' : unread ? 'font-medium text-[var(--sd-text)]' : 'text-[var(--sd-faint)]']">{{ typing ? `${typing} is typing…` : (c.last_message_preview || 'No messages yet') }}</span>
        <span v-if="unread" class="ml-auto shrink-0 rounded-full bg-[var(--sd-primary)] px-1.5 text-[10.5px] font-bold leading-[18px] text-[var(--sd-on-primary)]">{{ c.unread_count }}</span>
      </span>
      <span class="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span v-if="c.assigned_to" class="inline-flex max-w-[130px] items-center gap-1 truncate rounded-full bg-[var(--sd-surface-strong)] px-1.5 py-px text-[10.5px] font-medium text-[var(--sd-muted)]">
          <UserRound class="h-2.5 w-2.5" />{{ c.assigned_to.id === myId ? 'You' : c.assigned_to.name }}
        </span>
        <span v-else class="rounded-full bg-sky-500/10 px-1.5 py-px text-[10.5px] font-semibold text-sky-700 dark:text-sky-300">Unassigned</span>
        <span v-if="c.priority === 'high' || c.priority === 'urgent'" :class="['rounded-full px-1.5 py-px text-[10.5px] font-semibold', c.priority === 'urgent' ? 'bg-rose-500/12 text-rose-600 dark:text-rose-300' : 'bg-amber-500/14 text-amber-700 dark:text-amber-300']">{{ PRIORITY_LABEL[c.priority] }}</span>
        <span v-if="c.status === 'pending'" class="rounded-full bg-violet-500/10 px-1.5 py-px text-[10.5px] font-semibold text-violet-700 dark:text-violet-300">Pending</span>
        <span v-if="c.status === 'closed'" class="rounded-full bg-[var(--sd-surface-strong)] px-1.5 py-px text-[10.5px] font-semibold text-[var(--sd-muted)]">Resolved</span>
        <span v-if="snoozed" class="inline-flex items-center gap-0.5 rounded-full bg-[var(--sd-surface-strong)] px-1.5 py-px text-[10.5px] text-[var(--sd-muted)]"><AlarmClock class="h-2.5 w-2.5" />Snoozed</span>
        <span v-if="windowState.key === 'soon'" class="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400" title="24-hour window closes soon; after that only templates">{{ windowState.left }} left</span>
        <span v-else-if="windowState.key === 'closed' && c.status !== 'closed'" class="inline-flex items-center gap-0.5 rounded-full bg-[var(--sd-surface-strong)] px-1.5 py-px text-[10.5px] font-medium text-[var(--sd-muted)]" title="More than 24 h since the customer wrote: start with a template"><Lock class="h-2.5 w-2.5" />Template</span>
        <span v-if="waiting" class="ml-auto text-[10.5px] font-semibold text-amber-600 dark:text-amber-400" title="Customer is waiting for a reply">⏱ {{ waiting }}</span>
      </span>
    </span>
  </button>
</template>
<script setup lang="ts">
import { AlarmClock, CheckCheck, Clock3, Lock, Star, UserRound } from '@lucide/vue'
const props = defineProps<{ c: any, active?: boolean, myId?: number, typing?: string | null, now?: number }>()
defineEmits<{ select: [string] }>()
const unread = computed(() => props.c.unread_count > 0)
// Number under the name: only when the name is a real name (otherwise the name already is the number)
const number = computed(() => {
  const ct = props.c.contact
  if (ct.wa_id) return ct.has_name === false ? '' : phoneNumber(ct.wa_id)
  return ct.username && ct.has_name ? `@${ct.username}` : ''
})
const snoozed = computed(() => props.c.snoozed_until && new Date(props.c.snoozed_until).getTime() > (props.now || Date.now()))
const windowState = computed(() => {
  const s = props.c.window_expires_at ? (new Date(props.c.window_expires_at).getTime() - (props.now || Date.now())) / 1000 : null
  const open = !!props.c.window_open && (s === null || s > 0)
  if (!open) return { key: 'closed', dot: 'bg-slate-400 dark:bg-slate-500', title: 'Over 24 h since the customer wrote: send a template first', left: '' }
  if (s !== null && s <= 3 * 3600) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
    return { key: 'soon', dot: 'bg-amber-500', title: 'Free replies end soon', left: h ? `${h}h ${m}m` : `${Math.max(m, 1)}m` }
  }
  return { key: 'open', dot: 'bg-emerald-500', title: 'Active: free replies for up to 24 h after the customer’s last message', left: '' }
})
const waiting = computed(() => props.c.awaiting_reply_since && props.c.status !== 'closed' ? timeAgo(props.c.awaiting_reply_since, true) : '')
</script>
