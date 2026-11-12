<template>
  <section class="flex h-full min-h-0 min-w-0 flex-1">
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- header -->
      <header class="flex min-h-[60px] items-center gap-2 border-b border-[var(--sd-border)] bg-[var(--sd-surface)] px-2 py-2 sm:px-4">
        <SdButton class="md:hidden" size="icon-sm" variant="ghost" :icon="ArrowLeft" aria-label="Back to chats" @click="$emit('back')" />
        <template v-if="conv">
          <button class="flex min-w-[120px] flex-1 items-center gap-3 text-left" @click="showInfo = !showInfo">
            <SdAvatar :name="conv.contact.name" :seed="conv.contact.id" />
            <span class="min-w-0">
              <span class="flex items-center gap-1.5"><span class="truncate text-[14px] font-bold">{{ conv.contact.name }}</span></span>
              <span class="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[var(--sd-muted)]">
                <template v-if="activity"><span class="truncate text-[var(--sd-primary)]">{{ activity }}</span></template>
                <template v-else>
                  <span v-if="windowOpenNow" :class="['inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 font-semibold', (secondsLeft ?? 0) < 3 * 3600 ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300']" :title="`Free replies until ${dateTime(conv.window_expires_at)}; after that only templates`"><span class="h-1.5 w-1.5 rounded-full bg-current" />{{ windowLeft }}</span>
                  <span v-else class="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--sd-surface-strong)] px-1.5 font-semibold" title="Over 24 h since the customer wrote: send a template to restart"><Lock class="h-2.5 w-2.5" />Template needed</span>
                  <span class="truncate tabular-nums">{{ conv.contact.wa_id ? phoneNumber(conv.contact.wa_id) : conv.contact.phone }}</span>
                </template>
              </span>
            </span>
          </button>
          <SdMenu :items="assignItems">
            <SdButton size="sm" :icon="UserRound" :disabled="!assignItems.length" class="max-w-[150px]" :title="conv.assigned_to ? `Assigned to ${conv.assigned_to.name}` : 'Unassigned'">
              <span :class="['truncate', showInfo ? 'hidden 2xl:inline' : 'hidden lg:inline']">{{ conv.assigned_to ? (conv.assigned_to.id === me?.id ? 'You' : conv.assigned_to.name) : 'Unassigned' }}</span>
              <ChevronDown :class="['h-3.5 w-3.5 opacity-60', showInfo ? 'hidden 2xl:block' : 'hidden lg:block']" />
            </SdButton>
          </SdMenu>
          <SdButton v-if="conv.permissions?.update && conv.status === 'open'" size="sm" :icon="Clock4" title="Mark as pending (waiting on the customer or on us)" aria-label="Mark as pending" :loading="busy === 'status-pending'" @click="setStatus('pending')"><span :class="showInfo ? 'hidden 2xl:inline' : 'hidden xl:inline'">Pending</span></SdButton>
          <SdButton v-else-if="conv.permissions?.update && conv.status === 'pending'" size="sm" variant="soft" :icon="Clock4" title="Pending — click to move back to open" aria-label="Move back to open" :loading="busy === 'status-open'" @click="setStatus('open')"><span :class="showInfo ? 'hidden 2xl:inline' : 'hidden xl:inline'">Pending</span></SdButton>
          <SdButton v-if="conv.permissions?.update && conv.status !== 'closed'" size="sm" variant="primary" :icon="CheckCircle2" title="Resolve chat" aria-label="Resolve chat" :loading="busy === 'status-closed'" @click="setStatus('closed')"><span :class="showInfo ? 'hidden 2xl:inline' : 'hidden xl:inline'">Resolve</span></SdButton>
          <SdButton v-else-if="conv.permissions?.update" size="sm" :icon="RotateCcw" title="Reopen chat" aria-label="Reopen chat" :loading="busy === 'status-open'" @click="setStatus('open')"><span :class="showInfo ? 'hidden 2xl:inline' : 'hidden xl:inline'">Reopen</span></SdButton>
          <SdMenu :items="moreItems" />
          <SdButton class="hidden xl:inline-flex" size="icon-sm" :variant="showInfo ? 'soft' : 'ghost'" :icon="PanelRight" title="Customer details" aria-label="Customer details" @click="showInfo = !showInfo" />
        </template>
        <div v-else class="sd-skeleton h-8 w-48" />
      </header>

      <div v-if="conv && (conv.snoozed_until && new Date(conv.snoozed_until) > new Date() || conv.contact.is_blocked || conv.priority === 'urgent')" class="flex flex-wrap gap-2 border-b border-[var(--sd-border)] bg-[var(--sd-surface-soft)] px-4 py-2 text-[12px]">
        <span v-if="conv.contact.is_blocked" class="font-semibold text-[var(--sd-danger)]">This contact is blocked. Messages can't be sent.</span>
        <span v-if="conv.snoozed_until && new Date(conv.snoozed_until) > new Date()" class="inline-flex items-center gap-1 text-[var(--sd-muted)]"><AlarmClock class="h-3.5 w-3.5" />Snoozed until {{ dateTime(conv.snoozed_until) }} <button v-if="conv.permissions?.update" class="sd-link ml-1" @click="snooze(null)">Wake now</button></span>
        <span v-if="conv.priority === 'urgent'" class="font-semibold text-rose-600">Urgent priority</span>
      </div>

      <!-- messages -->
      <div ref="scroller" class="sd-chat-wallpaper sd-scroll relative min-h-0 flex-1 py-4" @scroll.passive="onScroll">
        <div v-if="loading" class="space-y-4 px-6">
          <div v-for="i in 6" :key="i" :class="['sd-skeleton h-12', i % 2 ? 'w-2/3' : 'ml-auto w-1/2']" />
        </div>
        <SdErrorState v-else-if="loadError" :message="loadError" @retry="load" />
        <template v-else>
          <div v-if="hasMore" class="mb-3 text-center"><SdButton size="xs" :loading="loadingOlder" @click="loadOlder">Load earlier messages</SdButton></div>
          <SdEmpty v-if="!timeline.length" :icon="MessageCircle" title="No messages yet" text="Start with an approved template — WhatsApp requires it for the first message." compact />
          <template v-for="item in timeline" :key="item.key">
            <div v-if="item.kind === 'day'" class="my-3 flex justify-center"><span class="rounded-lg bg-[var(--sd-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--sd-muted)] shadow-sm">{{ item.label }}</span></div>
            <div v-else-if="item.kind === 'note'" class="my-2 flex justify-center px-6">
              <div class="max-w-[560px] rounded-xl border border-amber-400/40 bg-[var(--sd-note)] px-3.5 py-2 text-[12.5px] shadow-sm">
                <p class="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200"><StickyNote class="h-3 w-3" />{{ item.note.author?.name || 'Note' }} · internal · {{ clock(item.note.created_at) }}</p>
                <p class="whitespace-pre-wrap break-words">{{ item.note.text }}</p>
              </div>
            </div>
            <div v-else :class="reactions[item.m.id] ? 'mb-5' : 'mb-1.5'"><InboxMessageBubble :m="item.m" :reactions="reactions[item.m.id]" :can-reply="canReply && windowOpenNow" @reply="m => replyTo = m" @jump="jump" @react="react" @retry="retryMedia" /></div>
          </template>
        </template>
        <button v-if="newBelow" class="sticky bottom-2 left-1/2 mx-auto flex -translate-x-0 items-center gap-1.5 rounded-full bg-[var(--sd-primary)] px-3 py-1.5 text-[12px] font-semibold text-[var(--sd-on-primary)] shadow-lg" @click="scrollToBottom(true)">
          <ArrowDown class="h-3.5 w-3.5" />New messages
        </button>
      </div>

      <InboxComposer v-if="conv" ref="composer" :conversation-id="conv.id" :can-reply="canReply" :blocked-reason="blockedReason"
        :window-open="windowOpenNow" :seconds-left="secondsLeft" :can-template="can('inbox.send_template')" :reply-to="replyTo"
        :contact-name="conv.contact.name" :contact-phone="conv.contact.wa_id ? phoneNumber(conv.contact.wa_id) : ''" @send="sendText" @media="sendMedia" @note="addNote" @template="templateOpen = true"
        @cancel-reply="replyTo = null" @typing="rt.send({ type: 'typing', conversation_id: conv.id })" />
    </div>

    <!-- right panel -->
    <aside v-if="conv && showInfo" class="hidden w-[330px] shrink-0 border-l border-[var(--sd-border)] bg-[var(--sd-surface)] xl:block">
      <InboxContactPanel :key="panelKey" :conv="conv" :notes="notes" @changed="refreshDetail" @followup="followupOpen = true" />
    </aside>
    <SdDrawer v-if="conv" :open="showInfo && narrow" title="Customer details" @update:open="v => showInfo = v">
      <InboxContactPanel :key="panelKey" :conv="conv" :notes="notes" @changed="refreshDetail" @followup="followupOpen = true" />
    </SdDrawer>

    <InboxTemplatePicker v-if="conv" v-model:open="templateOpen" :source="`inbox/conversations/${conv.id}/templates/`" :contact-name="conv.contact.name"
      :sending="busy === 'template'" description="Approved by Meta. Works inside and outside the 24-hour window." @send="sendTemplate" />
    <FollowupModal v-if="conv" v-model:open="followupOpen" :contact="conv.contact" :conversation-id="conv.id" @saved="panelKey++" />
    <SdModal v-model:open="snoozeOpen" title="Snooze until…" description="The chat leaves the Open list until then, or until the customer writes again." size="sm">
      <input v-model="snoozeAt" type="datetime-local" class="sd-input" :min="toLocalInput(new Date())">
      <template #footer><SdButton @click="snoozeOpen = false">Cancel</SdButton><SdButton variant="primary" :disabled="!snoozeAt" @click="snooze(fromLocalInput(snoozeAt)); snoozeOpen = false">Snooze</SdButton></template>
    </SdModal>
  </section>
