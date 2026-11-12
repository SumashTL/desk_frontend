<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Contacts" subtitle="Everyone who has talked to your WhatsApp number, plus customers you add yourself.">
      <SdButton v-if="can('tags.manage')" :icon="Tags" @click="tagsOpen = true">Tags</SdButton>
      <SdButton v-if="can('contacts.import')" :icon="Upload" @click="openImport">Import</SdButton>
      <SdButton v-if="can('contacts.export')" :icon="Download" :loading="exporting" @click="exportCsv">Export</SdButton>
      <SdButton v-if="can('contacts.edit')" variant="primary" :icon="UserPlus" @click="openForm()">Add contact</SdButton>
    </SdPageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SdStat label="All contacts" :value="num(stats?.total)" :icon="Users" :loading="!stats" />
      <SdStat label="New this month" :value="num(stats?.new_this_month)" :icon="UserPlus" tone="blue" :loading="!stats" />
      <SdStat label="Marketing opt-in" :value="num(stats?.opted_in)" :icon="BadgeCheck" :loading="!stats" />
      <SdStat label="VIP" :value="num(stats?.vip)" :icon="Crown" tone="amber" :loading="!stats" />
      <SdStat label="Blocked" :value="num(stats?.blocked)" :icon="Ban" tone="red" :loading="!stats" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdSearch v-model="list.filters.search" placeholder="Name, number or email" class="w-full sm:w-72" />
        <select v-model="list.filters.tag" class="sd-input !w-auto"><option value="">All tags</option><option v-for="t in tags" :key="t.id" :value="String(t.id)">{{ t.name }} ({{ t.contacts_count }})</option></select>
        <select v-model="list.filters.segment" class="sd-input !w-auto"><option value="">All segments</option><option v-for="s in stats?.segments || []" :key="s.segment" :value="s.segment">{{ s.segment }} ({{ s.count }})</option></select>
        <select v-model="list.filters.consent" class="sd-input !w-auto"><option value="">Any consent</option><option value="opted_in">Opted in</option><option value="opted_out">Opted out</option><option value="unknown">Unknown</option></select>
        <select v-model="list.filters.blocked" class="sd-input !w-auto"><option value="">Blocked + active</option><option value="false">Active only</option><option value="true">Blocked only</option></select>
        <button :class="['sd-chip', list.filters.vip === 'true' && 'is-active']" @click="list.filters.vip = list.filters.vip === 'true' ? '' : 'true'"><Crown class="h-3.5 w-3.5" />VIP</button>
        <div class="flex-1" />
        <select v-model="list.filters.ordering" class="sd-input !w-auto"><option value="-created_at">Newest first</option><option value="-last_interaction_at">Recent activity</option><option value="custom_name">Name A–Z</option><option value="-conversation_count">Most chats</option></select>
      </div>

      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdErrorState v-else-if="list.error.value" :message="list.error.value" @retry="list.load" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="Users" :title="hasFilters ? 'No contacts match' : 'No contacts yet'" :text="hasFilters ? 'Change the search or filters.' : 'Contacts are created automatically when a customer messages you. You can also add or import them.'">
        <SdButton v-if="!hasFilters && can('contacts.edit')" size="sm" variant="primary" @click="openForm()">Add contact</SdButton>
      </SdEmpty>
      <div v-else class="overflow-x-auto">
        <table class="sd-table min-w-[900px]">
          <thead><tr><th>Contact</th><th>Tags</th><th>Segment</th><th>Consent</th><th class="text-right">Chats</th><th>Last activity</th><th class="w-10" /></tr></thead>
          <tbody>
            <tr v-for="c in list.items.value" :key="c.id" class="cursor-pointer" @click="navigateTo(`/dashboard/customer-360?id=${c.id}`)">
              <td>
                <div class="flex items-center gap-3">
                  <SdAvatar :name="c.name" :seed="c.id" size="sm" />
                  <div class="min-w-0">
                    <p class="flex items-center gap-1.5 truncate font-semibold">{{ c.name }}<Crown v-if="c.is_vip" class="h-3.5 w-3.5 text-amber-500" /><SdBadge v-if="c.is_blocked" tone="red">Blocked</SdBadge></p>
                    <p class="truncate text-[12px] text-[var(--sd-muted)]">{{ flag(c.country) }} {{ c.phone }}<template v-if="c.email"> · {{ c.email }}</template></p>
                  </div>
                </div>
              </td>
              <td><div class="flex max-w-[220px] flex-wrap gap-1"><span v-for="t in c.tags" :key="t.id" class="rounded-full px-2 py-px text-[11px] font-semibold" :style="{ background: `${t.color}22`, color: t.color }">{{ t.name }}</span><span v-if="!c.tags.length" class="text-[var(--sd-faint)]">—</span></div></td>
              <td class="capitalize">{{ c.segment || '—' }}</td>
              <td><SdBadge :tone="c.consent === 'opted_in' ? 'green' : c.consent === 'opted_out' ? 'red' : 'gray'">{{ CONSENT[c.consent] || 'Unknown' }}</SdBadge></td>
              <td class="text-right font-semibold">{{ c.conversation_count }}</td>
              <td class="text-[12px] text-[var(--sd-muted)]">{{ c.last_interaction_at ? timeAgo(c.last_interaction_at) : 'Never' }}</td>
              <td @click.stop><SdMenu :items="rowMenu(c)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>

    <!-- add / edit -->
    <SdModal v-model:open="formOpen" :title="editing ? `Edit ${editing.name}` : 'Add a contact'" :description="editing ? '' : 'Use the full WhatsApp number with country code.'" size="lg">
      <form id="contact-form" class="grid gap-3 sm:grid-cols-2" @submit.prevent="save">
        <SdField label="WhatsApp number" :error="errors.wa_id" :required="!editing" :hint="numberLocked ? 'The number can’t be changed.' : editing ? 'The customer hides their number. Add it if you know it.' : 'e.g. 8801712345678'">
          <input v-model="form.wa_id" class="sd-input" :disabled="numberLocked" inputmode="tel" placeholder="8801712345678">
        </SdField>
        <SdField label="Name" :error="errors.custom_name"><input v-model="form.custom_name" class="sd-input" :placeholder="editing?.profile_name || 'Customer name'"></SdField>
        <SdField label="Email" :error="errors.email" optional><input v-model="form.email" type="email" class="sd-input"></SdField>
        <SdField label="Segment" :error="errors.segment"><input v-model="form.segment" class="sd-input" list="segments" placeholder="regular"><datalist id="segments"><option v-for="s in stats?.segments || []" :key="s.segment" :value="s.segment" /></datalist></SdField>
        <SdField label="Address" optional class="sm:col-span-2"><input v-model="form.address" class="sd-input"></SdField>
        <SdField label="Marketing consent" :error="errors.consent" hint="Only opted-in contacts receive broadcasts.">
          <select v-model="form.consent" class="sd-input"><option value="unknown">Unknown</option><option value="opted_in">Opted in</option><option value="opted_out">Opted out</option></select>
        </SdField>
        <SdField label="Language"><select v-model="form.language" class="sd-input"><option value="bn">Bangla</option><option value="en">English</option><option value="hi">Hindi</option><option value="ar">Arabic</option></select></SdField>
        <SdField v-if="tags.length" label="Tags" class="sm:col-span-2">
          <div class="flex flex-wrap gap-1.5">
            <button v-for="t in tags" :key="t.id" type="button" :class="['rounded-full border px-2.5 py-1 text-[12px] font-semibold transition', form.tag_ids.includes(t.id) ? 'border-transparent' : 'border-[var(--sd-border)] text-[var(--sd-muted)]']"
              :style="form.tag_ids.includes(t.id) ? { background: `${t.color}22`, color: t.color } : {}" @click="toggleTag(t.id)">{{ t.name }}</button>
          </div>
        </SdField>
        <SdToggle v-model="form.is_vip" class="sm:col-span-2" label="VIP customer" description="Highlighted everywhere and available as a broadcast filter." />
      </form>
      <template #footer><SdButton @click="formOpen = false">Cancel</SdButton><SdButton type="submit" form="contact-form" variant="primary" :loading="saving">{{ editing ? 'Save' : 'Add contact' }}</SdButton></template>
    </SdModal>

    <!-- import -->
    <SdModal v-model:open="importOpen" title="Import contacts" description="Upload a CSV with a phone column. Optional columns: name, email, segment, consent (yes/no), tags (comma separated)." size="lg">
      <div v-if="importResult" class="space-y-2 text-[13px]">
        <p class="font-semibold">{{ importResult.created }} contacts added</p>
        <p class="text-[var(--sd-muted)]">{{ importResult.skipped_existing }} already existed · {{ importResult.invalid }} rows were invalid</p>
        <div v-if="importResult.errors?.length" class="max-h-40 overflow-auto rounded-lg bg-[var(--sd-surface-soft)] p-2 text-[12px]"><p v-for="e in importResult.errors" :key="e.row">Row {{ e.row }}: {{ e.error }}</p></div>
      </div>
      <template v-else>
        <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--sd-border-strong)] p-8 text-center hover:bg-[var(--sd-surface-soft)]">
          <FileSpreadsheet class="mb-2 h-8 w-8 text-[var(--sd-primary)]" />
          <span class="text-[13px] font-semibold">{{ importRows.length ? `${importRows.length} rows ready` : 'Choose a CSV file' }}</span>
          <span class="mt-1 text-[12px] text-[var(--sd-muted)]">{{ importFile || 'Up to 2,000 rows per file' }}</span>
          <input type="file" accept=".csv,text/csv" class="hidden" @change="readCsv">
        </label>
        <p v-if="importError" class="sd-error">{{ importError }}</p>
        <div v-if="importRows.length" class="mt-3 overflow-x-auto rounded-xl border border-[var(--sd-border)]">
          <table class="sd-table"><thead><tr><th>Phone</th><th>Name</th><th>Email</th><th>Tags</th></tr></thead>
            <tbody><tr v-for="(r, i) in importRows.slice(0, 5)" :key="i"><td>{{ r.phone }}</td><td>{{ r.name }}</td><td>{{ r.email }}</td><td>{{ r.tags }}</td></tr></tbody></table>
        </div>
      </template>
      <template #footer>
        <SdButton v-if="importResult" variant="primary" @click="importOpen = false">Done</SdButton>
        <template v-else><SdButton @click="importOpen = false">Cancel</SdButton><SdButton variant="primary" :icon="Upload" :disabled="!importRows.length" :loading="saving" @click="runImport">Import {{ importRows.length || '' }} contacts</SdButton></template>
      </template>
    </SdModal>

    <TagManager v-model:open="tagsOpen" @changed="loadTags" />
    <InboxStartChatModal v-model:open="startOpen" :preset="startContact" @started="c => navigateTo(`/dashboard/inbox?c=${c.id}`)" />
  </div></div>
