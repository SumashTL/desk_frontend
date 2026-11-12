<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Broadcasts" subtitle="Send an approved template to many opted-in customers at once — now or at a scheduled time.">
      <SdButton variant="primary" :icon="Megaphone" @click="openForm()">New broadcast</SdButton>
    </SdPageHeader>

    <details class="sd-card mb-4 p-4 text-[13px] leading-6" :open="!list.count.value">
      <summary class="cursor-pointer font-semibold">How broadcasts work</summary>
      <ol class="mt-2 list-decimal space-y-1 pl-5 text-[var(--sd-muted)]">
        <li><b>Message</b> — a broadcast always uses an <b>approved template</b> (make one on the Templates page). Values like <code>{name}</code> are filled in for each customer.</li>
        <li><b>Who gets it</b> — customers come from your <b>Contacts</b>: everyone who messaged your WhatsApp is saved there automatically. Narrow it by recent chats, tags, segment, country or VIP — or paste a list of numbers.</li>
        <li><b>Permission</b> — WhatsApp only allows promotions to people who agreed to receive them. Customers marked <b>Opted in</b> (Contacts page) are included; anyone who replied STOP or is blocked is always skipped.</li>
        <li><b>Send</b> — now or at a set time. Delivered / read / failed counts update live; failed messages can be retried. Customer replies arrive in the Inbox like any chat.</li>
      </ol>
    </details>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SdStat label="Campaigns" :value="num(stats?.total)" :icon="Megaphone" :loading="!stats" />
      <SdStat label="Scheduled" :value="num(stats?.scheduled)" :icon="CalendarClock" tone="blue" :loading="!stats" />
      <SdStat label="Delivered" :value="num(stats?.delivered)" :hint="stats?.failed ? `${num(stats.failed)} failed` : ''" :icon="CheckCheck" :loading="!stats" />
      <SdStat label="Read rate" :value="pct(stats?.read_rate)" :icon="Eye" tone="violet" :loading="!stats" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdSearch v-model="list.filters.search" placeholder="Search campaigns" class="w-full sm:w-72" />
        <select v-model="list.filters.status" class="sd-input !w-auto"><option value="">Any status</option><option v-for="s in Object.keys(STATUS)" :key="s" :value="s">{{ STATUS[s].label }}</option></select>
      </div>
      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdErrorState v-else-if="list.error.value" :message="list.error.value" @retry="list.load" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="Megaphone" title="No broadcasts yet" text="Pick an approved template, choose who receives it, and send or schedule it.">
        <SdButton size="sm" variant="primary" @click="openForm()">New broadcast</SdButton>
      </SdEmpty>
      <div v-else class="overflow-x-auto">
        <table class="sd-table min-w-[980px]">
          <thead><tr><th>Campaign</th><th>Status</th><th>Progress</th><th class="text-right">Delivered</th><th class="text-right">Read</th><th class="text-right">Failed</th><th>When</th><th class="w-10" /></tr></thead>
          <tbody>
            <tr v-for="b in list.items.value" :key="b.id">
              <td><p class="font-semibold">{{ b.name }}</p><p class="font-mono text-[11.5px] text-[var(--sd-muted)]">{{ b.template_detail?.name || 'No template' }}</p></td>
              <td><SdBadge :tone="STATUS[b.status]?.tone" dot>{{ STATUS[b.status]?.label || b.status }}</SdBadge></td>
              <td class="w-48">
                <div class="h-1.5 overflow-hidden rounded-full bg-[var(--sd-surface-strong)]"><div class="h-full rounded-full bg-[var(--sd-primary)] transition-all" :style="{ width: `${progress(b)}%` }" /></div>
                <p class="mt-1 text-[11.5px] text-[var(--sd-muted)]">{{ num(b.sent_count + b.failed_count) }} / {{ num(b.total_recipients) }} processed</p>
              </td>
              <td class="text-right">{{ num(b.delivered_count) }}</td>
              <td class="text-right">{{ num(b.read_count) }}<p class="text-[11px] text-[var(--sd-muted)]">{{ pct(b.read_rate) }}</p></td>
              <td class="text-right" :class="b.failed_count ? 'font-semibold text-[var(--sd-danger)]' : ''">{{ num(b.failed_count) }}</td>
              <td class="text-[12px] text-[var(--sd-muted)]">{{ b.completed_at ? `Finished ${timeAgo(b.completed_at)}` : b.started_at ? `Started ${timeAgo(b.started_at)}` : b.scheduled_at ? dateTime(b.scheduled_at) : `Created ${timeAgo(b.created_at)}` }}</td>
              <td><SdMenu :items="menu(b)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>

    <!-- create / edit -->
    <SdModal v-model:open="formOpen" :title="editing ? `Edit “${editing.name}”` : 'New broadcast'" description="Only contacts who opted in to marketing and are not blocked receive it." size="xl" persistent>
      <form id="bc-form" class="grid gap-5 lg:grid-cols-[1fr_320px]" @submit.prevent="save(false)">
        <div class="space-y-4">
          <SdField label="Campaign name" :error="errors.name" required><input v-model="form.name" class="sd-input" placeholder="Eid offer · VIP customers" maxlength="160"></SdField>
          <SdField label="Template" :error="errors.template" required>
            <select v-model="form.template" class="sd-input"><option :value="null" disabled>Choose an approved template</option><option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }} · {{ t.language }} · {{ t.category }}</option></select>
            <p v-if="!templates.length" class="sd-hint">No approved templates. Sync them on the Templates page first.</p>
          </SdField>
          <p v-if="errors.template_parameters || errors.header_media || errors.button_params || errors.header_params" class="sd-error">{{ errors.template_parameters || errors.header_media || errors.button_params || errors.header_params }}</p>
          <fieldset class="rounded-xl border border-[var(--sd-border)] p-4">
            <legend class="px-1 text-[12px] font-semibold">Who gets it</legend>
            <div class="mb-3 grid grid-cols-2 gap-1.5">
              <button type="button" :class="['sd-chip !h-9 justify-center', audienceMode === 'filters' && 'is-active']" @click="audienceMode = 'filters'"><Users class="h-3.5 w-3.5" />From my contacts</button>
              <button type="button" :class="['sd-chip !h-9 justify-center', audienceMode === 'numbers' && 'is-active']" @click="audienceMode = 'numbers'"><ListPlus class="h-3.5 w-3.5" />Paste numbers</button>
            </div>
            <template v-if="audienceMode === 'numbers'">
              <SdField label="Phone numbers" hint="One per line or separated by commas. 01712345678 and +8801712345678 both work.">
                <textarea v-model="numbersText" rows="5" class="sd-input font-mono text-[12.5px]" placeholder="01712345678&#10;01812345678" />
              </SdField>
              <label class="mt-2 flex items-start gap-2 text-[12.5px]"><input v-model="numbersConsent" type="checkbox" class="mt-0.5 accent-[var(--sd-primary)]"><span>These customers agreed to receive WhatsApp messages from us (marks them “Opted in”).</span></label>
              <div class="mt-2 flex items-center gap-2">
                <SdButton size="sm" :icon="ListPlus" :loading="importing" :disabled="!numbersText.trim()" @click="importNumbers">Use these numbers</SdButton>
                <span v-if="form.audience.contact_ids?.length" class="text-[12px] text-[var(--sd-muted)]">{{ form.audience.contact_ids.length }} customers selected <button type="button" class="sd-link ml-1" @click="form.audience.contact_ids = []">clear</button></span>
              </div>
              <p v-if="invalidNumbers.length" class="mt-1 text-[12px] text-[var(--sd-danger)]">Skipped (not a valid number): {{ invalidNumbers.join(', ') }}</p>
            </template>
            <div v-else class="grid gap-3 sm:grid-cols-2">
              <SdField label="Chatted with us" class="sm:col-span-2"><select v-model="form.audience.active_days" class="sd-input"><option :value="null">Any time</option><option :value="7">In the last 7 days</option><option :value="30">In the last 30 days</option><option :value="90">In the last 3 months</option><option :value="365">In the last year</option></select></SdField>
            </div>
            <div v-if="audienceMode === 'filters'" class="mt-3 grid gap-3 sm:grid-cols-3">
              <SdField label="Segment"><select v-model="form.audience.segment" class="sd-input"><option value="">Any</option><option v-for="s in segments" :key="s.segment" :value="s.segment">{{ s.segment }}</option></select></SdField>
              <SdField label="Country"><input v-model="form.audience.country" class="sd-input uppercase" maxlength="2" placeholder="BD"></SdField>
              <SdField label="VIP"><select v-model="form.audience.vip" class="sd-input"><option :value="null">Everyone</option><option :value="true">VIP only</option><option :value="false">Non-VIP</option></select></SdField>
            </div>
            <div v-if="tags.length" class="mt-3">
              <p class="sd-label">Has any of these tags</p>
              <div class="flex flex-wrap gap-1.5">
                <button v-for="t in tags" :key="t.id" type="button" :class="['rounded-full border px-2.5 py-1 text-[12px] font-semibold', form.audience.tag_ids.includes(t.id) ? 'border-transparent' : 'border-[var(--sd-border)] text-[var(--sd-muted)]']"
                  :style="form.audience.tag_ids.includes(t.id) ? { background: `${t.color}22`, color: t.color } : {}" @click="toggleTag(t.id)">{{ t.name }}</button>
              </div>
            </div>
            <label class="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/8 p-2.5 text-[12px] leading-5"><input v-model="form.audience.include_unknown" type="checkbox" class="mt-1 accent-[var(--sd-primary)]"><span><b>Also include customers whose permission isn’t recorded</b><br><span class="text-[var(--sd-muted)]">Only if you’re sure they want to hear from you — too many “block/report” from customers can get the WhatsApp number limited.</span></span></label>
            <p v-if="errors.audience" class="sd-error">{{ errors.audience }}</p>
          </fieldset>
          <div class="rounded-xl border border-[var(--sd-border)] p-4">
            <SdToggle v-model="scheduleOn" label="Schedule for later" description="Otherwise it starts as soon as you press Send." />
            <input v-if="scheduleOn" v-model="form.scheduled_at" type="datetime-local" class="sd-input mt-3" :min="toLocalInput(new Date())">
            <p v-if="errors.scheduled_at" class="sd-error">{{ errors.scheduled_at }}</p>
          </div>
        </div>
        <aside class="space-y-3">
          <div class="rounded-xl bg-[var(--sd-primary-soft)] p-4">
            <p class="text-[12px] font-semibold text-[var(--sd-primary-ink)]">Will receive it</p>
            <p class="mt-1 text-[30px] font-bold leading-none tracking-tight">{{ preview ? num(preview.eligible) : '…' }}</p>
            <p v-if="preview" class="mt-2 text-[11.5px] leading-4 text-[var(--sd-muted)]">of {{ num(preview.total_contacts) }} contacts<template v-if="!form.audience.include_unknown"> · {{ num(preview.excluded_without_opt_in) }} without “Opted in” are skipped</template> · {{ num(preview.excluded_blocked) }} blocked skipped</p>
            <p v-if="preview && !preview.eligible && !form.audience.include_unknown" class="mt-2 text-[11.5px] leading-4 text-[var(--sd-primary-ink)]">Nobody is marked “Opted in” yet. Mark customers on the Contacts page, paste numbers with permission, or tick “Also include…”.</p>
            <div v-if="preview?.sample?.length" class="mt-3 space-y-1 text-[12px]"><p v-for="s in preview.sample" :key="s.id" class="truncate">{{ s.name || 'Customer' }} <span class="text-[var(--sd-muted)]">{{ s.phone }}</span></p></div>
          </div>
          <TemplateFields v-if="tpl" ref="fields" v-model="values" :template="tpl" personalise :initial="initialValues" :show-errors="showTplErrors" />
          <p v-else class="rounded-xl bg-[var(--sd-surface-soft)] p-4 text-[12.5px] text-[var(--sd-muted)]">Choose a template to see the message and fill in its values.</p>
        </aside>
      </form>
      <template #footer>
        <SdButton @click="formOpen = false">Cancel</SdButton>
        <SdButton type="submit" form="bc-form" :loading="saving === 'draft'">Save draft</SdButton>
        <SdButton v-if="!armed" variant="primary" :icon="Send" @click="arm">{{ scheduleOn ? 'Schedule' : 'Send now' }}</SdButton>
        <SdButton v-else variant="primary" :icon="Send" :loading="saving === 'send'" @click="save(true)">{{ scheduleOn ? `Confirm: start ${form.scheduled_at ? dateTime(fromLocalInput(form.scheduled_at)) : ''}` : `Confirm: send to ${num(preview?.eligible)} now` }}</SdButton>
      </template>
    </SdModal>

    <SdDrawer v-model:open="recipientsOpen" :title="`Recipients · ${current?.name || ''}`" width="max-w-[560px]">
      <div class="flex gap-2 border-b border-[var(--sd-border)] p-3">
        <select v-model="recipients.filters.status" class="sd-input !w-auto"><option value="">All</option><option value="sent">Sent</option><option value="delivered">Delivered</option><option value="read">Read</option><option value="failed">Failed</option><option value="pending">Pending</option></select>
      </div>
      <SdTableSkeleton v-if="recipients.loading.value && !recipients.items.value.length" />
      <SdEmpty v-else-if="!recipients.items.value.length" compact title="No recipients yet" text="They are created when the broadcast starts." />
      <div v-else class="divide-y divide-[var(--sd-border)]">
        <div v-for="r in recipients.items.value" :key="r.id" class="flex items-center gap-3 px-4 py-2.5">
          <SdAvatar :name="r.contact.name" :seed="r.contact.id" size="sm" />
          <div class="min-w-0 flex-1"><p class="truncate text-[13px] font-semibold">{{ r.contact.name }}</p><p class="truncate text-[11.5px] text-[var(--sd-muted)]">{{ r.contact.phone }}<template v-if="r.error"> · <span class="text-[var(--sd-danger)]">{{ r.error }}</span></template></p></div>
          <SdBadge :tone="({ read: 'violet', delivered: 'green', sent: 'blue', failed: 'red', pending: 'gray', skipped: 'gray' } as any)[r.status]">{{ r.status }}</SdBadge>
        </div>
      </div>
      <SdPagination v-model:page="recipients.page.value" :count="recipients.count.value" />
    </SdDrawer>
  </div></div>
