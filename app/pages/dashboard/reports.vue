<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Reports" :subtitle="summary?.is_team_view ? 'Team performance across chats, response time, ratings and broadcasts.' : 'Your own performance numbers.'">
      <select v-model.number="days" class="sd-input !w-auto"><option :value="7">Last 7 days</option><option :value="30">Last 30 days</option><option :value="90">Last 90 days</option><option :value="365">Last 12 months</option></select>
      <SdMenu v-if="can('reports.export')" :items="exportItems"><SdButton :icon="Download">Export CSV</SdButton></SdMenu>
    </SdPageHeader>

    <SdErrorState v-if="error && !summary" :message="error" @retry="load" />
    <template v-else>
      <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SdStat label="Chats started" :value="num(summary?.conversations?.opened)" :hint="`${num(summary?.conversations?.open_now)} open right now`" :icon="MessagesSquare" :loading="!summary" />
        <SdStat label="Chats resolved" :value="num(summary?.conversations?.resolved)" :icon="CheckCircle2" tone="violet" :loading="!summary" />
        <SdStat label="Avg. first response" :value="duration(summary?.avg_first_response_seconds)" :hint="slaText" :icon="Timer" tone="blue" :loading="!summary" />
        <SdStat label="CSAT" :value="summary?.csat?.csat_percent != null ? `${summary.csat.csat_percent}%` : '—'" :hint="summary?.csat?.responses ? `${summary.csat.average} avg · ${summary.csat.responses} ratings` : 'No ratings'" :icon="HeartHandshake" :loading="!summary" />
        <SdStat label="Messages received" :value="num(summary?.messages?.incoming)" :icon="ArrowDownLeft" tone="gray" :loading="!summary" />
        <SdStat label="Messages sent" :value="num(summary?.messages?.outgoing)" :icon="ArrowUpRight" tone="gray" :loading="!summary" />
        <SdStat label="Failed messages" :value="num(summary?.messages?.failed)" :icon="AlertCircle" :tone="summary?.messages?.failed ? 'red' : 'gray'" :loading="!summary" />
        <SdStat v-if="summary?.broadcasts" label="Broadcast read rate" :value="pct(summary.broadcasts.read_rate)" :hint="`${num(summary.broadcasts.campaigns)} campaigns · ${num(summary.broadcasts.sent)} sent`" :icon="Megaphone" tone="amber" />
        <SdStat v-else label="SLA met" :value="summary?.sla?.enabled ? pct(summary.sla.achieved_percent) : 'Off'" :icon="Gauge" tone="amber" :loading="!summary" />
      </div>

      <!-- team gaps -->
      <div class="mb-4 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div class="sd-card p-5">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="text-[14px] font-bold">What needs attention</h2>
            <div v-if="insights" class="flex gap-3 text-[11.5px] text-[var(--sd-muted)]">
              <span><b class="text-[var(--sd-text)]">{{ insights.waiting_now.total }}</b> waiting now</span>
              <span><b :class="insights.missed_24h ? 'text-[var(--sd-danger)]' : 'text-[var(--sd-text)]'">{{ insights.missed_24h }}</b> missed (24 h)</span>
            </div>
          </div>
          <div v-if="!insights" class="space-y-2"><div v-for="i in 3" :key="i" class="sd-skeleton h-14" /></div>
          <div v-else class="space-y-2">
            <div v-for="(f, i) in insights.findings" :key="i" :class="['rounded-xl border-l-[3px] bg-[var(--sd-surface-soft)] px-3.5 py-2.5', LEVEL[f.level]]">
              <p class="text-[13px] font-semibold">{{ f.title }}</p>
              <p class="mt-0.5 text-[12px] leading-[18px] text-[var(--sd-muted)]">{{ f.text }}</p>
            </div>
          </div>
        </div>
        <div class="sd-card p-5">
          <h2 class="text-[14px] font-bold">How fast the first reply comes</h2>
          <p class="mb-3 mt-0.5 text-[12px] text-[var(--sd-muted)]">Time from the customer’s message to our first answer<template v-if="insights"> · target {{ insights.sla_target_minutes }} min</template></p>
          <div v-if="!insights" class="sd-skeleton h-40" />
          <div v-else class="space-y-2.5">
            <div v-for="(b, i) in insights.response_buckets" :key="b.label" class="flex items-center gap-3 text-[12.5px]">
              <span class="w-24 shrink-0 text-[var(--sd-muted)]">{{ b.label }}</span>
              <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--sd-surface-strong)]"><div class="h-full rounded-full transition-all" :style="{ width: `${b.percent}%`, background: ['#13824b', '#3fa36b', '#d6a537', '#e0803c', '#d64545'][i] }" /></div>
              <span class="w-16 shrink-0 text-right tabular-nums"><b>{{ b.percent }}%</b> <span class="text-[var(--sd-faint)]">{{ b.count }}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="sd-card mb-4 p-5">
        <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-[14px] font-bold">When customers write</h2>
          <p v-if="busiest" class="text-[12px] text-[var(--sd-muted)]">Busiest: <b class="text-[var(--sd-text)]">{{ busiest }}</b> · darker = more messages</p>
        </div>
        <div v-if="!insights" class="sd-skeleton h-44" />
        <div v-else class="overflow-x-auto">
          <div class="min-w-[640px]">
            <div class="grid grid-cols-[36px_repeat(24,minmax(0,1fr))] gap-[3px] text-[10px] text-[var(--sd-faint)]">
              <span />
              <span v-for="h in 24" :key="h" class="text-center">{{ (h - 1) % 3 === 0 ? `${String(h - 1).padStart(2, '0')}` : '' }}</span>
              <template v-for="(row, d) in insights.heatmap.grid" :key="d">
                <span class="self-center text-[11px] text-[var(--sd-muted)]">{{ insights.heatmap.weekdays[d] }}</span>
                <span v-for="(n, h) in row" :key="h" class="aspect-square rounded-[4px]" :style="{ background: heat(n) }" :title="`${insights.heatmap.weekdays[d]} ${String(h).padStart(2, '0')}:00 · ${n} messages · first reply ${duration(insights.by_hour[h].avg_first_reply_seconds)}`" />
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4 grid gap-4 xl:grid-cols-2">
        <div class="sd-card p-5">
          <h2 class="mb-2 text-[14px] font-bold">Conversations per day</h2>
          <SdChart v-if="series.length" :labels="series.map(s => s.label)" :series="[{ name: 'Started', data: series.map(s => s.opened) }, { name: 'Resolved', data: series.map(s => s.resolved), color: '#8b5cf6' }]" />
          <div v-else class="sd-skeleton h-[260px]" />
        </div>
        <div class="sd-card p-5">
          <h2 class="mb-2 text-[14px] font-bold">Messages per day</h2>
          <SdChart v-if="series.length" :labels="series.map(s => s.label)" :series="[{ name: 'Received', data: series.map(s => s.incoming), type: 'bar' }, { name: 'Sent', data: series.map(s => s.outgoing), type: 'bar', color: '#7fc49a' }]" />
          <div v-else class="sd-skeleton h-[260px]" />
        </div>
      </div>

      <div class="sd-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-[var(--sd-border)] px-5 py-3.5">
          <h2 class="text-[14px] font-bold">{{ summary?.is_team_view ? 'Agent performance' : 'My performance' }}</h2>
          <span v-if="summary?.sla?.enabled" class="text-[12px] text-[var(--sd-muted)]">SLA target: first reply within {{ summary.sla.target_minutes }} min</span>
        </div>
        <SdTableSkeleton v-if="!agents" :rows="4" />
        <SdEmpty v-else-if="!agents.length" compact title="No activity in this period" />
        <div v-else class="overflow-x-auto">
          <table class="sd-table min-w-[820px]">
            <thead><tr><th>Member</th><th class="text-right">Open now</th><th class="text-right">Resolved</th><th class="text-right">Messages sent</th><th class="text-right">Avg. reply</th><th class="text-right">Ratings</th><th class="text-right">Avg. rating</th></tr></thead>
            <tbody>
              <tr v-for="a in agents" :key="a.id">
                <td><div class="flex items-center gap-3"><SdAvatar :name="a.name" :src="a.avatar" :seed="a.id" size="sm" :online="a.is_online" /><div><p class="font-semibold">{{ a.name }}</p><p class="text-[11.5px] text-[var(--sd-muted)]">{{ ROLE_LABEL[a.role] }}</p></div></div></td>
                <td class="text-right">{{ a.open_conversations }}</td>
                <td class="text-right font-semibold">{{ a.resolved }}</td>
                <td class="text-right">{{ num(a.messages_sent) }}</td>
                <td class="text-right" :class="sla && a.avg_response_seconds > sla * 60 ? 'font-semibold text-[var(--sd-danger)]' : ''">{{ duration(a.avg_response_seconds) }}</td>
                <td class="text-right">{{ a.csat_responses }}</td>
                <td class="text-right font-semibold">{{ a.average_rating ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div></div>
</template>
<script setup lang="ts">
import { AlertCircle, ArrowDownLeft, ArrowUpRight, CheckCircle2, Download, Gauge, HeartHandshake, Megaphone, MessagesSquare, Timer } from '@lucide/vue'
definePageMeta({ layout: 'dashboard', capability: 'reports.view' })
useHead({ title: 'Reports' })
const api = useApi()
const { can } = useSession()
const days = ref(30)
const summary = ref<any>(null)
const series = ref<any[]>([])
const agents = ref<any[] | null>(null)
const insights = ref<any>(null)
const LEVEL: Record<string, string> = { high: 'border-[var(--sd-danger)]', medium: 'border-amber-500', low: 'border-sky-500', good: 'border-[var(--sd-primary)]' }
const heatMax = computed(() => Math.max(1, ...(insights.value?.heatmap.grid.flat() || [0])))
function heat(n: number) {
  if (!n) return 'var(--sd-surface-strong)'
  return `color-mix(in srgb, var(--sd-primary) ${Math.round(15 + (n / heatMax.value) * 85)}%, var(--sd-surface))`
}
const busiest = computed(() => {
  const rows = insights.value?.by_hour?.filter((r: any) => r.incoming) || []
  if (!rows.length) return ''
  const top = [...rows].sort((a: any, b: any) => b.incoming - a.incoming).slice(0, 3).sort((a: any, b: any) => a.hour - b.hour)
  return top.map((r: any) => `${String(r.hour).padStart(2, '0')}:00`).join(', ')
})
const error = ref<string | null>(null)
const sla = computed(() => summary.value?.sla?.enabled ? summary.value.sla.target_minutes : null)
const slaText = computed(() => summary.value?.sla?.enabled ? `${pct(summary.value.sla.achieved_percent)} within ${summary.value.sla.target_minutes} min` : '')
async function load() {
  error.value = null
  agents.value = null
  try {
    const q = { query: { days: days.value }, silent: true }
    insights.value = null
    api.get('reports/insights/', q).then((r: any) => { insights.value = r }).catch(() => {})
    const [s, t, a] = await Promise.all([api.get('reports/summary/', q), api.get('reports/timeseries/', q), api.get('reports/agents/', q)])
    summary.value = s
    series.value = t.series.map((r: any) => ({ ...r, label: new Date(r.day).toLocaleDateString([], { day: 'numeric', month: 'short' }) }))
    agents.value = a.results
  } catch (e: any) { error.value = e.message }
}
watch(days, load)
onMounted(load)
const exportItems = computed(() => [
  { label: 'Conversations', onSelect: () => api.download('reports/export/conversations/', { days: days.value }) },
  { label: 'Agent performance', onSelect: () => api.download('reports/export/agents/', { days: days.value }) },
  { label: 'Ratings (CSAT)', onSelect: () => api.download('reports/export/csat/', { days: days.value }) },
  { label: 'Daily totals', onSelect: () => api.download('reports/export/daily/', { days: days.value }) },
])
</script>
