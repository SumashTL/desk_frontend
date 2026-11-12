<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Customer satisfaction" subtitle="Customers rate the chat on WhatsApp after it is resolved.">
      <select v-model.number="days" class="sd-input !w-auto"><option :value="7">Last 7 days</option><option :value="30">Last 30 days</option><option :value="90">Last 90 days</option><option :value="365">Last 12 months</option></select>
      <SdButton v-if="can('csat.configure')" :icon="Settings2" @click="settingsOpen = true">Settings</SdButton>
    </SdPageHeader>

    <div v-if="settings && !settings.enabled" class="mb-4 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-[13px]">
      <TriangleAlert class="h-4 w-4 text-amber-600" /><span class="flex-1">Rating requests are switched off, so no new ratings are collected.</span>
      <SdButton v-if="can('csat.configure')" size="sm" @click="settingsOpen = true">Turn on</SdButton>
    </div>

    <details class="sd-card mb-4 p-4 text-[13px] leading-6">
      <summary class="cursor-pointer font-semibold">How ratings work</summary>
      <ol class="mt-2 list-decimal space-y-1 pl-5 text-[var(--sd-muted)]">
        <li>When an agent presses <b>Resolve</b>, the customer gets a short WhatsApp message: <i>“How would you rate the help you got today?”</i> with a <b>Rate us</b> button showing ⭐ 1 to 5.</li>
        <li>The customer taps a rating (typing a number like <b>5</b> or <b>৫</b> also counts). It is saved to the chat and to the agent who handled it.</li>
        <li><b>CSAT score</b> = share of happy ratings (4–5 stars). <b>Low ratings</b> (2 or lower by default) show up in Notifications so a manager can follow up.</li>
        <li>WhatsApp allows this message only within 24 hours of the customer’s last message — resolve chats soon after the conversation ends. You can also ask for a rating any time from the chat’s ⋯ menu.</li>
      </ol>
    </details>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SdStat label="CSAT score" :value="summary?.csat_percent != null ? `${summary.csat_percent}%` : '—'" hint="share of happy ratings" :icon="Smile" :loading="!summary" />
      <SdStat label="Average rating" :value="summary?.average_rating ?? '—'" :hint="`${num(summary?.responses)} ratings`" :icon="Star" tone="amber" :loading="!summary" />
      <SdStat label="Response rate" :value="pct(summary?.response_rate)" :hint="`${num(summary?.requested)} requests sent`" :icon="Send" tone="blue" :loading="!summary" />
      <SdStat label="Low ratings" :value="num(summary?.low_ratings)" :hint="summary ? `${summary.low_rating_threshold} or lower` : ''" :icon="Frown" tone="red" :loading="!summary" />
    </div>

    <div class="mb-4 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <div class="sd-card p-5">
        <h2 class="mb-4 text-[14px] font-bold">Rating distribution</h2>
        <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="mb-2.5 flex items-center gap-3 text-[12.5px]">
          <span class="w-8 font-semibold">{{ n }} ★</span>
          <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--sd-surface-strong)]"><div class="h-full rounded-full" :style="{ width: `${bar(n)}%`, background: n >= 4 ? 'var(--sd-primary)' : n === 3 ? '#e0a83c' : 'var(--sd-danger)' }" /></div>
          <span class="w-10 text-right text-[var(--sd-muted)]">{{ summary?.distribution?.[n] ?? 0 }}</span>
        </div>
      </div>
      <div class="sd-card overflow-hidden">
        <div class="border-b border-[var(--sd-border)] px-5 py-3.5"><h2 class="text-[14px] font-bold">{{ can('reports.team') ? 'By agent' : 'Your ratings' }}</h2></div>
        <SdEmpty v-if="!agents.length" compact title="No ratings in this period" />
        <table v-else class="sd-table"><thead><tr><th>Agent</th><th class="text-right">Ratings</th><th class="text-right">Average</th><th class="text-right">CSAT</th></tr></thead>
          <tbody><tr v-for="a in agents" :key="a.agent.id"><td class="font-semibold">{{ a.agent.name }}</td><td class="text-right">{{ a.responses }}</td><td class="text-right">{{ a.average_rating }}</td><td class="text-right font-semibold">{{ pct(a.csat_percent) }}</td></tr></tbody></table>
      </div>
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <h2 class="mr-2 text-[14px] font-bold">Ratings</h2>
        <SdSearch v-model="list.filters.search" placeholder="Customer name or number" class="w-full sm:w-60" />
        <select v-model="list.filters.status" class="sd-input !w-auto"><option value="">Any status</option><option value="answered">Answered</option><option value="sent">Waiting for answer</option><option value="pending">Scheduled</option><option value="failed">Failed</option></select>
        <button :class="['sd-chip', list.filters.low === 'true' && 'is-active']" @click="list.filters.low = list.filters.low === 'true' ? '' : 'true'"><Frown class="h-3.5 w-3.5" />Low only</button>
      </div>
      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="HeartHandshake" title="No ratings yet" text="When a chat is resolved, the customer gets a rating request on WhatsApp (if enabled)." />
      <div v-else class="overflow-x-auto">
        <table class="sd-table min-w-[720px]"><thead><tr><th>Customer</th><th>Rating</th><th>Agent</th><th>Status</th><th>When</th><th /></tr></thead>
          <tbody>
            <tr v-for="s in list.items.value" :key="s.id">
              <td><p class="font-semibold">{{ s.contact.name }}</p><p class="text-[12px] text-[var(--sd-muted)]">{{ s.contact.phone }}</p></td>
              <td><span v-if="s.rating" :class="['font-semibold', s.rating >= (s.max_rating === 5 ? 4 : 3) ? 'text-[var(--sd-primary)]' : s.rating <= (settings?.low_rating_threshold ?? 2) ? 'text-[var(--sd-danger)]' : 'text-amber-600']">{{ s.rating }} / {{ s.max_rating }}</span><span v-else class="text-[var(--sd-faint)]">—</span></td>
              <td>{{ s.agent?.name || '—' }}</td>
              <td><SdBadge :tone="({ answered: 'green', sent: 'blue', pending: 'gray', failed: 'red', expired: 'gray' } as any)[s.status]">{{ s.status }}</SdBadge><p v-if="s.failure_reason" class="mt-0.5 max-w-[220px] truncate text-[11px] text-[var(--sd-danger)]" :title="s.failure_reason">{{ s.failure_reason }}</p></td>
              <td class="text-[12px] text-[var(--sd-muted)]">{{ timeAgo(s.answered_at || s.requested_at || s.created_at) }}</td>
              <td><SdButton size="xs" variant="ghost" :to="`/dashboard/inbox?c=${s.conversation_id}`">Open chat</SdButton></td>
            </tr>
          </tbody></table>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>

    <SdModal v-model:open="settingsOpen" title="Rating settings" description="How and when customers are asked to rate a resolved chat." size="lg">
      <form v-if="form" id="csat-form" class="space-y-4" @submit.prevent="saveSettings">
        <SdToggle v-model="form.enabled" label="Ask customers for a rating" />
        <SdToggle v-model="form.request_on_resolve" label="Send automatically when a chat is resolved" description="Off = only when an agent asks from the chat menu." />
        <SdToggle v-model="form.once_per_conversation" label="At most once per conversation" />
        <div class="grid gap-3 sm:grid-cols-2">
          <SdField label="Rating style" :error="errors.mode" class="sm:col-span-2">
            <select v-model="form.mode" class="sd-input"><option value="list5">5-star list (recommended — works without any setup)</option><option value="quick3">3 buttons: 1 · 2 · 3</option><option value="flow5">WhatsApp Flow 1–5 (needs a Flow made in Meta)</option></select>
          </SdField>
          <SdField label="Send after (minutes)" :error="errors.delay_minutes" hint="0 = right away"><input v-model.number="form.delay_minutes" type="number" min="0" max="1440" class="sd-input"></SdField>
          <SdField v-if="form.mode === 'flow5'" label="Flow ID" :error="errors.flow_id" hint="Published WhatsApp Flow with a rating question"><input v-model="form.flow_id" class="sd-input"></SdField>
          <SdField v-if="form.mode === 'flow5'" label="Template (outside 24h)" :error="errors.template_name" hint="Approved template used when the window is closed"><input v-model="form.template_name" class="sd-input"></SdField>
          <SdField v-if="form.mode === 'flow5'" label="Template language" :error="errors.template_language"><input v-model="form.template_language" class="sd-input" placeholder="en"></SdField>
          <SdField label="Low rating is" :error="errors.low_rating_threshold" hint="Ratings at or below this are flagged"><select v-model.number="form.low_rating_threshold" class="sd-input"><option v-for="n in 4" :key="n" :value="n">{{ n }} or lower</option></select></SdField>
        </div>
      </form>
      <template #footer><SdButton @click="settingsOpen = false">Cancel</SdButton><SdButton type="submit" form="csat-form" variant="primary" :loading="saving">Save</SdButton></template>
    </SdModal>
  </div></div>