</template>

<script setup lang="ts">
import { Ban, CalendarClock, CheckCheck, Eye, ListPlus, Megaphone, Pause, Pencil, Play, RotateCcw, Send, Trash2, Users } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'broadcasts.manage' })
useHead({ title: 'Broadcasts' })

const api = useApi()
const { confirm } = useConfirm()
const STATUS: Record<string, { label: string, tone: any }> = {
  draft: { label: 'Draft', tone: 'gray' }, scheduled: { label: 'Scheduled', tone: 'blue' }, queued: { label: 'Queued', tone: 'blue' },
  sending: { label: 'Sending', tone: 'amber' }, paused: { label: 'Paused', tone: 'amber' }, completed: { label: 'Completed', tone: 'green' },
  failed: { label: 'Failed', tone: 'red' }, cancelled: { label: 'Cancelled', tone: 'gray' },
}
const list = useList<any>('broadcasts/', { status: '' })
const stats = ref<any>(null)
const loadStats = async () => { try { stats.value = await api.get('broadcasts/stats/', { silent: true }) } catch {} }
const progress = (b: any) => b.total_recipients ? Math.min(100, Math.round((b.sent_count + b.failed_count) * 100 / b.total_recipients)) : 0

// live progress while something is sending
let poll: any
watch(() => list.items.value.some(b => ['queued', 'sending'].includes(b.status)), (running) => {
  clearInterval(poll)
  if (running) poll = setInterval(() => { list.load(); loadStats() }, 3000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(poll))

const templates = ref<any[]>([])
const tags = ref<any[]>([])
const segments = ref<any[]>([])
onMounted(async () => {
  loadStats()
  const [t, g, s] = await Promise.allSettled([api.get('templates/', { query: { status: 'APPROVED' }, silent: true }), api.get('tags/', { silent: true }), api.get('contacts/stats/', { silent: true })])
  if (t.status === 'fulfilled') templates.value = t.value.results
  if (g.status === 'fulfilled') tags.value = g.value
  if (s.status === 'fulfilled') segments.value = s.value.segments
})

// form
const formOpen = ref(false)
const editing = ref<any>(null)
const saving = ref<string | null>(null)
const scheduleOn = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive<any>({ audience: { tag_ids: [] }, parameters: [] })
const tpl = computed(() => templates.value.find(t => t.id === form.template))
const fields = ref<any>()
const values = ref<any>({ params: [], header_params: [], button_params: {} })
const initialValues = ref<any>({})
const showTplErrors = ref(false)
// audience: from contacts (filters) or a pasted list of numbers
const audienceMode = ref<'filters' | 'numbers'>('filters')
const numbersText = ref('')
const numbersConsent = ref(true)
const importing = ref(false)
const invalidNumbers = ref<string[]>([])
async function importNumbers() {
  importing.value = true
  try {
    const res = await api.post('broadcasts/import-numbers/', { numbers: numbersText.value, consent: numbersConsent.value })
    form.audience.contact_ids = res.contact_ids
    invalidNumbers.value = res.invalid
    toast.success(`${res.count} customers selected`)
  } catch {} finally { importing.value = false }
}

function openForm(b?: any) {
  Object.keys(errors).forEach(k => delete errors[k])
  editing.value = b || null
  Object.assign(form, {
    name: b?.name || '', template: b?.template ?? null,
    audience: { tag_ids: [], segment: '', country: '', vip: null, active_days: null, contact_ids: [], include_unknown: false, ...(b?.audience || {}) },
    scheduled_at: b?.scheduled_at ? toLocalInput(b.scheduled_at) : '',
  })
  initialValues.value = { params: b?.template_parameters?.default || [], ...(b?.template_parameters?.extras || {}) }
  audienceMode.value = b?.audience?.contact_ids?.length ? 'numbers' : 'filters'
  numbersText.value = ''
  invalidNumbers.value = []
  showTplErrors.value = false
  scheduleOn.value = !!b?.scheduled_at
  formOpen.value = true
}
// two-step send button instead of a second dialog on top of this one
const armed = ref(false)
let disarm: any
function arm() {
  armed.value = true
  clearTimeout(disarm)
  disarm = setTimeout(() => { armed.value = false }, 6000)
}
watch(formOpen, () => { armed.value = false })
watch(() => JSON.stringify([form.audience, form.template, form.scheduled_at, scheduleOn.value]), () => { armed.value = false })
function toggleTag(id: number) { const a = form.audience; a.tag_ids = a.tag_ids.includes(id) ? a.tag_ids.filter((x: number) => x !== id) : [...a.tag_ids, id] }

const preview = ref<any>(null)
let previewTimer: any
watch(() => JSON.stringify([form.audience, audienceMode.value]), () => {
  if (!formOpen.value) return
  clearTimeout(previewTimer)
  previewTimer = setTimeout(async () => {
    if (audienceMode.value === 'numbers' && !form.audience.contact_ids?.length) { preview.value = { eligible: 0, total_contacts: preview.value?.total_contacts || 0, excluded_without_opt_in: 0, excluded_blocked: 0, sample: [] }; return }
    try { preview.value = await api.post('broadcasts/preview-audience/', { audience: cleanAudience() }, { silent: true }) } catch { preview.value = null }
  }, 300)
})
watch(formOpen, o => { if (o) { preview.value = null; form.audience = { ...form.audience } } })
function cleanAudience() {
  const a = form.audience
  const base = { ...(a.include_unknown ? { include_unknown: true } : {}) }
  if (audienceMode.value === 'numbers') return { ...base, contact_ids: a.contact_ids || [] }
  return { ...base, ...(a.tag_ids.length ? { tag_ids: a.tag_ids } : {}), ...(a.segment ? { segment: a.segment } : {}), ...(a.country ? { country: a.country.toUpperCase() } : {}), ...(a.vip !== null && a.vip !== '' ? { vip: a.vip } : {}), ...(a.active_days ? { active_days: a.active_days } : {}) }
}


async function save(send: boolean) {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Name the campaign.'
  if (send && !form.template) errors.template = 'Choose a template.'
  if (send && scheduleOn.value && !form.scheduled_at) errors.scheduled_at = 'Pick a date and time.'
  if (audienceMode.value === 'numbers' && !form.audience.contact_ids?.length) errors.audience = 'Paste the numbers and press “Use these numbers”.'
  if (send && fields.value && !fields.value.valid()) { showTplErrors.value = true; errors.template_parameters = 'Fill in the template values.' }
  if (Object.keys(errors).length) return
  const body = { name: form.name.trim(), template: form.template, audience: cleanAudience(), parameters: values.value.params || [], extras: fields.value?.extras() || {}, scheduled_at: scheduleOn.value ? fromLocalInput(form.scheduled_at) : null }
  saving.value = send ? 'send' : 'draft'
  try {
    let campaign = editing.value ? await api.patch(`broadcasts/${editing.value.id}/`, body, { silent: true }) : await api.post('broadcasts/', body, { silent: true })
    editing.value = campaign
    if (send) {
      campaign = await api.post(`broadcasts/${campaign.id}/start/`, {}, { silent: true })
      toast.success(campaign.status === 'scheduled' ? 'Broadcast scheduled' : 'Broadcast started')
    } else toast.success('Draft saved')
    formOpen.value = false
    list.load(); loadStats()
  } catch (e: any) {
    Object.assign(errors, e.fields)
    if (!Object.keys(e.fields || {}).length || e.fields.status || e.fields.detail) toast.error(e.message)
  } finally { saving.value = null; armed.value = false }
}

async function run(b: any, action: string, msg: string, ask?: { title: string, message?: string, danger?: boolean, confirmText?: string }) {
  if (ask && !(await confirm(ask))) return
  try { await api.post(`broadcasts/${b.id}/${action}/`); toast.success(msg); list.load(); loadStats() } catch {}
}
async function remove(b: any) {
  if (!(await confirm({ title: `Delete “${b.name}”?`, confirmText: 'Delete', danger: true }))) return
  try { await api.del(`broadcasts/${b.id}/`); toast.success('Draft deleted'); list.load(); loadStats() } catch {}
}

const recipientsOpen = ref(false)
const current = ref<any>(null)
const recipientsPath = computed(() => current.value ? `broadcasts/${current.value.id}/recipients/` : '')
const recipients = useList<any>(recipientsPath, { status: '' }, { immediate: false })
function showRecipients(b: any) { current.value = b; recipientsOpen.value = true; nextTick(recipients.load) }

const menu = (b: any) => [
  { label: 'Edit', icon: Pencil, hidden: !['draft', 'scheduled', 'paused'].includes(b.status), onSelect: () => openForm(b) },
  { label: b.scheduled_at && new Date(b.scheduled_at) > new Date() ? 'Schedule' : 'Send now', icon: Play, hidden: !['draft', 'failed'].includes(b.status), onSelect: () => run(b, 'start', 'Broadcast started', { title: `Start “${b.name}”?`, confirmText: 'Start' }) },
  { label: 'Pause', icon: Pause, hidden: !['scheduled', 'queued', 'sending'].includes(b.status), onSelect: () => run(b, 'pause', 'Paused') },
  { label: 'Resume', icon: Play, hidden: b.status !== 'paused', onSelect: () => run(b, 'resume', 'Resumed') },
  { label: 'Retry failed', icon: RotateCcw, hidden: !b.failed_count || !['completed', 'paused', 'failed'].includes(b.status), onSelect: () => run(b, 'retry-failed', 'Retrying failed messages') },
  { label: 'Recipients', icon: Users, hidden: !b.total_recipients, onSelect: () => showRecipients(b) },
  { separator: true },
  { label: 'Cancel', icon: Ban, danger: true, hidden: ['completed', 'cancelled', 'draft'].includes(b.status), onSelect: () => run(b, 'cancel', 'Cancelled', { title: `Cancel “${b.name}”?`, message: 'Messages not yet sent will not go out.', confirmText: 'Cancel broadcast', danger: true }) },
  { label: 'Delete draft', icon: Trash2, danger: true, hidden: b.status !== 'draft', onSelect: () => remove(b) },
]
</script>
