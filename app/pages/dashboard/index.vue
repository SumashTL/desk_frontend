<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader :title="`${greeting}, ${firstName}`" :subtitle="data?.is_team_view ? 'Here is how the whole team is doing today.' : 'Here is your day at a glance.'">
      <SdButton :icon="RefreshCw" :loading="loading" @click="load">Refresh</SdButton>
      <SdButton variant="primary" :icon="MessagesSquare" to="/dashboard/inbox">Open inbox</SdButton>
    </SdPageHeader>

    <SdErrorState v-if="error && !data" :message="error" @retry="load" />
    <template v-else>
      <div v-if="conn && (!conn.configured || conn.dry_run)" class="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-[13px]">
        <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div><p class="font-semibold">{{ !conn.configured ? 'WhatsApp is not connected yet' : 'Test mode: messages are not sent to WhatsApp' }}</p>
          <p class="mt-0.5 text-[var(--sd-muted)]">{{ !conn.configured ? 'Add the WhatsApp Cloud API credentials to the server .env file.' : 'WA_DRY_RUN is on in the server .env. Replies are saved but not delivered. Turn it off to go live.' }}</p></div>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SdStat label="Open chats" :value="num(c.open)" :hint="`${num(c.pending)} pending`" :icon="MessagesSquare" :loading="loading && !data" />
        <SdStat label="Waiting for reply" :value="num(c.awaiting_reply)" :hint="`${num(c.unread)} unread`" :icon="Hourglass" tone="amber" :loading="loading && !data" />
        <SdStat :label="data?.is_team_view ? 'Unassigned' : 'Assigned to me'" :value="num(data?.is_team_view ? c.unassigned : c.mine)" :hint="data?.is_team_view ? 'in the queue' : `${num(c.unassigned)} in the queue`" :icon="data?.is_team_view ? Inbox : UserRound" tone="blue" :loading="loading && !data" />
        <SdStat label="Resolved today" :value="num(c.resolved_today)" :hint="`${num(c.active_today)} chats active today`" :icon="CheckCircle2" tone="violet" :loading="loading && !data" />
        <SdStat label="Messages today" :value="num((m.incoming || 0) + (m.outgoing || 0))" :hint="`${num(m.incoming)} in · ${num(m.outgoing)} out${m.failed ? ` · ${m.failed} failed` : ''}`" :icon="MessageSquareText" :loading="loading && !data" />
        <SdStat label="Avg. first response (7d)" :value="duration(data?.avg_first_response_seconds_7d)" :icon="Timer" tone="blue" :loading="loading && !data" />
        <SdStat label="CSAT (30d)" :value="data?.csat_30d?.csat_percent != null ? `${data.csat_30d.csat_percent}%` : '—'" :hint="data?.csat_30d?.responses ? `${data.csat_30d.average} avg · ${data.csat_30d.responses} ratings` : 'No ratings yet'" :icon="HeartHandshake" tone="green" :loading="loading && !data" />
        <SdStat label="Follow-ups" :value="num(data?.followups?.due_today)" :hint="data?.followups?.overdue ? `${data.followups.overdue} overdue` : 'due today'" :icon="CalendarClock" :tone="data?.followups?.overdue ? 'red' : 'gray'" :loading="loading && !data" />
      </div>

      <div class="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div class="sd-card p-5">
          <div class="mb-2 flex items-center justify-between"><h2 class="text-[14px] font-bold">Messages · last 7 days</h2></div>
          <SdChart v-if="trend.length" :labels="trend.map(t => t.label)" :series="[{ name: 'Incoming', data: trend.map(t => t.values.incoming), type: 'bar' }, { name: 'Outgoing', data: trend.map(t => t.values.outgoing), type: 'bar', color: '#7fc49a' }]" />
        </div>
        <div class="sd-card flex flex-col p-5">
          <h2 class="mb-3 text-[14px] font-bold">WhatsApp connection</h2>
          <div v-if="conn" class="space-y-3 text-[13px]">
            <div class="flex items-center gap-3">
              <span :class="['grid h-10 w-10 place-items-center rounded-xl', conn.configured && !conn.dry_run ? 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary)]' : 'bg-amber-500/12 text-amber-600']"><Smartphone class="h-5 w-5" /></span>
              <div><p class="font-semibold">{{ conn.business_name || 'WhatsApp Business' }}</p><p class="text-[12px] text-[var(--sd-muted)]">{{ conn.phone_number || 'Number from Meta' }}</p></div>
              <SdBadge class="ml-auto" :tone="conn.configured && !conn.dry_run ? 'green' : 'amber'" dot>{{ conn.configured ? (conn.dry_run ? 'Test mode' : 'Live') : 'Not set up' }}</SdBadge>
            </div>
            <dl class="grid grid-cols-2 gap-2 text-[12.5px]">
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Webhook</dt><dd class="mt-0.5 font-semibold">{{ conn.webhook_ready ? 'Secured' : 'Secret missing' }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Last event</dt><dd class="mt-0.5 font-semibold">{{ conn.last_webhook_at ? timeAgo(conn.last_webhook_at) : 'None yet' }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Approved templates</dt><dd class="mt-0.5 font-semibold">{{ conn.approved_templates }} / {{ conn.templates_count }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Graph API</dt><dd class="mt-0.5 font-semibold">{{ conn.api_version || '—' }}</dd></div>
            </dl>
          </div>
          <div v-else class="sd-skeleton h-32" />
        </div>
      </div>

      <div class="mt-4 grid gap-4" :class="data?.is_team_view ? 'xl:grid-cols-[1.2fr_1fr]' : ''">
        <div class="sd-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-[var(--sd-border)] px-5 py-3.5"><h2 class="text-[14px] font-bold">Recent conversations</h2><NuxtLink to="/dashboard/inbox" class="sd-link text-[12.5px]">View all</NuxtLink></div>
          <SdEmpty v-if="data && !data.recent_conversations.length" compact title="No conversations yet" text="When customers message your WhatsApp number they show up here." />
          <NuxtLink v-for="r in data?.recent_conversations || []" :key="r.id" :to="`/dashboard/inbox?c=${r.id}`" class="flex items-center gap-3 border-b border-[var(--sd-border)] px-5 py-3 last:border-0 hover:bg-[var(--sd-surface-soft)]">
            <SdAvatar :name="r.contact.name" :seed="r.contact.id" size="sm" />
            <div class="min-w-0 flex-1"><p class="truncate text-[13px] font-semibold">{{ r.contact.name }}</p><p class="truncate text-[12px] text-[var(--sd-muted)]">{{ r.last_message_direction === 'out' ? 'You: ' : '' }}{{ r.last_message_preview }}</p></div>
            <div class="hidden text-right sm:block"><SdBadge :tone="r.status === 'closed' ? 'gray' : r.status === 'pending' ? 'violet' : 'green'">{{ STATUS_LABEL[r.status] }}</SdBadge><p class="mt-1 text-[11px] text-[var(--sd-faint)]">{{ r.assigned_to?.name || 'Unassigned' }} · {{ timeAgo(r.last_message_at, true) }}</p></div>
            <span v-if="r.unread_count" class="rounded-full bg-[var(--sd-primary)] px-1.5 text-[10.5px] font-bold leading-[18px] text-[var(--sd-on-primary)]">{{ r.unread_count }}</span>
          </NuxtLink>
        </div>
        <div v-if="data?.is_team_view" class="sd-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-[var(--sd-border)] px-5 py-3.5">
            <h2 class="text-[14px] font-bold">Team today</h2>
            <span class="text-[12px] text-[var(--sd-muted)]">{{ data.team.online }} online · {{ data.team.available }} available</span>
          </div>
          <div class="sd-scroll max-h-[420px]">
            <div v-for="t in team" :key="t.id" class="flex items-center gap-3 border-b border-[var(--sd-border)] px-5 py-3 last:border-0">
              <SdAvatar :name="t.name" :src="t.avatar" :seed="t.id" size="sm" :online="t.is_online" />
              <div class="min-w-0 flex-1"><p class="truncate text-[13px] font-semibold">{{ t.name }}</p><p class="text-[11.5px] text-[var(--sd-muted)]">{{ ROLE_LABEL[t.role] }} · {{ t.is_online ? (t.is_available ? 'Available' : 'Away') : 'Offline' }}</p></div>
              <div class="grid grid-cols-3 gap-4 text-center text-[11px] text-[var(--sd-muted)]">
                <div><p class="text-[14px] font-bold text-[var(--sd-text)]">{{ t.open_conversations }}</p>open</div>
                <div><p class="text-[14px] font-bold text-[var(--sd-text)]">{{ t.resolved }}</p>resolved</div>
                <div><p class="text-[14px] font-bold text-[var(--sd-text)]">{{ duration(t.avg_response_seconds) }}</p>reply</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div></div>
</template>

<script setup lang="ts">
import { CalendarClock, CheckCircle2, HeartHandshake, Hourglass, Inbox, MessageSquareText, MessagesSquare, RefreshCw, Smartphone, Timer, TriangleAlert, UserRound } from '@lucide/vue'
definePageMeta({ layout: 'dashboard', capability: 'dashboard.view' })
useHead({ title: 'Dashboard' })
const api = useApi()
const rt = useRealtime()
const { me } = useSession()
const data = ref<any>(null)
const conn = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const c = computed(() => data.value?.conversations || {})
const m = computed(() => data.value?.messages_today || {})
const trend = computed(() => data.value ? fillDays(data.value.trend_7d, 7, ['incoming', 'outgoing']) : [])
const team = ref<any[]>([])
const firstName = computed(() => (me.value?.name || '').split(' ')[0])
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' })

async function load() {
  loading.value = true
  error.value = null
  try {
    const [d, w] = await Promise.all([api.get('dashboard/summary/', { silent: true }), api.get('whatsapp/connection/', { silent: true })])
    data.value = d
    conn.value = w
    team.value = d.team_members || []
  } catch (e: any) { error.value = e.message } finally { loading.value = false }
}
let timer: any
rt.on((e) => {
  if (e.type === 'agent.presence') { const t = team.value.find(x => x.id === e.agent.id); if (t) Object.assign(t, { is_online: e.agent.is_online, is_available: e.agent.is_available }) }
  if (['message.created', 'conversation.updated'].includes(e.type)) { clearTimeout(timer); timer = setTimeout(load, 2000) }
})
onMounted(load)
</script>