</template>

<script setup lang="ts">
import { BadgeCheck, Ban, Contact, Crown, Download, FileSpreadsheet, MessageCircle, Pencil, Tags, Upload, UserPlus, Users } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'contacts.view' })
useHead({ title: 'Contacts' })

const api = useApi()
const route = useRoute()
const { can } = useSession()
const { confirm } = useConfirm()
const CONSENT: Record<string, string> = { opted_in: 'Opted in', opted_out: 'Opted out', unknown: 'Unknown' }

const list = useList<any>('contacts/', { tag: '', segment: '', consent: '', blocked: '', vip: '', ordering: '-created_at' })
const hasFilters = computed(() => ['search', 'tag', 'segment', 'consent', 'blocked', 'vip'].some(k => list.filters[k]))
const stats = ref<any>(null)
const tags = ref<any[]>([])
async function loadStats() { try { stats.value = await api.get('contacts/stats/', { silent: true }) } catch {} }
async function loadTags() { try { tags.value = await api.get('tags/', { silent: true }) } catch {} ; list.load() }
onMounted(() => { loadStats(); api.get('tags/', { silent: true }).then(t => tags.value = t).catch(() => {}); if (route.query.new) openForm() })

// form
const formOpen = ref(false)
const editing = ref<any>(null)
const saving = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive<any>({ tag_ids: [] })
const numberLocked = computed(() => !!editing.value?.wa_id)
function openForm(c?: any) {
  Object.keys(errors).forEach(k => delete errors[k])
  editing.value = c || null
  Object.assign(form, c
    ? { wa_id: c.wa_id || '', custom_name: c.custom_name, email: c.email, address: c.address, segment: c.segment || 'regular', consent: c.consent || 'unknown', language: c.language || 'bn', is_vip: !!c.is_vip, tag_ids: c.tags.map((t: any) => t.id) }
    : { wa_id: '', custom_name: '', email: '', address: '', segment: 'regular', consent: 'unknown', language: 'bn', is_vip: false, tag_ids: [] })
  formOpen.value = true
}
function toggleTag(id: number) { form.tag_ids = form.tag_ids.includes(id) ? form.tag_ids.filter((x: number) => x !== id) : [...form.tag_ids, id] }
async function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  saving.value = true
  const body = { ...form }
  if (numberLocked.value || (editing.value && !body.wa_id)) delete body.wa_id
  try {
    if (editing.value) await api.patch(`contacts/${editing.value.id}/`, body, { silent: true })
    else await api.post('contacts/', body, { silent: true })
    toast.success(editing.value ? 'Contact saved' : 'Contact added')
    formOpen.value = false
    list.load(); loadStats()
  } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { saving.value = false }
}

