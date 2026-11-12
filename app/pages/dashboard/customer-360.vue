<template>
  <div class="flex h-full min-h-0">
    <!-- customer list -->
    <aside :class="['w-full shrink-0 flex-col border-r border-[var(--sd-border)] bg-[var(--sd-surface)] md:w-[320px] xl:w-[350px]', id ? 'hidden md:flex' : 'flex']">
      <div class="space-y-3 border-b border-[var(--sd-border)] p-3">
        <div class="flex items-center gap-2"><h1 class="text-[17px] font-bold tracking-tight">Customers</h1><span class="rounded-full bg-[var(--sd-surface-strong)] px-2 text-[11px] font-semibold leading-5 text-[var(--sd-muted)]">{{ num(total) }}</span></div>
        <SdSearch v-model="q" placeholder="Name, number or email" />
        <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1">
          <button v-for="f in quick" :key="f.value" :class="['sd-chip !h-7 !px-2.5 !text-[12px]', filter === f.value && 'is-active']" @click="filter = f.value">{{ f.label }}</button>
        </div>
      </div>
      <div class="sd-scroll min-h-0 flex-1" @scroll.passive="onListScroll">
        <div v-if="searching && !results.length" class="space-y-2 p-3"><div v-for="i in 8" :key="i" class="sd-skeleton h-12" /></div>
        <SdEmpty v-else-if="!results.length" compact :icon="Contact" :title="q ? 'No customer found' : 'No customers yet'" :text="q ? 'Try part of the number or name.' : 'Everyone who messages your WhatsApp appears here.'" />
        <NuxtLink v-for="r in results" :key="r.id" :to="`/dashboard/customer-360?id=${r.id}`" :class="['relative flex items-center gap-3 border-b border-[var(--sd-border)] px-3 py-2.5 transition', String(r.id) === id ? 'bg-[var(--sd-primary-soft)]' : 'hover:bg-[var(--sd-surface-soft)]']">
          <span v-if="String(r.id) === id" class="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[var(--sd-primary)]" />
          <SdAvatar :name="r.name" :seed="r.id" size="sm" />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1 truncate text-[13px] font-semibold">{{ r.name }}<Crown v-if="r.is_vip" class="h-3 w-3 shrink-0 text-amber-500" /></p>
            <p class="truncate text-[11.5px] tabular-nums text-[var(--sd-muted)]">{{ r.wa_id ? phoneNumber(r.wa_id) : r.phone }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-[10.5px] text-[var(--sd-faint)]">{{ r.last_interaction_at ? timeAgo(r.last_interaction_at, true) : '' }}</p>
            <div class="mt-1 flex justify-end gap-0.5"><span v-for="t in (r.tags || []).slice(0, 3)" :key="t.id" class="h-1.5 w-1.5 rounded-full" :style="{ background: t.color }" :title="t.name" /></div>
          </div>
        </NuxtLink>
        <p v-if="loadingMore" class="p-3 text-center text-[12px] text-[var(--sd-muted)]">Loading more…</p>
      </div>
    </aside>

    <!-- details -->
    <section :class="['sd-scroll min-w-0 flex-1', id ? 'block' : 'hidden md:block']">
      <div v-if="!id" class="grid h-full place-items-center p-6">
        <div class="max-w-sm text-center">
          <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[var(--sd-surface)] text-[var(--sd-primary)] shadow-sm"><Contact class="h-7 w-7" /></div>
          <p class="text-[16px] font-bold">Customer 360°</p>
          <p class="mt-1.5 text-[13px] leading-5 text-[var(--sd-muted)]">Pick a customer to see everything in one place: profile, chats, notes, follow-ups and ratings.</p>
        </div>
      </div>
      <div v-else class="sd-page"><div class="sd-page-inner max-w-[1200px]">
        <SdErrorState v-if="error" :message="error" @retry="load" />
    <div v-else-if="!c" class="space-y-4"><div class="sd-skeleton h-28" /><div class="grid gap-4 lg:grid-cols-3"><div class="sd-skeleton h-72" /><div class="sd-skeleton h-72 lg:col-span-2" /></div></div>

    <template v-else>
      <NuxtLink to="/dashboard/customer-360" class="mb-3 inline-flex items-center gap-1 text-[12.5px] text-[var(--sd-muted)] hover:text-[var(--sd-text)] md:hidden"><ArrowLeft class="h-3.5 w-3.5" />All customers</NuxtLink>
      <div class="sd-card mb-4 flex flex-wrap items-center gap-4 p-5">
        <SdAvatar :name="c.name" :seed="c.id" size="xl" />
        <div class="min-w-0 flex-1">
          <h1 class="flex flex-wrap items-center gap-2 text-[22px] font-bold tracking-tight">{{ c.name }}<Crown v-if="c.is_vip" class="h-5 w-5 text-amber-500" /><SdBadge v-if="c.is_blocked" tone="red">Blocked</SdBadge></h1>
          <p class="mt-0.5 text-[13px] text-[var(--sd-muted)]">{{ flag(c.country) }} {{ c.phone }}<template v-if="c.email"> · {{ c.email }}</template><template v-if="c.profile_name && c.custom_name"> · WhatsApp name “{{ c.profile_name }}”</template></p>
          <div class="mt-2 flex flex-wrap gap-1.5"><span v-for="t in c.tags" :key="t.id" class="rounded-full px-2 py-0.5 text-[11.5px] font-semibold" :style="{ background: `${t.color}22`, color: t.color }">{{ t.name }}</span></div>
        </div>
        <div class="flex flex-wrap gap-2">
          <SdButton v-if="c.last_conversation" variant="primary" :icon="MessagesSquare" :to="`/dashboard/inbox?c=${c.last_conversation.id}`">Open chat</SdButton>
          <SdButton v-else-if="!c.is_blocked && can('inbox.send_template')" variant="primary" :icon="MessageCircle" @click="startOpen = true">Send message</SdButton>
          <SdButton v-if="can('followups.view')" :icon="CalendarPlus" @click="followupOpen = true">Follow-up</SdButton>
          <SdMenu :items="menu" />
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div class="space-y-4">
          <div class="sd-card p-5">
            <h2 class="mb-3 text-[14px] font-bold">Profile</h2>
            <dl class="space-y-2.5 text-[13px]">
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Segment</dt><dd class="capitalize">{{ c.segment || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Language</dt><dd>{{ ({ bn: 'Bangla', en: 'English', hi: 'Hindi', ar: 'Arabic' } as any)[c.language] || c.language }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Country</dt><dd>{{ countryName(c.country) || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Source</dt><dd>{{ c.source || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Address</dt><dd class="text-right">{{ c.address || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Customer since</dt><dd>{{ dateTime(c.created_at, false) }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Conversations</dt><dd>{{ c.conversation_count }}</dd></div>
            </dl>
          </div>
          <div class="sd-card p-5">
            <h2 class="text-[14px] font-bold">Marketing consent</h2>
            <p class="mb-3 mt-1 text-[12px] text-[var(--sd-muted)]">Broadcasts only go to opted-in customers. Replying “STOP” opts them out automatically.</p>
            <div class="grid grid-cols-3 gap-1 rounded-xl bg-[var(--sd-surface-strong)] p-1">
              <button v-for="o in consentOptions" :key="o.value" :disabled="!can('contacts.edit')" :class="['h-8 rounded-lg text-[12px] font-semibold transition disabled:cursor-not-allowed', c.consent === o.value ? 'bg-[var(--sd-surface)] shadow-sm' : 'text-[var(--sd-muted)]']" @click="setConsent(o.value)">{{ o.label }}</button>
            </div>
            <p v-if="c.consent_updated_at" class="mt-2 text-[11.5px] text-[var(--sd-faint)]">Changed {{ timeAgo(c.consent_updated_at) }}</p>
          </div>
          <div v-if="timeline?.ratings?.length" class="sd-card p-5">
            <h2 class="mb-3 text-[14px] font-bold">Ratings</h2>
            <div v-for="(r, i) in timeline.ratings" :key="i" class="flex items-center justify-between border-b border-[var(--sd-border)] py-2 text-[12.5px] last:border-0">
              <span class="font-semibold" :class="r.rating >= (r.max_rating === 5 ? 4 : 3) ? 'text-[var(--sd-primary)]' : r.rating <= 2 ? 'text-[var(--sd-danger)]' : 'text-amber-600'">{{ '★'.repeat(r.rating) }}<span class="text-[var(--sd-faint)]">{{ '★'.repeat(r.max_rating - r.rating) }}</span></span>
              <span class="text-[var(--sd-muted)]">{{ r.agent || '—' }} · {{ timeAgo(r.answered_at) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="sd-card p-5">
            <h2 class="mb-3 text-[14px] font-bold">Notes about this customer</h2>
            <form v-if="can('contacts.edit')" class="mb-3 flex gap-2" @submit.prevent="addNote">
              <textarea v-model="noteText" class="sd-input !min-h-[44px]" rows="1" placeholder="Visible to your team only — e.g. prefers calls after 6 pm" />
              <SdButton type="submit" variant="primary" :loading="savingNote" :disabled="!noteText.trim()">Add</SdButton>
            </form>
            <SdEmpty v-if="!notes.length" compact title="No notes yet" />
            <div v-for="n in notes" :key="n.id" class="group border-b border-[var(--sd-border)] py-2.5 last:border-0">
              <div class="flex items-center gap-2 text-[11.5px] text-[var(--sd-muted)]"><SdAvatar :name="n.author?.name" :seed="n.author?.id" size="xs" />{{ n.author?.name || 'Team' }} · {{ timeAgo(n.created_at) }}
                <button v-if="n.author?.id === me?.id || canManage" class="ml-auto hidden text-[var(--sd-danger)] group-hover:block" @click="deleteNote(n)">Delete</button></div>
              <p class="mt-1 whitespace-pre-wrap text-[13px]">{{ n.text }}</p>
            </div>
          </div>

          <div class="grid gap-4 xl:grid-cols-2">
            <div class="sd-card p-5">
              <h2 class="mb-3 text-[14px] font-bold">Conversations</h2>
              <SdEmpty v-if="!timeline?.conversations?.length" compact title="No conversations you can see" />
              <NuxtLink v-for="v in timeline?.conversations || []" :key="v.id" :to="`/dashboard/inbox?c=${v.id}`" class="block border-b border-[var(--sd-border)] py-2.5 last:border-0 hover:opacity-80">
                <div class="flex items-center gap-2"><SdBadge :tone="v.status === 'closed' ? 'gray' : 'green'">{{ STATUS_LABEL[v.status] }}</SdBadge><span class="text-[11.5px] text-[var(--sd-muted)]">{{ v.assigned_to || 'Unassigned' }} · {{ timeAgo(v.last_message_at) }}</span></div>
                <p class="mt-1 truncate text-[12.5px]">{{ v.last_message_preview }}</p>
              </NuxtLink>
            </div>
            <div class="sd-card p-5">
              <div class="mb-3 flex items-center justify-between"><h2 class="text-[14px] font-bold">Follow-ups</h2><button v-if="can('followups.view')" class="sd-link text-[12.5px]" @click="followupOpen = true">+ New</button></div>
              <SdEmpty v-if="!timeline?.followups?.length" compact title="Nothing scheduled" />
              <div v-for="f in timeline?.followups || []" :key="f.id" class="border-b border-[var(--sd-border)] py-2.5 last:border-0">
                <p class="text-[13px] font-semibold">{{ f.title || 'Follow-up' }}</p>
                <p class="text-[11.5px] text-[var(--sd-muted)]">{{ dateTime(f.due_at) }} · <span :class="f.status === 'open' && new Date(f.due_at) < new Date() ? 'font-semibold text-[var(--sd-danger)]' : ''">{{ f.status === 'open' && new Date(f.due_at) < new Date() ? 'overdue' : f.status }}</span><template v-if="f.owner"> · {{ f.owner }}</template></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
      </div></div>
    </section>
    <template v-if="c">
      <FollowupModal v-model:open="followupOpen" :contact="c" :conversation-id="c.last_conversation?.id" @saved="loadTimeline" />
      <InboxStartChatModal v-model:open="startOpen" :preset="c" @started="v => navigateTo(`/dashboard/inbox?c=${v.id}`)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Ban, CalendarPlus, Contact, Copy, Crown, MessageCircle, MessagesSquare, Pencil } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'contacts.view' })
useHead({ title: 'Customer 360°' })

const api = useApi()
const route = useRoute()
const { me, can, canManage } = useSession()
const { confirm } = useConfirm()
const id = computed(() => route.query.id as string | undefined)
const c = ref<any>(null)
const timeline = ref<any>(null)
const notes = ref<any[]>([])
const error = ref<string | null>(null)
const followupOpen = ref(false)
const startOpen = ref(false)
const noteText = ref('')
const savingNote = ref(false)
const consentOptions = [{ value: 'opted_in', label: 'Opted in' }, { value: 'unknown', label: 'Unknown' }, { value: 'opted_out', label: 'Opted out' }]

async function load() {
  if (!id.value) return
  error.value = null
  c.value = null
  try {
    const [contact, n] = await Promise.all([api.get(`contacts/${id.value}/`, { silent: true }), api.get(`contacts/${id.value}/notes/`, { silent: true })])
    c.value = contact
    notes.value = n
    useHead({ title: `${contact.name} · Customer 360°` })
    loadTimeline()
  } catch (e: any) { error.value = e.status === 404 ? 'This customer does not exist.' : e.message }
}
async function loadTimeline() { try { timeline.value = await api.get(`contacts/${id.value}/timeline/`, { silent: true }) } catch {} }
watch(id, load, { immediate: true })

async function setConsent(value: string) {
  if (value === c.value.consent) return
  try { c.value = { ...c.value, ...(await api.post(`contacts/${c.value.id}/consent/`, { consent: value })) }; toast.success('Consent updated') } catch {}
}
async function addNote() {
  savingNote.value = true
  try { notes.value.unshift(await api.post(`contacts/${c.value.id}/notes/`, { text: noteText.value.trim() })); noteText.value = '' } catch {} finally { savingNote.value = false }
}
async function deleteNote(n: any) {
  if (!(await confirm({ title: 'Delete this note?', confirmText: 'Delete', danger: true }))) return
  try { await api.del(`contacts/${c.value.id}/notes/${n.id}/`); notes.value = notes.value.filter(x => x.id !== n.id) } catch {}
}
async function setBlocked(blocked: boolean) {
  if (blocked && !(await confirm({ title: `Block ${c.value.name}?`, message: 'No messages can be sent to them and they are excluded from broadcasts.', confirmText: 'Block', danger: true }))) return
  try { await api.post(`contacts/${c.value.id}/block/`, { blocked }); toast.success(blocked ? 'Blocked' : 'Unblocked'); load() } catch {}
}
const menu = computed(() => [
  { label: 'Edit on Contacts page', icon: Pencil, hidden: !can('contacts.edit'), onSelect: () => navigateTo('/dashboard/contacts') },
  { label: 'Copy number', icon: Copy, hidden: !c.value?.wa_id, onSelect: () => copyText(c.value.phone).then(() => toast.success('Copied')) },
  { label: 'Send template message', icon: MessageCircle, hidden: c.value?.is_blocked || !can('inbox.send_template'), onSelect: () => { startOpen.value = true } },
  { separator: true },
  { label: c.value?.is_blocked ? 'Unblock' : 'Block', icon: Ban, danger: !c.value?.is_blocked, hidden: !can('contacts.block'), onSelect: () => setBlocked(!c.value.is_blocked) },
])

// customer list (left)
const q = ref('')
const filter = ref('')
const quick = [{ value: '', label: 'All' }, { value: 'recent', label: 'Chatted this week' }, { value: 'vip', label: 'VIP' }, { value: 'opted_in', label: 'Opted in' }, { value: 'blocked', label: 'Blocked' }]
const results = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const hasNext = ref(false)
const searching = ref(false)
const loadingMore = ref(false)
function listQuery(p: number) {
  const f = filter.value
  return { search: q.value, ordering: '-last_interaction_at', page: p,
    ...(f === 'vip' ? { vip: 'true' } : f === 'opted_in' ? { consent: 'opted_in' } : f === 'blocked' ? { blocked: 'true' } : f === 'recent' ? { active_days: 7 } : {}) }
}
async function search() {
  searching.value = true
  try {
    const res = await api.get('contacts/', { query: listQuery(1), silent: true })
    results.value = res.results; total.value = res.count; hasNext.value = !!res.next; page.value = 1
  } catch {} finally { searching.value = false }
}
async function onListScroll(e: Event) {
  const el = e.target as HTMLElement
  if (!hasNext.value || loadingMore.value || el.scrollTop + el.clientHeight < el.scrollHeight - 200) return
  loadingMore.value = true
  try {
    const res = await api.get('contacts/', { query: listQuery(page.value + 1), silent: true })
    results.value.push(...res.results); hasNext.value = !!res.next; page.value++
  } catch {} finally { loadingMore.value = false }
}
let timer: any
watch([q, filter], () => { clearTimeout(timer); timer = setTimeout(search, 250) })
onMounted(search)
</script>
