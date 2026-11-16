<template>
  <div class="flex h-full min-h-0">
    <InboxConversationList
      :class="['w-full shrink-0 md:w-[340px] xl:w-[360px]', activeId ? 'hidden md:flex' : 'flex']"
      :items="items" :loading="loading" :loading-more="loadingMore" :error="error" :active-id="activeId" :my-id="me?.id"
      :counts="counts" :tab="tab" :search="search" :active-filters="activeFilterCount" :typing="typing" :now="now"
      :can-start="can('inbox.send_template')" :sees-all="seesAll" :filters="filters"
      @select="open" @update:tab="t => tab = t" @update:search="s => search = s" @more="loadMore"
      @filters="filtersOpen = true" @clear-filters="clearFilters" @quick="(k, v) => filters = { ...filters, [k]: filters[k] === v ? '' : v }" @retry="reload" @start="startOpen = true" />

    <InboxChatPanel v-if="activeId" :id="activeId" :key="activeId" :members="options.members || []"
      :class="activeId ? 'flex' : 'hidden md:flex'" @back="close" @updated="onDetailUpdated" @gone="onGone" />
    <div v-else class="sd-chat-wallpaper hidden flex-1 items-center justify-center md:flex">
      <div class="max-w-sm px-6 text-center">
        <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[var(--sd-surface)] text-[var(--sd-primary)] shadow-sm"><MessagesSquare class="h-7 w-7" /></div>
        <p class="text-[16px] font-bold">Select a chat</p>
        <p class="mt-1.5 text-[13px] leading-5 text-[var(--sd-muted)]">Customer messages arrive here in real time. Pick a conversation on the left to reply, assign it or leave an internal note.</p>
        <p class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--sd-surface)] px-3 py-1 text-[11.5px] text-[var(--sd-muted)] shadow-sm">
          <span :class="['h-1.5 w-1.5 rounded-full', rtStatus === 'open' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500']" />{{ rtStatus === 'open' ? 'Live — new messages appear instantly' : 'Connecting to live updates…' }}
        </p>
      </div>
    </div>

    <InboxFilterDrawer v-model:open="filtersOpen" v-model="filters" :options="options" :sees-all="seesAll" />
    <InboxStartChatModal v-model:open="startOpen" @started="c => { upsert(c); open(c.id) }" />
  </div>
</template>

<script setup lang="ts">
import { MessagesSquare } from '@lucide/vue'

definePageMeta({ layout: 'dashboard', capability: 'inbox.view' })
useHead({ title: 'Inbox' })

const api = useApi()
const rt = useRealtime()
const route = useRoute()
const router = useRouter()
const { me, can, seesAll } = useSession()
const rtStatus = rt.status
const { inbox: badgeCounts } = useAppBadges()

const items = ref<any[]>([])
const counts = ref<Record<string, number>>({})
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const hasNext = ref(false)
const tab = ref(String(route.query.tab || 'all'))
const search = ref('')
const filters = ref<Record<string, string>>({})
const filtersOpen = ref(false)
const startOpen = ref(false)
const options = ref<any>({ members: [], countries: [], tags: [], priorities: [] })
const typing = ref<Record<string, string>>({})
const now = ref(Date.now())
const activeId = computed(() => (route.query.c as string) || null)

const activeFilterCount = computed(() => Object.values(filters.value).filter(Boolean).length)
const query = computed(() => ({ tab: tab.value, search: search.value, ...filters.value }))

let controller: AbortController | null = null
async function fetchPage(p: number) {
  controller?.abort()
  controller = new AbortController()
  return api.get('inbox/conversations/', { query: { ...query.value, page: p }, signal: controller.signal, silent: true })
}

async function reload() {
  loading.value = true
  error.value = null
  try {
    const res = await fetchPage(1)
    items.value = res.results
    counts.value = res.counts
    badgeCounts.value = res.counts
    hasNext.value = !!res.next
    page.value = 1
  } catch (e: any) {
    if (e?.name !== 'AbortError') error.value = e.message
  } finally { loading.value = false }
}

async function loadMore() {
  if (!hasNext.value || loadingMore.value || loading.value) return
  loadingMore.value = true
  try {
    const res = await api.get('inbox/conversations/', { query: { ...query.value, page: page.value + 1 }, silent: true })
    const known = new Set(items.value.map(c => c.id))
    items.value.push(...res.results.filter((c: any) => !known.has(c.id)))
    hasNext.value = !!res.next
    page.value++
  } catch {} finally { loadingMore.value = false }
}

let refreshTimer: any
function softRefresh() {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(async () => {
    try {
      const res = await api.get('inbox/conversations/', { query: { ...query.value, page: 1 }, silent: true })
      counts.value = res.counts
      // merge page 1 into what is shown, keep already loaded older pages
      const fresh = new Map(res.results.map((c: any) => [c.id, c]))
      const last = res.results[res.results.length - 1]
      // older pages already loaded stay; anything newer than page 1's last row but missing from it no longer matches
      const rest = items.value.filter(c => !fresh.has(c.id) && (!last || !newer(c, last)))
      items.value = [...res.results, ...rest]
    } catch {}
  }, 500)
}