async function setBlocked(c: any, blocked: boolean) {
  if (blocked && !(await confirm({ title: `Block ${c.name}?`, message: 'You won’t be able to message them and they’re excluded from broadcasts. History is kept.', confirmText: 'Block', danger: true }))) return
  try { await api.post(`contacts/${c.id}/block/`, { blocked }); toast.success(blocked ? 'Contact blocked' : 'Contact unblocked'); list.load(); loadStats() } catch {}
}
const startOpen = ref(false)
const startContact = ref<any>(null)
const rowMenu = (c: any) => [
  { label: 'Customer 360°', icon: Contact, onSelect: () => navigateTo(`/dashboard/customer-360?id=${c.id}`) },
  { label: 'Send WhatsApp message', icon: MessageCircle, hidden: c.is_blocked || !can('inbox.send_template'), onSelect: () => { startContact.value = c; startOpen.value = true } },
  { label: 'Edit', icon: Pencil, hidden: !can('contacts.edit'), onSelect: () => openForm(c) },
  { separator: true },
  { label: c.is_blocked ? 'Unblock' : 'Block', icon: Ban, danger: !c.is_blocked, hidden: !can('contacts.block'), onSelect: () => setBlocked(c, !c.is_blocked) },
]

// export
const exporting = ref(false)
async function exportCsv() {
  exporting.value = true
  try { await api.download('contacts/export/', { ...list.filters }, 'contacts.csv') } catch {} finally { exporting.value = false }
}

