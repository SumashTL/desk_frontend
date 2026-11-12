<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Settings" :subtitle="canWorkspace ? 'How the inbox works for the whole team.' : 'Your personal preferences.'" />
    <SdErrorState v-if="error && !data" :message="error" @retry="load" />
    <div v-else class="grid gap-5 lg:grid-cols-[220px_1fr]">
      <nav class="flex gap-1 overflow-x-auto lg:flex-col">
        <button v-for="s in sections" :key="s.id" :class="['flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-left text-[13px] font-medium transition', tab === s.id ? 'bg-[var(--sd-primary-soft)] font-semibold text-[var(--sd-primary-ink)]' : 'text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]']" @click="tab = s.id">
          <component :is="s.icon" class="h-4 w-4" />{{ s.label }}
        </button>
      </nav>

      <div v-if="!data" class="space-y-3"><div class="sd-skeleton h-40" /><div class="sd-skeleton h-40" /></div>
      <div v-else class="min-w-0 space-y-4">
        <!-- general -->
        <section v-if="tab === 'general'" class="sd-card p-5">
          <h2 class="text-[15px] font-bold">Business</h2>
          <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Shown inside SumashDesk only. Your WhatsApp profile is managed in Meta.</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <SdField label="Business name" :error="errors.business_name"><input v-model="ws.business_name" class="sd-input"></SdField>
            <SdField label="Time zone" :error="errors.timezone" hint="Used for business hours and the away message."><select v-model="ws.timezone" class="sd-input"><option v-for="z in zones" :key="z" :value="z">{{ z }}</option></select></SdField>
          </div>
          <SaveBar :saving="saving" @save="saveWorkspace(['business_name', 'timezone'])" />
        </section>
        <section v-if="tab === 'general' && data.server" class="sd-card p-5">
          <h2 class="text-[15px] font-bold">Server check</h2>
          <p class="mb-3 mt-1 text-[12.5px] text-[var(--sd-muted)]">What the server is set up for. Change these in the backend <code>.env</code>, then restart.</p>
          <div class="grid gap-2 text-[12.5px] sm:grid-cols-2">
            <div v-for="row in serverRows" :key="row.label" class="flex items-start gap-2.5 rounded-xl bg-[var(--sd-surface-soft)] p-3">
              <component :is="row.ok ? CircleCheck : TriangleAlert" :class="['mt-0.5 h-4 w-4 shrink-0', row.ok ? 'text-[var(--sd-primary)]' : 'text-amber-600']" />
              <div><p class="font-semibold">{{ row.label }}</p><p class="text-[var(--sd-muted)]">{{ row.text }}</p></div>
            </div>
          </div>
        </section>

        <!-- inbox -->
        <section v-if="tab === 'inbox'" class="sd-card p-5">
          <h2 class="text-[15px] font-bold">Inbox & assignment</h2>
          <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Who gets new chats and what agents can see.</p>
          <SdField label="When a new customer writes">
            <div class="grid gap-2 sm:grid-cols-3">
              <label v-for="m in assignModes" :key="m.value" :class="['cursor-pointer rounded-xl border p-3 transition', ws.assign_mode === m.value ? 'border-[var(--sd-primary)] bg-[var(--sd-primary-soft)]' : 'border-[var(--sd-border)] hover:border-[var(--sd-border-strong)]']">
                <input v-model="ws.assign_mode" type="radio" :value="m.value" class="sr-only"><p class="text-[13px] font-semibold">{{ m.label }}</p><p class="mt-0.5 text-[11.5px] leading-4 text-[var(--sd-muted)]">{{ m.help }}</p>
              </label>
            </div>
          </SdField>
          <p class="sd-hint">Auto-assignment only picks agents who are online, marked Available and below their chat limit.</p>
          <div class="mt-5 space-y-4">
            <SdToggle v-model="ws.agents_see_unassigned" label="Agents see the unassigned queue" description="Agents can pick up new chats themselves. Off = agents only see chats assigned to them." />
            <SdField label="Auto-resolve quiet chats after (hours)" :error="errors.auto_close_after_hours" hint="Chats where nobody is waiting for a reply are resolved after this much silence. 0 = never.">
              <input v-model.number="ws.auto_close_after_hours" type="number" min="0" class="sd-input max-w-[200px]">
            </SdField>
          </div>
          <SaveBar :saving="saving" @save="saveWorkspace(['assign_mode', 'agents_see_unassigned', 'auto_close_after_hours'])" />
        </section>

        <!-- auto messages -->
        <section v-if="tab === 'auto'" class="space-y-4">
          <div class="sd-card p-5">
            <SdToggle v-model="ws.greeting_enabled" label="Greeting for new customers" description="Sent automatically to a customer’s very first message." />
            <textarea v-if="ws.greeting_enabled" v-model="ws.greeting_message" class="sd-input mt-3" rows="3" maxlength="1000" placeholder="Hi! Thanks for contacting Sumash Tech. An agent will reply shortly." />
            <p v-if="errors.greeting_message" class="sd-error">{{ errors.greeting_message }}</p>
          </div>
          <div class="sd-card p-5">
            <SdToggle v-model="ws.away_enabled" label="Away message outside business hours" description="Uses the hours on the Business hours tab and your time zone." />
            <template v-if="ws.away_enabled">
              <textarea v-model="ws.away_message" class="sd-input mt-3" rows="3" maxlength="1000" placeholder="We're closed right now. We'll reply from 10 AM." />
              <SdField label="Send to the same customer at most every (hours)" class="mt-3" :error="errors.away_cooldown_hours"><input v-model.number="ws.away_cooldown_hours" type="number" min="1" max="168" class="sd-input max-w-[200px]"></SdField>
            </template>
          </div>
          <div class="sd-card p-5 text-[12.5px] text-[var(--sd-muted)]">
            <p class="font-semibold text-[var(--sd-text)]">Opt-out keywords</p>
            <p class="mt-1">When a customer replies STOP, UNSUBSCRIBE or বন্ধ, they are opted out of broadcasts automatically.</p>
          </div>
          <SaveBar :saving="saving" @save="saveWorkspace(['greeting_enabled', 'greeting_message', 'away_enabled', 'away_message', 'away_cooldown_hours'])" />
        </section>

        <!-- hours -->
        <section v-if="tab === 'hours'" class="sd-card p-5">
          <h2 class="text-[15px] font-bold">Business hours</h2>
          <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Time zone: {{ ws.timezone }}. If every day is closed and nothing is set, the team is treated as always open.</p>
          <div class="divide-y divide-[var(--sd-border)] rounded-xl border border-[var(--sd-border)]">
            <div v-for="d in hours" :key="d.weekday" class="flex flex-wrap items-center gap-3 px-4 py-3">
              <span class="w-28 text-[13px] font-semibold">{{ d.weekday_label }}</span>
              <SdToggle v-model="d.is_open" />
              <span class="w-14 text-[12px] text-[var(--sd-muted)]">{{ d.is_open ? 'Open' : 'Closed' }}</span>
              <template v-if="d.is_open">
                <input v-model="d.opens_at" type="time" class="sd-input !w-[130px]"><span class="text-[var(--sd-muted)]">to</span><input v-model="d.closes_at" type="time" class="sd-input !w-[130px]">
              </template>
            </div>
          </div>
          <p v-if="hoursError" class="sd-error">{{ hoursError }}</p>
          <div class="mt-3 flex gap-2"><SdButton size="sm" @click="copyMonday">Copy the first day’s hours to all open days</SdButton></div>
          <SaveBar :saving="saving" @save="saveHours" />
        </section>

        <!-- sla -->
        <section v-if="tab === 'sla'" class="sd-card p-5">
          <h2 class="text-[15px] font-bold">Response targets (SLA)</h2>
          <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Used in Reports to show how often the team replies in time.</p>
          <SdToggle v-model="sla.enabled" label="Track response targets" />
          <div v-if="sla.enabled" class="mt-4 grid gap-4 sm:grid-cols-3">
            <SdField label="First reply within (min)" :error="slaErrors.first_response_minutes"><input v-model.number="sla.first_response_minutes" type="number" min="1" class="sd-input"></SdField>
            <SdField label="Resolve within (min)" :error="slaErrors.resolution_minutes"><input v-model.number="sla.resolution_minutes" type="number" min="1" class="sd-input"></SdField>
            <SdField label="Warn at (% of target)" :error="slaErrors.warning_percent"><input v-model.number="sla.warning_percent" type="number" min="1" max="99" class="sd-input"></SdField>
            <SdToggle v-model="sla.business_hours_only" class="sm:col-span-3" label="Only count messages during business hours" description="A customer who writes at night isn’t counted as a late reply. Uses the Business hours tab." />
          </div>
          <SaveBar :saving="saving" @save="saveSla" />
        </section>

        <!-- whatsapp -->
        <section v-if="tab === 'whatsapp'" class="space-y-4">
          <div class="sd-card p-5">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-[var(--sd-primary-soft)] text-[var(--sd-primary)]"><Smartphone class="h-5 w-5" /></span>
              <div class="flex-1"><p class="text-[15px] font-bold">{{ conn?.business_name || 'WhatsApp Business' }}</p><p class="text-[12.5px] text-[var(--sd-muted)]">{{ conn?.phone_number || 'Phone number from Meta' }}</p></div>
              <SdBadge v-if="conn" :tone="conn.configured && !conn.dry_run ? 'green' : 'amber'" dot>{{ conn.configured ? (conn.dry_run ? 'Test mode (dry run)' : 'Live') : 'Not configured' }}</SdBadge>
            </div>
            <dl v-if="conn" class="mt-4 grid gap-2 text-[12.5px] sm:grid-cols-2">
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Graph API version</dt><dd class="mt-0.5 font-semibold">{{ conn.api_version || '—' }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Webhook security</dt><dd class="mt-0.5 font-semibold">{{ conn.webhook_ready ? 'App secret + verify token set' : 'Missing app secret or verify token' }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Last event from Meta</dt><dd class="mt-0.5 font-semibold">{{ conn.last_webhook_at ? dateTime(conn.last_webhook_at) : 'None received yet' }}</dd></div>
              <div class="rounded-xl bg-[var(--sd-surface-soft)] p-3"><dt class="text-[var(--sd-muted)]">Templates</dt><dd class="mt-0.5 font-semibold">{{ conn.approved_templates }} approved of {{ conn.templates_count }}</dd></div>
            </dl>
          </div>
          <div class="sd-card p-5 text-[12.5px]">
            <p class="text-[14px] font-bold">Webhook URL for Meta</p>
            <p class="mb-2 mt-1 text-[var(--sd-muted)]">Meta App → WhatsApp → Configuration → Webhook. Subscribe to <b>messages</b>. Use the verify token from the server .env.</p>
            <div class="flex items-center gap-2"><code class="flex-1 truncate rounded-lg bg-[var(--sd-surface-soft)] px-3 py-2 font-mono text-[12px]">{{ webhookUrl }}</code><SdButton size="sm" :icon="Copy" @click="copyText(webhookUrl).then(() => toast.success('Copied'))">Copy</SdButton></div>
            <p class="mt-4 text-[var(--sd-muted)]">For security the access token, app secret and verify token are never shown or edited in the browser. Change them in the backend <code>.env</code> file and restart the server. Set <code>WA_DRY_RUN=false</code> to go live.</p>
          </div>
        </section>

        <!-- personal -->
        <section v-if="tab === 'me'" class="space-y-4">
          <div class="sd-card p-5">
            <h2 class="text-[15px] font-bold">Appearance</h2>
            <div class="mt-3 grid max-w-md grid-cols-3 gap-2">
              <button v-for="t in themes" :key="t.value" :class="['flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[12.5px] font-semibold transition', theme.mode.value === t.value ? 'border-[var(--sd-primary)] bg-[var(--sd-primary-soft)]' : 'border-[var(--sd-border)]']" @click="setTheme(t.value)">
                <component :is="t.icon" class="h-5 w-5" />{{ t.label }}
              </button>
            </div>
          </div>
          <div class="sd-card space-y-4 p-5">
            <h2 class="text-[15px] font-bold">Notifications</h2>
            <SdToggle v-model="prefs.sound" label="Sound for new customer messages" description="Plays when a message arrives in a chat you aren’t looking at." />
            <SdToggle v-model="prefs.desktop" label="Desktop notifications" :description="permission === 'denied' ? 'Blocked by your browser — allow notifications for this site in the browser settings.' : 'Shown when SumashDesk is in a background tab.'" />
            <div class="flex flex-wrap gap-2">
              <SdButton size="sm" :icon="Volume2" @click="alerts.beep()">Test sound</SdButton>
              <SdButton v-if="permission === 'default'" size="sm" :icon="BellRing" @click="askPermission">Allow desktop notifications</SdButton>
            </div>
            <SaveBar :saving="saving" @save="savePrefs" />
          </div>
        </section>

        <!-- data & storage -->
        <section v-if="tab === 'data'" class="space-y-4">
          <div class="sd-card p-5">
            <h2 class="text-[15px] font-bold">Keep history for</h2>
            <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Every night at 3 AM older chats, messages, notes and their photos / voice / video files are removed automatically. <b>Contacts are always kept.</b></p>
            <div class="grid gap-4 sm:grid-cols-3">
              <SdField label="Chat history" :error="errors.history_retention_days">
                <select v-model.number="ws.history_retention_days" class="sd-input"><option :value="365">1 year (recommended)</option><option :value="180">6 months</option><option :value="730">2 years</option><option :value="0">Keep forever</option></select>
              </SdField>
              <SdField label="Files (photos, voice, video)" :error="errors.media_retention_days" hint="Can be shorter than history to save more space.">
                <select v-model.number="ws.media_retention_days" class="sd-input"><option :value="365">1 year</option><option :value="180">6 months</option><option :value="90">3 months</option><option :value="730">2 years</option><option :value="0">Keep forever</option></select>
              </SdField>
              <SdField label="Raw webhook logs (days)" :error="errors.webhook_log_retention_days" hint="Only for troubleshooting."><input v-model.number="ws.webhook_log_retention_days" type="number" min="1" max="365" class="sd-input"></SdField>
            </div>
            <SaveBar :saving="saving" @save="saveWorkspace(['history_retention_days', 'media_retention_days', 'webhook_log_retention_days'])" />
          </div>

          <div class="sd-card p-5">
            <h2 class="text-[15px] font-bold">Clean up now</h2>
            <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Remove everything older than the period below right away — conversations, messages, notes, ratings, finished follow-ups, broadcast delivery rows and webhook logs, plus their files on disk. Contacts stay. <b>This can’t be undone.</b></p>
            <div class="flex flex-wrap items-end gap-2">
              <SdField label="Older than" class="w-56"><select v-model.number="cleanDays" class="sd-input"><option :value="365">1 year</option><option :value="180">6 months</option><option :value="90">3 months</option><option :value="730">2 years</option></select></SdField>
              <SdButton :icon="Search" :loading="checking" @click="checkCleanup">Check what would be removed</SdButton>
            </div>
            <div v-if="cleanup" class="mt-4 rounded-xl border border-[var(--sd-border)] p-4">
              <p class="text-[12.5px] text-[var(--sd-muted)]">Before {{ dateTime(cleanup.before, false) }}:</p>
              <div class="mt-2 grid grid-cols-2 gap-2 text-[12.5px] sm:grid-cols-4">
                <div v-for="row in cleanupRows" :key="row.label" class="rounded-lg bg-[var(--sd-surface-soft)] p-2.5"><p class="text-[18px] font-bold tabular-nums">{{ row.value }}</p><p class="text-[var(--sd-muted)]">{{ row.label }}</p></div>
              </div>
              <template v-if="cleanupTotal">
                <SdField class="mt-4 max-w-xs" label="Type DELETE to confirm"><input v-model="cleanConfirm" class="sd-input font-mono" placeholder="DELETE"></SdField>
                <SdButton class="mt-2" variant="danger" :icon="Trash2" :disabled="cleanConfirm !== 'DELETE'" :loading="cleaning" @click="runCleanup">Delete this data now</SdButton>
              </template>
              <p v-else class="mt-3 text-[12.5px] font-semibold text-[var(--sd-primary-ink)]">Nothing that old — the database is already tidy.</p>
            </div>
          </div>

          <div v-if="data.server" class="sd-card p-5 text-[12.5px] leading-5">
            <h2 class="text-[15px] font-bold">File compression</h2>
            <p class="mt-1 text-[var(--sd-muted)]">{{ data.server.media_compress ? `On. Photos are saved as WebP up to ${data.server.image_max_side} px, voice notes as Opus and videos at up to ${data.server.video_max_height}p — usually 70–90% smaller, still sharp on screen.` : 'Off (MEDIA_COMPRESS=false in .env).' }}</p>
            <p v-if="!data.server.ffmpeg" class="mt-2 font-semibold text-amber-700 dark:text-amber-300">ffmpeg is not installed on the server: voice notes recorded in Chrome can’t be sent and videos aren’t compressed. Install it with <code>sudo apt install ffmpeg</code>.</p>
          </div>
        </section>

        <!-- audit -->
        <section v-if="tab === 'audit'" class="sd-card overflow-hidden">
          <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
            <h2 class="mr-2 text-[14px] font-bold">Audit log</h2>
            <SdSearch v-model="audit.filters.search" placeholder="Search action or person" class="w-full sm:w-64" />
          </div>
          <SdTableSkeleton v-if="audit.loading.value && !audit.items.value.length" />
          <SdEmpty v-else-if="!audit.items.value.length" compact title="Nothing logged yet" />
          <div v-else class="overflow-x-auto">
            <table class="sd-table min-w-[640px]"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Object</th><th>IP</th></tr></thead>
              <tbody><tr v-for="a in audit.items.value" :key="a.id">
                <td class="whitespace-nowrap text-[12px] text-[var(--sd-muted)]">{{ dateTime(a.created_at) }}</td>
                <td>{{ a.actor?.name || 'System' }}</td>
                <td><code class="text-[12px]">{{ a.action }}</code></td>
                <td class="text-[12px] text-[var(--sd-muted)]">{{ a.object_type }}{{ a.object_id ? ` #${String(a.object_id).slice(0, 8)}` : '' }}</td>
                <td class="text-[12px] text-[var(--sd-muted)]">{{ a.ip_address || '—' }}</td>
              </tr></tbody></table>
          </div>
          <SdPagination v-model:page="audit.page.value" :count="audit.count.value" />
        </section>
      </div>
    </div>
  </div></div>
</template>

<script setup lang="ts">
import { BellRing, Building2, CircleCheck, Clock, Copy, Database, Gauge, History, Inbox, Monitor, Moon, Search, Smartphone, Sun, Trash2, TriangleAlert, UserRound, Volume2, Zap } from '@lucide/vue'
import { toast } from 'vue-sonner'
import SaveBar from '~/components/SaveBar.vue'
definePageMeta({ layout: 'dashboard', capability: 'settings.personal' })
useHead({ title: 'Settings' })

const api = useApi()
const route = useRoute()
const { can } = useSession()
const theme = useTheme()
const alerts = useIncomingAlerts()
const config = useRuntimeConfig()

const data = ref<any>(null)
const conn = ref<any>(null)
const error = ref<string | null>(null)
const saving = ref(false)
const errors = reactive<Record<string, string>>({})
const slaErrors = reactive<Record<string, string>>({})
const ws = reactive<any>({})
const sla = reactive<any>({})
const hours = ref<any[]>([])
const hoursError = ref('')
const prefs = reactive({ sound: true, desktop: true })
const permission = ref('default')

const canWorkspace = computed(() => !!data.value?.can_edit?.workspace)
const sections = computed(() => [
  ...(canWorkspace.value ? [
    { id: 'general', label: 'Business', icon: Building2 },
    { id: 'inbox', label: 'Inbox & assignment', icon: Inbox },
    { id: 'auto', label: 'Automatic messages', icon: Zap },
    { id: 'hours', label: 'Business hours', icon: Clock },
    { id: 'sla', label: 'Response targets', icon: Gauge },
  ] : []),
  ...(can('settings.whatsapp') ? [{ id: 'whatsapp', label: 'WhatsApp', icon: Smartphone }] : []),
  ...(can('settings.security') ? [{ id: 'data', label: 'Data & storage', icon: Database }] : []),
  { id: 'me', label: 'My preferences', icon: UserRound },
  ...(can('audit.view') ? [{ id: 'audit', label: 'Audit log', icon: History }] : []),
])
const tab = ref(String(route.query.tab || ''))
watch(sections, s => { if (!s.some(x => x.id === tab.value)) tab.value = s[0]!.id }, { immediate: true })

const assignModes = [
  { value: 'manual', label: 'Manual', help: 'Stays in the queue until someone takes it or a manager assigns it.' },
  { value: 'round_robin', label: 'Round robin', help: 'Takes turns between available agents.' },
  { value: 'least_busy', label: 'Least busy', help: 'Goes to the available agent with the fewest open chats.' },
]
const themes = [{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }] as const
let zones: string[] = ['Asia/Dhaka']
try { zones = (Intl as any).supportedValuesOf('timeZone') } catch {}
const webhookUrl = computed(() => `${new URL(String(config.public.apiBase), location.href).origin}/api/v1/whatsapp/webhook/`)
const audit = useList<any>('audit-logs/', {}, { immediate: false })
watch(tab, t => { if (t === 'audit' && !audit.loaded.value) audit.load() }, { immediate: true })

const trimTime = (t: string | null) => (t ? t.slice(0, 5) : '')
async function load() {
  error.value = null
  try {
    const d = await api.get('settings/', { silent: true })
    data.value = d
    if (!route.query.tab) { await nextTick(); tab.value = sections.value[0]!.id }
    Object.assign(ws, d.workspace)
    Object.assign(sla, d.sla)
    hours.value = d.working_hours.map((h: any) => ({ ...h, opens_at: trimTime(h.opens_at) || '10:00', closes_at: trimTime(h.closes_at) || '20:00' }))
    prefs.sound = d.preferences.notifications?.sound ?? true
    prefs.desktop = d.preferences.notifications?.desktop ?? true
    if (can('settings.whatsapp')) api.get('whatsapp/connection/', { silent: true }).then(c => conn.value = c).catch(() => {})
  } catch (e: any) { error.value = e.message }
}
onMounted(() => { load(); permission.value = 'Notification' in window ? Notification.permission : 'denied' })

async function saveWorkspace(fields: string[]) {
  Object.keys(errors).forEach(k => delete errors[k])
  saving.value = true
  try {
    const res = await api.patch('settings/workspace/', Object.fromEntries(fields.map(f => [f, ws[f]])), { silent: true })
    Object.assign(ws, res)
    toast.success('Settings saved')
  } catch (e: any) { Object.assign(errors, e.fields); toast.error(e.message) } finally { saving.value = false }
}
async function saveHours() {
  hoursError.value = ''
  saving.value = true
  try {
    const rows = hours.value.map(h => ({ weekday: h.weekday, is_open: h.is_open, opens_at: h.is_open ? h.opens_at : null, closes_at: h.is_open ? h.closes_at : null }))
    hours.value = (await api.put('settings/working-hours/', rows, { silent: true })).map((h: any) => ({ ...h, opens_at: trimTime(h.opens_at) || '10:00', closes_at: trimTime(h.closes_at) || '20:00' }))
    toast.success('Business hours saved')
  } catch (e: any) {
    const list = Array.isArray(e.data) ? e.data : []
    const bad = list.findIndex((x: any) => x && Object.keys(x).length)
    hoursError.value = bad >= 0 ? `${hours.value[bad].weekday_label}: ${errorMessage(list[bad]).message}` : e.message
  } finally { saving.value = false }
}
function copyMonday() {
  const first = hours.value[0]
  hours.value.forEach(h => { if (h.is_open) { h.opens_at = first.opens_at; h.closes_at = first.closes_at } })
}
async function saveSla() {
  Object.keys(slaErrors).forEach(k => delete slaErrors[k])
  saving.value = true
  try { Object.assign(sla, await api.patch('settings/sla/', sla, { silent: true })); toast.success('Response targets saved') } catch (e: any) { Object.assign(slaErrors, e.fields); toast.error(e.message) } finally { saving.value = false }
}
async function savePrefs() {
  saving.value = true
  try {
    await api.patch('me/preferences/', { notifications: { ...prefs } })
    alerts.prefs.value = { ...prefs }
    if (prefs.desktop && permission.value === 'default') askPermission()
    toast.success('Preferences saved')
  } catch {} finally { saving.value = false }
}
async function setTheme(value: 'light' | 'dark' | 'system') {
  theme.set(value)
  try { await api.patch('me/preferences/', { theme: value }, { silent: true }) } catch {}
}
// server check
const serverRows = computed(() => {
  const s = data.value?.server
  if (!s) return []
  return [
    { label: 'Database', ok: s.database === 'postgresql', text: s.database === 'postgresql' ? 'PostgreSQL — ready for production.' : 'SQLite — fine for testing; use PostgreSQL in production (DB_ENGINE=postgres).' },
    { label: 'WhatsApp sending', ok: !s.dry_run, text: s.dry_run ? 'Test mode (WA_DRY_RUN=true): replies are saved but not delivered.' : 'Live — replies go to customers.' },
    { label: 'Email', ok: s.email, text: s.email ? 'Invitations and password resets are emailed.' : 'Not set up — invitations give you a link to share instead (EMAIL_HOST…).' },
    { label: 'Voice notes & video', ok: s.ffmpeg, text: s.ffmpeg ? 'ffmpeg installed — voice notes convert and videos are compressed.' : 'ffmpeg missing — install with: sudo apt install ffmpeg' },
  ]
})

// data clean-up
const cleanDays = ref(365)
const cleanup = ref<any>(null)
const checking = ref(false)
const cleaning = ref(false)
const cleanConfirm = ref('')
const cleanupRows = computed(() => {
  const c = cleanup.value?.counts || {}
  return [
    { label: 'conversations', value: num(c.conversations) }, { label: 'messages', value: num(c.messages) },
    { label: `files (${fileSize(c.file_bytes)})`, value: num(c.attachments) }, { label: 'notes', value: num(c.notes) },
    { label: 'ratings', value: num(c.csat_surveys) }, { label: 'follow-ups done', value: num(c.followups) },
    { label: 'broadcast rows', value: num(c.broadcast_recipients) }, { label: 'webhook logs', value: num(c.webhook_events) },
  ]
})
const cleanupTotal = computed(() => {
  const c = cleanup.value?.counts || {}
  return ['conversations', 'messages', 'attachments', 'notes', 'csat_surveys', 'followups', 'broadcast_recipients', 'webhook_events', 'assignment_logs'].reduce((n, k) => n + (c[k] || 0), 0)
})
watch(cleanDays, () => { cleanup.value = null; cleanConfirm.value = '' })
async function checkCleanup() {
  checking.value = true
  try { cleanup.value = await api.get('settings/data-cleanup/', { query: { days: cleanDays.value } }) } catch {} finally { checking.value = false }
}
async function runCleanup() {
  cleaning.value = true
  try {
    const res = await api.post('settings/data-cleanup/', { days: cleanDays.value, confirm: 'DELETE' })
    toast.success(res.detail)
    cleanConfirm.value = ''
    setTimeout(checkCleanup, 4000)
  } catch {} finally { cleaning.value = false }
}
async function askPermission() { try { permission.value = await Notification.requestPermission() } catch {} }
</script>
