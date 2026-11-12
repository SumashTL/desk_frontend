<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Follow-ups" :subtitle="can('followups.view_all') ? 'Callbacks and reminders for the whole team.' : 'Your callbacks and reminders.'">
      <SdButton variant="primary" :icon="CalendarPlus" @click="openForm()">New follow-up</SdButton>
    </SdPageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SdStat label="Open" :value="num(stats?.open)" :icon="ListTodo" :loading="!stats" />
      <SdStat label="Due today" :value="num(stats?.due_today)" :icon="CalendarClock" tone="amber" :loading="!stats" />
      <SdStat label="Overdue" :value="num(stats?.overdue)" :icon="AlarmClockOff" tone="red" :loading="!stats" />
      <SdStat label="Completed" :value="num(stats?.completed)" :icon="CheckCircle2" tone="green" :loading="!stats" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdTabs v-model="list.filters.due" :tabs="[{ value: 'open', label: 'All open', count: stats?.open }, { value: 'today', label: 'Today', count: stats?.due_today }, { value: 'overdue', label: 'Overdue', count: stats?.overdue }, { value: 'upcoming', label: 'Upcoming' }, { value: 'completed', label: 'Done' }, { value: 'cancelled', label: 'Cancelled' }]" />
        <div class="flex-1" />
        <SdSearch v-model="list.filters.search" placeholder="Customer or title" class="w-full sm:w-60" />
        <select v-if="owners.length > 1" v-model="list.filters.owner" class="sd-input !w-auto"><option value="">Everyone</option><option value="me">Mine</option><option v-for="o in owners" :key="o.id" :value="String(o.id)">{{ o.name }}</option></select>
      </div>
      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdErrorState v-else-if="list.error.value" :message="list.error.value" @retry="list.load" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="CalendarCheck" :title="emptyTitle" text="Create follow-ups from a chat (⋯ → Add follow-up) or here." />
      <div v-else class="divide-y divide-[var(--sd-border)]">
        <div v-for="f in list.items.value" :key="f.id" class="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-[var(--sd-surface-soft)] sm:flex-nowrap">
          <button :disabled="f.status !== 'open'" :class="['grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition', f.status === 'completed' ? 'border-[var(--sd-primary)] bg-[var(--sd-primary)] text-[var(--sd-on-primary)]' : 'border-[var(--sd-border-strong)] hover:border-[var(--sd-primary)]']" :title="f.status === 'open' ? 'Mark done' : ''" :aria-label="`Complete ${f.title}`" @click="setStatus(f, 'complete')">
            <Check v-if="f.status === 'completed'" class="h-3.5 w-3.5" />
          </button>
          <div class="min-w-0 flex-1">
            <p :class="['truncate text-[13.5px] font-semibold', f.status !== 'open' && 'line-through opacity-60']">{{ f.title || 'Follow-up' }}</p>
            <p class="truncate text-[12px] text-[var(--sd-muted)]">
              <NuxtLink :to="`/dashboard/customer-360?id=${f.contact}`" class="hover:underline">{{ f.contact_detail.name }}</NuxtLink> · {{ f.contact_detail.phone }} · {{ KIND[f.kind] }}<template v-if="f.note"> · {{ f.note }}</template>
            </p>
          </div>
          <div class="text-right">
            <p :class="['text-[12.5px] font-semibold', f.is_overdue ? 'text-[var(--sd-danger)]' : '']">{{ f.is_overdue ? `Overdue · ${timeAgo(f.due_at)}` : dateTime(f.due_at) }}</p>
            <p class="text-[11.5px] text-[var(--sd-muted)]">{{ f.owner_detail?.name || 'No owner' }}</p>
          </div>
          <SdButton v-if="f.conversation" size="icon-sm" variant="ghost" :icon="MessagesSquare" title="Open chat" aria-label="Open chat" :to="`/dashboard/inbox?c=${f.conversation}`" />
          <SdMenu :items="menu(f)" />
        </div>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>
    <FollowupModal v-model:open="formOpen" :item="editing" :contact="editing ? editing.contact_detail : null" @saved="refresh" />
  </div></div>
</template>
<script setup lang="ts">
import { AlarmClockOff, Ban, CalendarCheck, CalendarClock, CalendarPlus, Check, CheckCircle2, ListTodo, MessagesSquare, Pencil, RotateCcw, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'followups.view' })
useHead({ title: 'Follow-ups' })
const api = useApi()
const { can } = useSession()
const { confirm } = useConfirm()
const KIND: Record<string, string> = { callback: 'Callback', message: 'Message', check_in: 'Check-in', other: 'Other' }
const list = useList<any>('followups/', { due: 'open', owner: '', ordering: 'due_at' })
const stats = ref<any>(null)
const owners = ref<any[]>([])
const loadStats = async () => { try { stats.value = await api.get('followups/stats/', { silent: true }) } catch {} }
onMounted(async () => { loadStats(); try { owners.value = await api.get('followups/owners/', { silent: true }) } catch {} })
watch(() => list.filters.due, d => { list.filters.ordering = ['completed', 'cancelled'].includes(d) ? '-due_at' : 'due_at' })
const emptyTitle = computed(() => ({ today: 'Nothing due today', overdue: 'Nothing overdue — nice!', upcoming: 'Nothing upcoming', completed: 'No completed follow-ups yet', cancelled: 'Nothing cancelled' } as any)[list.filters.due] || 'No follow-ups')
const formOpen = ref(false)
const editing = ref<any>(null)
function openForm(f?: any) { editing.value = f || null; formOpen.value = true }
function refresh() { list.load(); loadStats() }
async function setStatus(f: any, action: 'complete' | 'cancel' | 'reopen') {
  try { await api.post(`followups/${f.id}/${action}/`); toast.success(action === 'complete' ? 'Done ✓' : action === 'cancel' ? 'Cancelled' : 'Reopened'); refresh() } catch {}
}
async function remove(f: any) {
  if (!(await confirm({ title: 'Delete this follow-up?', confirmText: 'Delete', danger: true }))) return
  try { await api.del(`followups/${f.id}/`); refresh() } catch {}
}
const menu = (f: any) => [
  { label: 'Edit', icon: Pencil, hidden: f.status !== 'open', onSelect: () => openForm(f) },
  { label: 'Mark done', icon: Check, hidden: f.status !== 'open', onSelect: () => setStatus(f, 'complete') },
  { label: 'Reopen', icon: RotateCcw, hidden: f.status === 'open', onSelect: () => setStatus(f, 'reopen') },
  { label: 'Cancel', icon: Ban, hidden: f.status !== 'open', onSelect: () => setStatus(f, 'cancel') },
  { separator: true },
  { label: 'Delete', icon: Trash2, danger: true, onSelect: () => remove(f) },
]
</script>
