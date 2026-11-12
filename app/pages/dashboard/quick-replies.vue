<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Quick replies" subtitle="Saved answers for the questions you get every day. In a chat, type / or press ⚡ to insert one. Most used come first.">
      <SdButton variant="primary" :icon="Plus" @click="openForm()">New quick reply</SdButton>
    </SdPageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SdStat label="Available to you" :value="num(stats?.total)" :icon="Zap" :loading="!stats" />
      <SdStat label="Active" :value="num(stats?.active)" :icon="CircleCheck" :loading="!stats" />
      <SdStat label="Team replies" :value="num(stats?.team)" :icon="Users" tone="blue" :loading="!stats" />
      <SdStat label="Private replies" :value="num(stats?.private)" :icon="Lock" tone="gray" :loading="!stats" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdSearch v-model="list.filters.search" placeholder="Search shortcut or text" class="w-full sm:w-72" />
        <select v-model="list.filters.category" class="sd-input !w-auto"><option value="">All categories</option><option v-for="c in stats?.categories?.filter(Boolean) || []" :key="c" :value="c">{{ c }}</option></select>
        <select v-model="list.filters.visibility" class="sd-input !w-auto"><option value="">Team + private</option><option value="team">Team</option><option value="private">Private</option></select>
      </div>
      <SdTableSkeleton v-if="list.loading.value && !list.items.value.length" />
      <SdErrorState v-else-if="list.error.value" :message="list.error.value" @retry="list.load" />
      <SdEmpty v-else-if="!list.items.value.length" :icon="Zap" title="No quick replies" text="Save the answers you type most often — prices, delivery times, payment details.">
        <SdButton size="sm" variant="primary" @click="openForm()">New quick reply</SdButton>
      </SdEmpty>
      <div v-else class="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="r in list.items.value" :key="r.id" :class="['flex flex-col rounded-xl border border-[var(--sd-border)] p-4', !r.is_active && 'opacity-60']">
          <div class="flex items-center gap-2">
            <span class="sd-kbd !text-[12px] font-semibold text-[var(--sd-primary-ink)]">/{{ r.shortcut }}</span>
            <SdBadge :tone="r.visibility === 'team' ? 'blue' : 'gray'">{{ r.visibility === 'team' ? 'Team' : 'Private' }}</SdBadge>
            <SdBadge v-if="!r.is_active" tone="amber">Off</SdBadge>
            <div class="flex-1" />
            <SdMenu v-if="r.can_edit" :items="[{ label: 'Edit', icon: Pencil, onSelect: () => openForm(r) }, { label: r.is_active ? 'Turn off' : 'Turn on', icon: Power, onSelect: () => toggle(r) }, { separator: true }, { label: 'Delete', icon: Trash2, danger: true, onSelect: () => remove(r) }]" />
          </div>
          <p class="mt-2 text-[13.5px] font-semibold">{{ r.title }}</p>
          <p class="mt-1 line-clamp-4 flex-1 whitespace-pre-wrap text-[12.5px] leading-5 text-[var(--sd-muted)]">{{ r.body }}</p>
          <div class="mt-3 flex items-center gap-2 text-[11px] text-[var(--sd-faint)]">
            <span class="flex-1 truncate">{{ r.category || 'General' }} · by {{ r.created_by?.name || '—' }}</span>
            <span v-if="r.usage_count" class="shrink-0 font-semibold text-[var(--sd-muted)]">Used {{ num(r.usage_count) }}×</span>
            <button class="shrink-0 font-semibold text-[var(--sd-primary-ink)] hover:underline" @click="copyText(r.body).then(() => toast.success('Copied'))">Copy</button>
          </div>
        </div>
      </div>
      <SdPagination v-model:page="list.page.value" :count="list.count.value" />
    </div>

    <SdModal v-model:open="formOpen" :title="editing ? 'Edit quick reply' : 'New quick reply'" size="lg">
      <form id="qr-form" class="grid gap-3 sm:grid-cols-2" @submit.prevent="save">
        <SdField label="Shortcut" :error="errors.shortcut" hint="Letters, numbers and dashes, e.g. price" required>
          <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sd-faint)]">/</span><input v-model="form.shortcut" class="sd-input !pl-6" maxlength="50"></div>
        </SdField>
        <SdField label="Title" :error="errors.title" required><input v-model="form.title" class="sd-input" maxlength="100" placeholder="Price list"></SdField>
        <SdField label="Message" :error="errors.body" class="sm:col-span-2" required>
          <textarea ref="bodyBox" v-model="form.body" class="sd-input" rows="6" maxlength="4096" placeholder="Hi {{first_name}}, the price is ৳ 1,250 with free delivery inside Dhaka." />
          <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <span class="text-[var(--sd-muted)]">Insert:</span>
            <button v-for="v in VARS" :key="v.key" type="button" class="rounded-full border border-[var(--sd-border)] px-2 py-0.5 font-medium hover:border-[var(--sd-primary)] hover:text-[var(--sd-primary-ink)]" :title="v.hint" @click="insertVar(v.key)">{{ v.label }}</button>
          </div>
        </SdField>
        <div v-if="form.body" class="sd-chat-wallpaper rounded-xl p-3 sm:col-span-2">
          <div class="ml-auto max-w-[85%] whitespace-pre-wrap rounded-xl rounded-tr-md bg-[var(--sd-bubble-out)] px-3 py-2 text-[12.5px] shadow-sm">{{ sample }}</div>
        </div>
        <SdField label="Category" :error="errors.category" optional><input v-model="form.category" class="sd-input" list="qr-cats" placeholder="Sales"><datalist id="qr-cats"><option v-for="c in stats?.categories?.filter(Boolean) || []" :key="c" :value="c" /></datalist></SdField>
        <SdField label="Who can use it" :error="errors.visibility">
          <select v-model="form.visibility" class="sd-input" :disabled="!can('quick_replies.manage_team')"><option value="private">Only me</option><option value="team">Whole team</option></select>
          <p v-if="!can('quick_replies.manage_team')" class="sd-hint">Managers create replies for the whole team.</p>
        </SdField>
        <SdToggle v-model="form.is_active" class="sm:col-span-2" label="Active" description="Inactive replies don’t appear in the composer." />
      </form>
      <template #footer><SdButton @click="formOpen = false">Cancel</SdButton><SdButton type="submit" form="qr-form" variant="primary" :loading="saving">Save</SdButton></template>
    </SdModal>
  </div></div>
