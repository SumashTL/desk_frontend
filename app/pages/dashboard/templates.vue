<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="WhatsApp templates" subtitle="Pre-approved messages from Meta. Needed to start a chat, to reply after 24 hours, and for broadcasts.">
      <SdButton v-if="can('templates.sync')" :icon="RefreshCw" :loading="syncing" @click="sync">Sync from Meta</SdButton>
      <SdButton v-if="can('templates.sync')" variant="primary" :icon="Plus" @click="openCreate">New template</SdButton>
    </SdPageHeader>

    <details class="sd-card mb-4 p-4 text-[13px] leading-6" :open="!list.count.value">
      <summary class="cursor-pointer font-semibold">How templates work</summary>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-[var(--sd-muted)]">
        <li>WhatsApp lets you write freely only for <b>24 hours after the customer’s last message</b>. After that — and for the very first message to a new customer — you must send an <b>approved template</b>.</li>
        <li>Create one here with <b>New template</b>. Use <code v-pre>{{1}}</code>, <code v-pre>{{2}}</code> for parts that change (name, order number). Meta reviews it, usually within minutes, sometimes up to a day.</li>
        <li>When it shows <b>approved</b>, agents can send it from any chat (the 📄 button in the message box), start new chats with it, and managers can broadcast it.</li>
        <li>Templates made in Meta WhatsApp Manager (for example with a photo at the top) appear after <b>Sync from Meta</b>.</li>
        <li><b>Utility</b> = order updates, reminders, follow-ups. <b>Marketing</b> = offers and promotions (costs more, needs the customer’s permission).</li>
      </ul>
    </details>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SdStat label="Templates" :value="num(stats?.total)" :icon="FileText" :loading="!stats" />
      <SdStat label="Approved" :value="num(stats?.approved)" :icon="BadgeCheck" :loading="!stats" />
      <SdStat label="In review" :value="num(stats?.pending)" :icon="Hourglass" tone="amber" :loading="!stats" />
      <SdStat label="Rejected / paused" :value="num(stats?.rejected)" :icon="XCircle" tone="red" :loading="!stats" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdSearch v-model="list.filters.search" placeholder="Search template name" class="w-full sm:w-72" />
        <select v-model="list.filters.status" class="sd-input !w-auto"><option value="">Any status</option><option value="APPROVED">Approved</option><option value="PENDING">In review</option><option value="REJECTED">Rejected</option><option value="PAUSED">Paused</option></select>
        <select v-model="list.filters.category" class="sd-input !w-auto"><option value="">Any category</option><option value="MARKETING">Marketing</option><option value="UTILITY">Utility</option><option value="AUTHENTICATION">Authentication</option></select>
      </div>
      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdErrorState v-else-if="list.error.value" :message="list.error.value" @retry="list.load" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="FileText" title="No templates here" :text="can('templates.sync') ? 'Create templates in Meta WhatsApp Manager, wait for approval, then press “Sync from Meta”.' : 'Ask a manager to sync templates from Meta.'" />
      <div v-else class="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="t in list.items.value" :key="t.id" class="flex flex-col rounded-xl border border-[var(--sd-border)] p-4">
          <div class="flex items-center gap-2"><p class="min-w-0 flex-1 truncate font-mono text-[12.5px] font-semibold">{{ t.name }}</p><SdBadge :tone="tone(t.status)" dot>{{ t.status.toLowerCase() }}</SdBadge></div>
          <p class="mt-1 text-[11.5px] text-[var(--sd-muted)]">{{ t.category }} · {{ t.language }} · {{ t.param_count }} variable{{ t.param_count === 1 ? '' : 's' }}</p>
          <div class="sd-chat-wallpaper mt-3 flex-1 rounded-xl p-3">
            <p v-if="header(t)" class="mb-1 text-[12.5px] font-bold">{{ header(t) }}</p>
            <div class="whitespace-pre-wrap rounded-xl rounded-tl-md bg-[var(--sd-bubble-in)] px-3 py-2 text-[12.5px] leading-5 shadow-sm">{{ t.body || '(no body text)' }}<p v-if="footer(t)" class="mt-1 text-[11px] text-[var(--sd-faint)]">{{ footer(t) }}</p></div>
            <div v-if="buttons(t).length" class="mt-1 grid gap-1"><span v-for="b in buttons(t)" :key="b" class="rounded-lg bg-[var(--sd-bubble-in)] py-1.5 text-center text-[12px] font-semibold text-sky-600">{{ b }}</span></div>
          </div>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-[var(--sd-faint)]">
            <span class="flex-1">Updated {{ timeAgo(t.updated_at) }}</span>
            <button v-if="can('templates.sync')" class="font-semibold text-[var(--sd-danger)] hover:underline" @click="remove(t)">Delete</button>
          </div>
        </div>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>

    <SdModal v-model:open="createOpen" title="New WhatsApp template" description="Sent to Meta for review. You can use it once it is approved." size="xl">
      <div class="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-3">
            <SdField class="sm:col-span-3" label="Name" :error="err.name" hint="Lowercase, numbers and _ (e.g. order_ready)."><input v-model="form.name" class="sd-input font-mono" placeholder="order_ready" @input="form.name = form.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')"></SdField>
            <SdField label="Type" :error="err.category">
              <select v-model="form.category" class="sd-input"><option value="UTILITY">Utility (updates)</option><option value="MARKETING">Marketing (offers)</option></select>
            </SdField>
            <SdField label="Language">
              <select v-model="form.language" class="sd-input"><option value="en">English</option><option value="en_US">English (US)</option><option value="bn">Bangla</option></select>
            </SdField>
            <SdField label="Title (optional)" :error="err.header_text"><input v-model="form.header_text" class="sd-input" maxlength="60" placeholder="Order update"></SdField>
          </div>
          <SdField label="Message" :error="err.body" :hint="`${form.body.length}/1024 · a blank can't be the first or last word`">
            <textarea v-model="form.body" rows="5" class="sd-input" maxlength="1024" placeholder="Hi {{1}}, your order {{2}} is ready for pickup at our Bashundhara shop." />
            <button type="button" class="sd-link mt-1 text-[12px]" @click="addVar">+ Add blank {{ nextVar }}</button>
          </SdField>
          <div v-if="varCount" class="grid gap-3 sm:grid-cols-2">
            <SdField v-for="i in varCount" :key="i" :label="`Example for {{${i}}}`" :error="i === 1 ? err.examples : ''"><input v-model="form.examples[i - 1]" class="sd-input" :placeholder="i === 1 ? 'Rahim' : '#1024'"></SdField>
          </div>
          <SdField label="Footer (optional)" :error="err.footer"><input v-model="form.footer" class="sd-input" maxlength="60" placeholder="Sumash Tech"></SdField>
          <div>
            <p class="sd-label">Buttons (optional)</p>
            <div v-for="(b, i) in form.buttons" :key="i" class="mb-2 grid gap-2 rounded-xl border border-[var(--sd-border)] p-2 sm:grid-cols-[130px_1fr_1fr_auto]">
              <select v-model="b.type" class="sd-input"><option value="QUICK_REPLY">Quick reply</option><option value="URL">Website</option><option value="PHONE_NUMBER">Call</option></select>
              <input v-model="b.text" class="sd-input" maxlength="25" placeholder="Button text">
              <input v-if="b.type === 'URL'" v-model="b.url" class="sd-input" placeholder="https://sumashtech.com">
              <input v-else-if="b.type === 'PHONE_NUMBER'" v-model="b.phone_number" class="sd-input" placeholder="+8801XXXXXXXXX">
              <span v-else />
              <SdButton size="icon-sm" variant="ghost" :icon="X" aria-label="Remove button" @click="form.buttons.splice(i, 1)" />
            </div>
            <SdButton v-if="form.buttons.length < 3" size="xs" :icon="Plus" @click="form.buttons.push({ type: 'QUICK_REPLY', text: '', url: '', phone_number: '' })">Add button</SdButton>
            <p v-if="err.buttons" class="mt-1 text-[12px] text-[var(--sd-danger)]">{{ err.buttons }}</p>
          </div>
        </div>
        <div>
          <p class="sd-label">Preview</p>
          <div class="sd-chat-wallpaper rounded-xl p-3">
            <div class="overflow-hidden rounded-xl rounded-tl-md bg-[var(--sd-bubble-in)] text-[12.5px] shadow-sm">
              <div class="px-3 py-2">
                <p v-if="form.header_text" class="mb-1 font-bold">{{ form.header_text }}</p>
                <p class="whitespace-pre-wrap leading-5">{{ previewBody || 'Your message…' }}</p>
                <p v-if="form.footer" class="mt-1 text-[11px] text-[var(--sd-faint)]">{{ form.footer }}</p>
              </div>
              <p v-for="(b, i) in form.buttons.filter(b => b.text)" :key="i" class="border-t border-black/5 py-1.5 text-center text-[12px] font-semibold text-sky-600 dark:border-white/10">{{ b.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <SdButton @click="createOpen = false">Cancel</SdButton>
        <SdButton variant="primary" :icon="Send" :loading="creating" @click="create">Submit for review</SdButton>
      </template>
    </SdModal>
  </div></div>
</template>
<script setup lang="ts">
import { BadgeCheck, FileText, Hourglass, Plus, RefreshCw, Send, X, XCircle } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'templates.view' })
useHead({ title: 'Templates' })
const api = useApi()
const { can } = useSession()
const list = useList<any>('templates/', { status: '', category: '' })
const stats = ref<any>(null)
const syncing = ref(false)
const loadStats = async () => { try { stats.value = await api.get('templates/stats/', { silent: true }) } catch {} }
onMounted(loadStats)
const tone = (s: string) => (({ APPROVED: 'green', PENDING: 'amber', REJECTED: 'red', PAUSED: 'red', DISABLED: 'red' } as any)[s] || 'gray')
const comp = (t: any, type: string) => (t.components || []).find((c: any) => c.type === type)
const header = (t: any) => comp(t, 'HEADER')?.format === 'TEXT' ? comp(t, 'HEADER').text : comp(t, 'HEADER') ? `[${comp(t, 'HEADER').format?.toLowerCase()}]` : ''
const footer = (t: any) => comp(t, 'FOOTER')?.text || ''
const buttons = (t: any) => (comp(t, 'BUTTONS')?.buttons || []).map((b: any) => b.text)
const { confirm } = useConfirm()
const createOpen = ref(false)
const creating = ref(false)
const err = reactive<Record<string, string>>({})
const blank = () => ({ name: '', category: 'UTILITY', language: 'en', header_text: '', body: '', footer: '', examples: [] as string[], buttons: [] as any[] })
const form = reactive(blank())
const nextVar = computed(() => `{{${varCount.value + 1}}}`)
const varCount = computed(() => new Set([...form.body.matchAll(/\{\{(\d+)\}\}/g)].map(m => m[1])).size)
const previewBody = computed(() => form.body.replace(/\{\{(\d+)\}\}/g, (_: string, n: string) => form.examples[Number(n) - 1] || `{{${n}}}`))
function openCreate() { Object.assign(form, blank()); Object.keys(err).forEach(k => delete err[k]); createOpen.value = true }
function addVar() { form.body = `${form.body}${form.body && !form.body.endsWith(' ') ? ' ' : ''}{{${varCount.value + 1}}}` }
async function create() {
  creating.value = true
  Object.keys(err).forEach(k => delete err[k])
  try {
    const t = await api.post('templates/', { ...form, examples: form.examples.slice(0, varCount.value) }, { silent: true })
    toast.success(`“${t.name}” sent to Meta for review`)
    createOpen.value = false
    list.load(); loadStats()
  } catch (e: any) {
    Object.assign(err, Object.fromEntries(Object.entries(e.fields || {}).map(([k, v]: any) => [k, Array.isArray(v) ? v[0] : String(v)])))
    if (!Object.keys(e.fields || {}).length) toast.error(e.message)
  } finally { creating.value = false }
}
async function remove(t: any) {
  if (!await confirm({ title: `Delete “${t.name}”?`, message: 'It is deleted in Meta too. Chats that already used it are not affected.', confirmText: 'Delete', danger: true })) return
  try { await api.del(`templates/${t.id}/`); toast.success('Template deleted'); list.load(); loadStats() } catch {}
}
async function sync() {
  syncing.value = true
  try { const r = await api.post('whatsapp/templates/sync/'); toast.success(`Synced ${r.synced} templates from Meta`); list.load(); loadStats() } catch {} finally { syncing.value = false }
}
</script>