let searchTimer: any
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(reload, 300) })
watch([tab, filters], () => {
  router.replace({ query: { ...route.query, tab: tab.value === 'all' ? undefined : tab.value } })
  reload()
}, { deep: true })

function open(id: string) { router.push({ query: { ...route.query, c: id } }) }
function close() { const q = { ...route.query }; delete q.c; router.push({ query: q }) }
function clearFilters() { filters.value = {} }

/** Does this conversation belong in the current tab? (cheap client-side check; the server re-checks on refresh) */
function fits(c: any) {
  const isOpen = c.status === 'open' || c.status === 'pending'
  switch (tab.value) {
    case 'closed': return c.status === 'closed'
    case 'pending': return c.status === 'pending'
    case 'mine': return isOpen && c.assigned_to?.id === me.value?.id
    case 'unassigned': return isOpen && !c.assigned_to
    case 'unread': return isOpen && c.unread_count > 0
    case 'unreplied': return isOpen && !!c.awaiting_reply_since
    default: return isOpen
  }
}
function visibleToMe(c: any) {
  return seesAll.value || !c.assigned_to || c.assigned_to.id === me.value?.id
}
function upsert(c: any) {
  const i = items.value.findIndex(x => x.id === c.id)
  if (!visibleToMe(c) || (!fits(c) && c.id !== activeId.value) || search.value || activeFilterCount.value) {
    if (i >= 0 && (!visibleToMe(c) || !fits(c))) items.value.splice(i, 1)
    if (search.value || activeFilterCount.value) softRefresh()
    return
  }
  const merged = i >= 0 ? { ...items.value[i], ...c } : c
  if (i >= 0) items.value.splice(i, 1)
  // Put the chat where the server's order (newest message first) puts it, not blindly on top:
  // Meta re-delivers old messages (e.g. after the webhook was offline), and those must not jump up.
  const at = items.value.findIndex(x => newer(merged, x))
  if (at >= 0) items.value.splice(at, 0, merged)
  else if (i >= 0 || !hasNext.value) items.value.push(merged)  // older than everything loaded: only keep if no more pages
}

// Same order as the API: last_message_at desc, then created_at desc
function stamp(c: any) { return [new Date(c.last_message_at || 0).getTime(), new Date(c.created_at || 0).getTime()] }
function newer(a: any, b: any) {
  const [a1, a2] = stamp(a), [b1, b2] = stamp(b)
  return a1 !== b1 ? a1 > b1 : a2 > b2
}

function onDetailUpdated(detail: any) {
  const { permissions, window_seconds_left, closed_by, ...row } = detail
  upsert({ ...row, contact: { id: detail.contact.id, name: detail.contact.name, phone: detail.contact.phone, country: detail.contact.country, is_blocked: detail.contact.is_blocked } })
  softRefresh()
}
function onGone(id: string) {
  items.value = items.value.filter(c => c.id !== id)
  if (activeId.value === id) close()
  softRefresh()
}

rt.on((e) => {
  switch (e.type) {
    case 'message.created':
      upsert(e.conversation)
      if (e.message.direction === 'in') delete typing.value[e.conversation.id]
      softRefresh()
      break
    case 'conversation.updated':
      upsert(e.conversation)
      softRefresh()
      break
    case 'message.updated': {
      // sent → delivered → seen: update the ticks on the chat's row
      const row = items.value.find(c => c.id === e.conversation_id)
      if (row?.last_message && row.last_message.id === e.message?.id && row.last_message.status !== e.message.status) {
        row.last_message = { ...row.last_message, status: e.message.status }
      }
      break
    }
    case 'conversation.removed':
      items.value = items.value.filter(c => c.id !== e.conversation_id)
      softRefresh()
      break
    case 'agent.activity':
      if (e.activity === 'typing' && e.agent.id !== me.value?.id) {
        typing.value[e.conversation_id] = e.agent.name
        setTimeout(() => { if (typing.value[e.conversation_id] === e.agent.name) delete typing.value[e.conversation_id] }, 5000)
      }
      break
    case 'agent.presence': {
      const m = options.value.members?.find((x: any) => x.id === e.agent.id)
      if (m) Object.assign(m, { is_online: e.agent.is_online, is_available: e.agent.is_available })
      break
    }
    case 'resync':
      reload()
      break
  }
})

const tickTimer = setInterval(() => { now.value = Date.now() }, 30000)
onBeforeUnmount(() => clearInterval(tickTimer))

onMounted(async () => {
  reload()
  try { options.value = await api.get('inbox/filters/', { silent: true }) } catch {}
  if ('Notification' in window && Notification.permission === 'default') {
    const ask = () => { Notification.requestPermission().catch(() => {}); window.removeEventListener('click', ask) }
    window.addEventListener('click', ask, { once: true })
  }
})
</script>