</template>
<script setup lang="ts">
import { CircleCheck, Lock, Pencil, Plus, Power, Trash2, Users, Zap } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'quick_replies.view' })
useHead({ title: 'Quick replies' })
const api = useApi()
const { can } = useSession()
const { confirm } = useConfirm()
const list = useList<any>('quick-replies/', { category: '', visibility: '' }, { pageSize: 25 })
const stats = ref<any>(null)
const loadStats = async () => { try { stats.value = await api.get('quick-replies/stats/', { silent: true }) } catch {} }
onMounted(loadStats)
const formOpen = ref(false)
const editing = ref<any>(null)
const saving = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive<any>({})
const VARS = [
  { key: 'name', label: 'Customer name', hint: 'Full name, e.g. Rahim Uddin' },
  { key: 'first_name', label: 'First name', hint: 'e.g. Rahim' },
  { key: 'phone', label: 'Customer number' },
  { key: 'agent', label: 'Your name', hint: 'The agent who sends it' },
]
const bodyBox = ref<HTMLTextAreaElement>()
function insertVar(key: string) {
  const el = bodyBox.value
  const at = el?.selectionStart ?? form.body.length
  const token = `{{${key}}}`
  form.body = form.body.slice(0, at) + token + form.body.slice(el?.selectionEnd ?? at)
  nextTick(() => { el?.focus(); el?.setSelectionRange(at + token.length, at + token.length) })
}
const { me } = useSession()
const sample = computed(() => (form.body || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (all: string, k: string) => (({ name: 'Rahim Uddin', customer_name: 'Rahim Uddin', first_name: 'Rahim', phone: '+880 1712-345678', agent: me.value?.display_name || 'You' } as any)[k.toLowerCase()] ?? all)))
function openForm(r?: any) {
  Object.keys(errors).forEach(k => delete errors[k])
  editing.value = r || null
  Object.assign(form, r ? { shortcut: r.shortcut, title: r.title, body: r.body, category: r.category, visibility: r.visibility, is_active: r.is_active }
    : { shortcut: '', title: '', body: '', category: '', visibility: can('quick_replies.manage_team') ? 'team' : 'private', is_active: true })
  formOpen.value = true
}
async function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  saving.value = true
  const body = { ...form }
  if (!can('quick_replies.manage_team')) delete body.visibility
  try {
    editing.value ? await api.patch(`quick-replies/${editing.value.id}/`, body, { silent: true }) : await api.post('quick-replies/', body, { silent: true })
    toast.success('Quick reply saved'); formOpen.value = false; list.load(); loadStats()
  } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { saving.value = false }
}
async function toggle(r: any) { try { await api.patch(`quick-replies/${r.id}/`, { is_active: !r.is_active }); list.load(); loadStats() } catch {} }
async function remove(r: any) {
  if (!(await confirm({ title: `Delete /${r.shortcut}?`, confirmText: 'Delete', danger: true }))) return
  try { await api.del(`quick-replies/${r.id}/`); toast.success('Deleted'); list.load(); loadStats() } catch {}
}
</script>