</template>

<script setup lang="ts">
import {
  AlarmClock, ArrowDown, ArrowLeft, CheckCircle2, ChevronDown, Copy, Flag, HeartHandshake, MessageCircle, PanelRight, RotateCcw,
  Star, StickyNote, UserMinus, UserRound, UserRoundCheck, UserRoundPlus, CalendarPlus, Contact, Clock4, Lock,
} from '@lucide/vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ id: string, members: any[] }>()
const emit = defineEmits<{ back: [], updated: [any], gone: [string] }>()

const api = useApi()
const rt = useRealtime()
const { me, can } = useSession()
const openConversation = useState<string | null>('inbox-open-conversation', () => null)

const conv = ref<any>(null)
const messages = ref<any[]>([])
const notes = ref<any[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const hasMore = ref(false)
const nextBefore = ref<number | null>(null)
const loadingOlder = ref(false)
const busy = ref<string | null>(null)
const replyTo = ref<any>(null)
const templateOpen = ref(false)
const followupOpen = ref(false)
const snoozeOpen = ref(false)
const snoozeAt = ref('')
const showInfo = ref(true)
const panelKey = ref(0)
const narrow = ref(false)
const newBelow = ref(false)
const scroller = ref<HTMLElement>()
const composer = ref<any>()
const activityText = ref<{ text: string, until: number } | null>(null)
const tick = ref(Date.now())
let viewingTimer: any, tickTimer: any, readTimer: any

const canReply = computed(() => !!conv.value?.permissions?.reply)
const blockedReason = computed(() => conv.value?.contact?.is_blocked ? 'This contact is blocked. Unblock them on the Contacts page to reply.' : 'You can read this chat but only its assignee or a manager can reply.')
const secondsLeft = computed(() => conv.value?.window_expires_at ? Math.max(0, Math.round((new Date(conv.value.window_expires_at).getTime() - tick.value) / 1000)) : null)
const activity = computed(() => activityText.value && activityText.value.until > tick.value ? activityText.value.text : '')

// Latest reaction per side (customer / us) for each message; an empty emoji means it was removed.
const reactions = computed(() => {
  const latest: Record<number, Record<string, string>> = {}
  const list = messages.value.filter(m => m.type === 'reaction' && m.reply_to && m.status !== 'failed')
  list.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime() || a.id - b.id)
  for (const m of list) (latest[m.reply_to.id] ||= {})[m.direction] = m.body || ''
  const map: Record<number, { emoji: string, mine: boolean }[]> = {}
  for (const [id, sides] of Object.entries(latest)) {
    const items = Object.entries(sides).filter(([, e]) => e).map(([dir, e]) => ({ emoji: e, mine: dir === 'out' }))
    if (items.length) map[Number(id)] = items
  }
  return map
})
// The server says "open"; the clock decides the moment it closes (no reload needed).
const windowOpenNow = computed(() => !!conv.value?.window_open && (secondsLeft.value === null || secondsLeft.value > 0))
const windowLeft = computed(() => {
  const s = secondsLeft.value
  if (!windowOpenNow.value || s === null) return ''
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m left` : `${Math.max(m, 1)}m left`
})

const timeline = computed(() => {
  const items: any[] = [
    ...messages.value.filter(m => m.type !== 'reaction').map(m => ({ kind: 'm', at: m.sent_at, key: `m${m.id}`, m })),
    ...notes.value.map(n => ({ kind: 'note', at: n.created_at, key: `n${n.id}`, note: n })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  const out: any[] = []
  let day = ''
  for (const it of items) {
    const d = new Date(it.at).toDateString()
    if (d !== day) { day = d; out.push({ kind: 'day', key: `d${d}`, label: dayLabel(it.at) }) }
    out.push(it)
  }
  return out
})

// ---------- loading ----------
async function load() {
  loading.value = true
  loadError.value = null
  replyTo.value = null
  try {
    const [detail, page, noteList] = await Promise.all([
      api.get(`inbox/conversations/${props.id}/`, { silent: true }),
      api.get(`inbox/conversations/${props.id}/messages/`, { silent: true, query: { limit: 40 } }),
      api.get(`inbox/conversations/${props.id}/notes/`, { silent: true }),
    ])
    conv.value = detail
    messages.value = page.results
    hasMore.value = page.has_more
    nextBefore.value = page.next_before
    notes.value = noteList
    loading.value = false
    await nextTick()
    scrollToBottom()
    markRead()
    rt.send({ type: 'viewing', conversation_id: props.id })
  } catch (e: any) {
    if (e.status === 404) { toast.error('This chat is not available to you any more.'); emit('gone', props.id) }
    loadError.value = e.message
    loading.value = false
  }
}

async function loadOlder() {
  if (!hasMore.value || loadingOlder.value) return
  loadingOlder.value = true
  const el = scroller.value!
  const prevHeight = el.scrollHeight
  try {
    const page = await api.get(`inbox/conversations/${props.id}/messages/`, { query: { before: nextBefore.value, limit: 40 } })
    const known = new Set(messages.value.map(m => m.id))
    messages.value = [...page.results.filter((m: any) => !known.has(m.id)), ...messages.value]
    hasMore.value = page.has_more
    nextBefore.value = page.next_before
    await nextTick()
    el.scrollTop = el.scrollHeight - prevHeight
  } catch {} finally { loadingOlder.value = false }
}

async function refreshDetail() {
  try {
    conv.value = await api.get(`inbox/conversations/${props.id}/`, { silent: true })
    emit('updated', conv.value)
  } catch (e: any) { if (e.status === 404) emit('gone', props.id) }
}

function markRead() {
  clearTimeout(readTimer)
  readTimer = setTimeout(async () => {
    if (!conv.value?.unread_count || document.visibilityState !== 'visible') return
    try { const d = await api.post(`inbox/conversations/${props.id}/read/`, {}, { silent: true }); conv.value = d; emit('updated', d) } catch {}
  }, 300)
}

// ---------- scrolling ----------
function nearBottom() {
  const el = scroller.value
  return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 140
}
function scrollToBottom(smooth = false) {
  const el = scroller.value
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  newBelow.value = false
}
function onScroll() {
  const el = scroller.value
  if (!el) return
  if (el.scrollTop < 60 && hasMore.value) loadOlder()
  if (nearBottom()) newBelow.value = false
}
function jump(id: number) {
  const el = document.getElementById(`m-${id}`)
  if (!el) { toast.info('That message is further back — load earlier messages.'); return }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('animate-pulse')
  setTimeout(() => el.classList.remove('animate-pulse'), 1500)
}

function upsertMessage(m: any) {
  const i = messages.value.findIndex(x => x.id === m.id)
  if (i >= 0) messages.value[i] = { ...messages.value[i], ...m }
  else {
    const stick = nearBottom()
    messages.value.push(m)
    nextTick(() => { if (stick || m.direction === 'out') scrollToBottom(true); else newBelow.value = true })
  }
}

// ---------- reactions & media ----------
async function react(m: any, emoji: string) {
  try { upsertMessage(await api.post(`inbox/conversations/${props.id}/react/`, { message: m.id, emoji })) } catch {}
}
async function retryMedia(m: any, done: () => void) {
  try {
    upsertMessage(await api.post(`inbox/conversations/${props.id}/retry-media/`, { message: m.id }))
  } catch (e: any) {
    if (e?.data?.message) upsertMessage(e.data.message)
  } finally { done() }
}

// ---------- actions ----------
async function act(name: string, path: string, body: any, success?: string) {
  busy.value = name
  try {
    const res = await api.post(`inbox/conversations/${props.id}/${path}/`, body)
    if (res?.removed) { toast.success(res.detail); emit('gone', props.id); return }
    conv.value = res
    emit('updated', res)
    if (success) toast.success(success)
  } catch {} finally { busy.value = null }
}
const setStatus = (status: string) => act(`status-${status}`, 'status', { status }, status === 'closed' ? 'Chat resolved' : status === 'pending' ? 'Marked as pending' : 'Chat reopened')
const assign = (id: number | null, label: string) => act('assign', 'assign', { assignee: id }, label)
const setPriority = (priority: string) => act('priority', 'priority', { priority }, `Priority: ${PRIORITY_LABEL[priority]}`)
const star = () => act('star', 'star', { starred: !conv.value.is_starred })
const snooze = (until: string | null) => act('snooze', 'snooze', { until }, until ? `Snoozed until ${dateTime(until)}` : 'Chat is awake')

function snoozeFor(hours: number | 'tomorrow' | 'monday') {
  const d = new Date()
  if (hours === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0) }
  else if (hours === 'monday') { d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); d.setHours(9, 0, 0, 0) }
  else d.setHours(d.getHours() + hours)
  snooze(d.toISOString())
}

async function requestRating() {
  try {
    await api.post('csat/surveys/request/', { conversation: props.id })
    toast.success('Rating request sent to the customer')
  } catch {}
}

async function sendText({ body, reply_to, done }: any) {
  try {
    const m = await api.post(`inbox/conversations/${props.id}/messages/`, { body, reply_to })
    upsertMessage(m)
    replyTo.value = null
    done(true)
    if (m.status === 'failed') toast.error(m.error_message || 'WhatsApp did not accept the message.')
  } catch { done(false) }
}
async function sendMedia({ file, caption, done }: any) {
  const body = new FormData()
  body.append('file', file)
  if (caption) body.append('caption', caption)
  try {
    const m = await api.post(`inbox/conversations/${props.id}/media/`, body)
    upsertMessage(m)
    done(true)
    if (m.status === 'failed') toast.error(m.error_message || 'WhatsApp did not accept the file.')
  } catch { done(false) }
}
async function sendTemplate({ template, params, extras }: any) {
  busy.value = 'template'
  try {
    const m = await api.post(`inbox/conversations/${props.id}/template/`, { template, params, extras })
    upsertMessage(m)
    templateOpen.value = false
    toast.success('Template sent')
    refreshDetail()
  } catch {} finally { busy.value = null }
}
async function addNote({ text, done }: any) {
  try {
    const n = await api.post(`inbox/conversations/${props.id}/notes/`, { text })
    if (!notes.value.some(x => x.id === n.id)) notes.value.push(n)
    nextTick(() => scrollToBottom(true))
    done(true)
  } catch { done(false) }
}

// ---------- menus ----------
const assignItems = computed(() => {
  const c = conv.value
  if (!c) return []
  const p = c.permissions || {}
  const items: any[] = []
  if (p.assign_any) {
    if (c.assigned_to?.id !== me.value?.id) items.push({ label: 'Assign to me', icon: UserRoundCheck, onSelect: () => assign(me.value!.id, 'Assigned to you') })
    items.push({ separator: true })
    for (const m of props.members.filter(m => m.id !== me.value?.id && m.id !== c.assigned_to?.id)) {
      items.push({ label: `${m.name}${m.is_online ? ' • online' : ''}${m.is_available ? '' : ' (away)'}`, icon: UserRoundPlus, onSelect: () => assign(m.id, `Assigned to ${m.name}`) })
    }
    if (c.assigned_to) items.push({ separator: true }, { label: 'Unassign', icon: UserMinus, danger: true, onSelect: () => assign(null, 'Moved back to the queue') })
  } else {
    if (p.claim) items.push({ label: 'Assign to me', icon: UserRoundCheck, onSelect: () => assign(me.value!.id, 'Assigned to you') })
    if (p.release) items.push({ label: 'Release to queue', icon: UserMinus, onSelect: () => assign(null, 'Moved back to the queue') })
  }
  return items.filter((x, i, arr) => !(x.separator && (i === 0 || i === arr.length - 1 || arr[i - 1]?.separator)))
})

const moreItems = computed(() => {
  const c = conv.value
  if (!c) return []
  const upd = !!c.permissions?.update
  return [
    { label: c.is_starred ? 'Remove star' : 'Star chat', icon: Star, hidden: !upd, onSelect: star },
    { separator: true },
    ...['urgent', 'high', 'normal', 'low'].map(p => ({ label: `Priority: ${PRIORITY_LABEL[p]}${c.priority === p ? '  ✓' : ''}`, icon: Flag, hidden: !upd, onSelect: () => setPriority(p) })),
    { separator: true },
    { label: 'Snooze 1 hour', icon: AlarmClock, hidden: !upd, onSelect: () => snoozeFor(1) },
    { label: 'Snooze until tomorrow 9:00', icon: AlarmClock, hidden: !upd, onSelect: () => snoozeFor('tomorrow') },
    { label: 'Snooze until…', icon: AlarmClock, hidden: !upd, onSelect: () => { snoozeAt.value = ''; snoozeOpen.value = true } },
    { separator: true },
    { label: 'Add follow-up', icon: CalendarPlus, hidden: !can('followups.view'), onSelect: () => { followupOpen.value = true } },
    { label: 'Ask for a rating', icon: HeartHandshake, hidden: !upd || !can('csat.view'), onSelect: requestRating },
    { label: 'Open Customer 360°', icon: Contact, onSelect: () => navigateTo(`/dashboard/customer-360?id=${c.contact.id}`) },
    { label: 'Copy phone number', icon: Copy, hidden: !c.contact.wa_id, onSelect: () => copyText(c.contact.phone).then(() => toast.success('Number copied')) },
  ]
})

// ---------- realtime ----------
rt.on((e) => {
  if (e.type === 'resync') { if (conv.value) load(); return }
  const cid = e.conversation?.id || e.conversation_id
  if (cid !== props.id) return
  if (e.type === 'message.created') {
    upsertMessage(e.message)
    if (conv.value) {
      conv.value = { ...conv.value, ...e.conversation, contact: conv.value.contact, permissions: conv.value.permissions }
      if (e.message.direction === 'in') { markRead(); activityText.value = null }
    }
  } else if (e.type === 'message.updated') {
    const i = messages.value.findIndex(m => m.id === e.message.id)
    if (i >= 0) messages.value[i] = e.message
  } else if (e.type === 'conversation.updated') {
    const prevAssignee = conv.value?.assigned_to?.id
    if (conv.value) conv.value = { ...conv.value, ...e.conversation, contact: conv.value.contact, permissions: conv.value.permissions }
    if (prevAssignee !== e.conversation.assigned_to?.id) refreshDetail() // permissions change with the assignee
  } else if (e.type === 'conversation.removed') {
    toast.info('This chat was assigned to someone else.')
    emit('gone', props.id)
  } else if (e.type === 'note.created') {
    if (!notes.value.some(n => n.id === e.note.id)) { notes.value.push(e.note); nextTick(() => nearBottom() && scrollToBottom(true)) }
  } else if (e.type === 'agent.activity' && e.agent.id !== me.value?.id) {
    activityText.value = { text: e.activity === 'typing' ? `${e.agent.name} is typing a reply…` : `${e.agent.name} is also viewing this chat`, until: Date.now() + (e.activity === 'typing' ? 5000 : 25000) }
  }
})

watch(() => props.id, () => { openConversation.value = props.id; load() }, { immediate: true })

function onVisible() { if (document.visibilityState === 'visible') markRead() }
function onResize() { narrow.value = window.innerWidth < 1280; if (narrow.value && showInfo.value && !conv.value) showInfo.value = false }
onMounted(() => {
  onResize()
  if (window.innerWidth < 1280) showInfo.value = false
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisible)
  viewingTimer = setInterval(() => rt.send({ type: 'viewing', conversation_id: props.id }), 20000)
  tickTimer = setInterval(() => { tick.value = Date.now() }, 15000)
})
onBeforeUnmount(() => {
  openConversation.value = null
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisible)
  clearInterval(viewingTimer)
  clearInterval(tickTimer)
  clearTimeout(readTimer)
})
</script>