</template>
<script setup lang="ts">
import { Frown, HeartHandshake, Send, Settings2, Smile, Star, TriangleAlert } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'csat.view' })
useHead({ title: 'Customer satisfaction' })
const api = useApi()
const { can } = useSession()
const days = ref(30)
const summary = ref<any>(null)
const agents = ref<any[]>([])
const settings = ref<any>(null)
const list = useList<any>('csat/surveys/', { status: '', low: '', days: 30 })
async function load() {
  list.filters.days = days.value
  const [s, a] = await Promise.allSettled([api.get('csat/surveys/summary/', { query: { days: days.value }, silent: true }), api.get('csat/surveys/agents/', { query: { days: days.value }, silent: true })])
  if (s.status === 'fulfilled') summary.value = s.value
  if (a.status === 'fulfilled') agents.value = a.value
}
watch(days, load)
onMounted(async () => { load(); try { settings.value = await api.get('csat/settings/', { silent: true }) } catch {} })
const bar = (n: number) => { const t = summary.value?.responses || 0; return t ? Math.round((summary.value.distribution?.[n] || 0) * 100 / t) : 0 }
const settingsOpen = ref(false)
const form = ref<any>(null)
const saving = ref(false)
const errors = reactive<Record<string, string>>({})
watch(settingsOpen, o => { if (o && settings.value) { form.value = { ...settings.value }; Object.keys(errors).forEach(k => delete errors[k]) } })
async function saveSettings() {
  saving.value = true
  try { settings.value = await api.patch('csat/settings/', form.value, { silent: true }); toast.success('Rating settings saved'); settingsOpen.value = false } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { saving.value = false }
}
</script>