// import
const importOpen = ref(false)
const importRows = ref<any[]>([])
const importFile = ref('')
const importError = ref('')
const importResult = ref<any>(null)
function openImport() { importRows.value = []; importFile.value = ''; importError.value = ''; importResult.value = null; importOpen.value = true }
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (ch === '"') q = false; else cell += ch }
    else if (ch === '"') q = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(c => c.trim()))
}
async function readCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importError.value = ''
  importFile.value = file.name
  const rows = parseCsv((await file.text()).replace(/^﻿/, ''))
  if (rows.length < 2) { importError.value = 'The file needs a header row and at least one contact.'; importRows.value = []; return }
  const head = rows[0]!.map(h => h.trim().toLowerCase())
  const col = (...names: string[]) => head.findIndex(h => names.includes(h))
  const idx = { phone: col('phone', 'wa_id', 'whatsapp', 'number', 'mobile'), name: col('name', 'full name', 'customer'), email: col('email', 'e-mail'), segment: col('segment'), consent: col('consent', 'opt_in', 'opt-in'), tags: col('tags', 'tag') }
  if (idx.phone < 0) { importError.value = 'No phone column found. Name a column “phone”.'; importRows.value = []; return }
  importRows.value = rows.slice(1, 2001).map(r => Object.fromEntries(Object.entries(idx).map(([k, i]) => [k, i >= 0 ? (r[i] || '').trim() : ''])))
  if (rows.length > 2001) importError.value = 'Only the first 2,000 rows will be imported.'
}
async function runImport() {
  saving.value = true
  try { importResult.value = await api.post('contacts/import/', { contacts: importRows.value }); list.load(); loadStats(); loadTags() } catch {} finally { saving.value = false }
}
const tagsOpen = ref(false)
</script>
