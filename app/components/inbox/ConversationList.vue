<template>
  <section class="flex h-full min-h-0 flex-col border-r border-[var(--sd-border)] bg-[var(--sd-surface)]">
    <div class="space-y-3 border-b border-[var(--sd-border)] p-3">
      <div class="flex items-center gap-2">
        <h1 class="text-[17px] font-bold tracking-tight">Chats</h1>
        <span class="rounded-full bg-[var(--sd-surface-strong)] px-2 text-[11px] font-semibold leading-5 text-[var(--sd-muted)]" title="Conversations with a message today">{{ counts.today ?? 0 }} today</span>
        <div class="flex-1" />
        <SdButton v-if="canStart" size="icon-sm" variant="ghost" :icon="SquarePen" title="New chat" aria-label="Start a new chat" @click="$emit('start')" />
        <SdButton size="icon-sm" :variant="activeFilters ? 'soft' : 'ghost'" :icon="SlidersHorizontal" title="Filters" aria-label="Filters" @click="$emit('filters')" />
      </div>
      <SdSearch :model-value="search" placeholder="Search name, number or message" @update:model-value="v => $emit('update:search', v)" />
      <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        <button v-for="t in tabs" :key="t.value" :class="['sd-chip !h-7 !px-2.5 !text-[12px]', tab === t.value && 'is-active']" @click="$emit('update:tab', t.value)">
          {{ t.label }}<span v-if="t.count" class="text-[10.5px] font-bold opacity-80">{{ t.count }}</span>
        </button>
      </div>
      <div class="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 text-[11.5px]">
        <button v-for="q in quick" :key="q.label" :class="['inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 font-medium transition', filters[q.key] === q.value ? 'border-[var(--sd-primary)] bg-[var(--sd-primary-soft)] text-[var(--sd-primary-ink)]' : 'border-[var(--sd-border)] text-[var(--sd-muted)] hover:border-[var(--sd-border-strong)] hover:text-[var(--sd-text)]']" :title="q.title" @click="$emit('quick', q.key, q.value)">
          <span v-if="q.dot" :class="['h-1.5 w-1.5 rounded-full', q.dot]" />{{ q.label }}
        </button>
        <button v-if="activeFilters" class="ml-auto shrink-0 font-semibold text-[var(--sd-primary-ink)] hover:underline" @click="$emit('clear-filters')">Clear {{ activeFilters }}</button>
      </div>
    </div>

    <div ref="scroller" class="sd-scroll min-h-0 flex-1" @scroll.passive="onScroll">
      <SdTableSkeleton v-if="loading && !items.length" :rows="8" />
      <SdErrorState v-else-if="error && !items.length" :message="error" @retry="$emit('retry')" />
      <SdEmpty v-else-if="!items.length" :icon="MessagesSquare" :title="search ? 'No chats match your search' : emptyTitle" :text="search ? 'Try a name, a few digits of the number, or words from the message.' : emptyText" compact />
      <div v-else class="divide-y divide-[var(--sd-border)]">
        <InboxConversationRow v-for="c in items" :key="c.id" :c="c" :active="c.id === activeId" :my-id="myId" :typing="typing[c.id]" :now="now" @select="id => $emit('select', id)" />
      </div>
      <div v-if="loadingMore" class="p-4 text-center text-[12px] text-[var(--sd-muted)]">Loading more…</div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { MessagesSquare, SlidersHorizontal, SquarePen } from '@lucide/vue'
const props = defineProps<{
  items: any[], loading: boolean, loadingMore: boolean, error: string | null, activeId: string | null, myId?: number,
  counts: Record<string, number>, tab: string, search: string, activeFilters: number, typing: Record<string, string>, canStart: boolean, seesAll: boolean, now: number,
  filters: Record<string, string>
}>()
const emit = defineEmits(['select', 'update:tab', 'update:search', 'more', 'filters', 'clear-filters', 'retry', 'start', 'quick'])
// One-tap filters for the questions agents ask all day
const quick = [
  { key: 'window', value: 'open', label: 'Active 24h', dot: 'bg-emerald-500', title: 'Customer wrote in the last 24 h: you can reply freely' },
  { key: 'window', value: 'closed', label: 'Template needed', dot: 'bg-slate-400', title: 'Over 24 h since the customer wrote: start with a template' },
  { key: 'waiting', value: '60', label: 'Waiting > 1h', dot: 'bg-amber-500', title: 'Customer has waited more than an hour for a reply' },
  { key: 'activity', value: 'today', label: 'Today', title: 'Last message today' },
]
const tabs = computed(() => [
  { value: 'all', label: 'Open', count: props.counts.open },
  { value: 'mine', label: 'Mine', count: props.counts.mine },
  { value: 'unassigned', label: 'Unassigned', count: props.counts.unassigned },
  { value: 'unread', label: 'Unread', count: props.counts.unread },
  { value: 'unreplied', label: 'Waiting', count: props.counts.unreplied },
  { value: 'pending', label: 'Pending', count: props.counts.pending },
  { value: 'closed', label: 'Resolved' },
])
const emptyTitle = computed(() => ({ mine: 'Nothing assigned to you', unassigned: 'The queue is empty', unread: 'All caught up', unreplied: 'Nobody is waiting', pending: 'No pending chats', closed: 'No resolved chats yet' } as any)[props.tab] || 'No open chats')
const emptyText = computed(() => props.tab === 'all' ? 'New WhatsApp messages from customers appear here instantly.' : '')
const scroller = ref<HTMLElement>()
function onScroll() {
  const el = scroller.value
  if (el && el.scrollTop + el.clientHeight > el.scrollHeight - 200) emit('more')
}
</script>
