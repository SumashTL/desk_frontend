<template>
  <SdModal :open="open" :title="item ? 'Edit follow-up' : 'New follow-up'" description="A reminder to get back to this customer at the right time." @update:open="v => $emit('update:open', v)">
    <form id="followup-form" class="space-y-3" @submit.prevent="save">
      <SdField v-if="!contact" label="Customer" :error="errors.contact" required>
        <div v-if="picked" class="flex items-center gap-2 rounded-lg border border-[var(--sd-border)] px-3 py-2">
          <SdAvatar :name="picked.name" :seed="picked.id" size="xs" /><span class="flex-1 truncate">{{ picked.name }} · {{ picked.phone }}</span>
          <button v-if="!item" type="button" class="sd-link text-[12px]" @click="picked = null">Change</button>
        </div>
        <div v-else class="relative">
          <SdSearch v-model="q" placeholder="Search a customer by name or number" />
          <div v-if="results.length" class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--sd-border)] bg-[var(--sd-surface)] p-1 shadow-xl">
            <button v-for="c in results" :key="c.id" type="button" class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[var(--sd-surface-soft)]" @click="picked = c; q = ''">
              <SdAvatar :name="c.name" :seed="c.id" size="xs" /><span class="truncate text-[12.5px]">{{ c.name }} <span class="text-[var(--sd-muted)]">{{ c.phone }}</span></span>
            </button>
          </div>
        </div>
      </SdField>
      <SdField label="Title" :error="errors.title" required><input v-model="form.title" class="sd-input" placeholder="e.g. Call back about the order" maxlength="160"></SdField>
      <div class="grid gap-3 sm:grid-cols-2">
        <SdField label="Due" :error="errors.due_at" required><input v-model="form.due_at" type="datetime-local" class="sd-input"></SdField>
        <SdField label="Type"><select v-model="form.kind" class="sd-input"><option value="callback">Callback</option><option value="message">Message</option><option value="check_in">Check-in</option><option value="other">Other</option></select></SdField>
      </div>
      <SdField v-if="owners.length > 1" label="Owner" :error="errors.owner"><select v-model="form.owner" class="sd-input"><option v-for="o in owners" :key="o.id" :value="o.id">{{ o.name }}{{ o.id === me?.id ? ' (you)' : '' }}</option></select></SdField>
      <SdField label="Note" optional><textarea v-model="form.note" class="sd-input" rows="3" placeholder="Anything the owner should know" /></SdField>
    </form>
    <template #footer>
      <SdButton @click="$emit('update:open', false)">Cancel</SdButton>
      <SdButton type="submit" form="followup-form" variant="primary" :loading="saving">{{ item ? 'Save changes' : 'Create follow-up' }}</SdButton>
    </template>
  </SdModal>
</template>
<script setup lang="ts">
import { toast } from 'vue-sonner'
const props = defineProps<{ open: boolean, contact?: { id: number, name: string } | null, conversationId?: string | null, item?: any }>()
const emit = defineEmits(['update:open', 'saved'])
const api = useApi()
const { me } = useSession()
const owners = ref<any[]>([])
const saving = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive<any>({ title: '', due_at: '', kind: 'callback', owner: null, note: '' })
const picked = ref<any>(null)
const q = ref('')
const results = ref<any[]>([])
let timer: any
watch(q, (v) => {
  clearTimeout(timer)
  if (!v.trim()) { results.value = []; return }
  timer = setTimeout(async () => { try { results.value = (await api.get('contacts/', { query: { search: v }, silent: true })).results.slice(0, 8) } catch {} }, 250)
})

watch(() => props.open, async (open) => {
  if (!open) return
  Object.keys(errors).forEach(k => delete errors[k])
  const due = new Date(); due.setDate(due.getDate() + 1); due.setHours(10, 0, 0, 0)
  Object.assign(form, props.item
    ? { title: props.item.title, due_at: toLocalInput(props.item.due_at), kind: props.item.kind, owner: props.item.owner, note: props.item.note }
    : { title: '', due_at: toLocalInput(due), kind: 'callback', owner: me.value?.id, note: '' })
  picked.value = props.item ? props.item.contact_detail : null
  if (!owners.value.length) { try { owners.value = await api.get('followups/owners/', { silent: true }) } catch {} }
})

async function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  const contactId = props.contact?.id ?? picked.value?.id
  if (!contactId) errors.contact = 'Pick a customer.'
  if (!form.title.trim()) errors.title = 'Give it a short title.'
  if (!form.due_at) errors.due_at = 'Pick a date and time.'
  if (Object.keys(errors).length) return
  saving.value = true
  const body: any = { ...form, due_at: fromLocalInput(form.due_at), contact: contactId }
  if (props.conversationId) body.conversation = props.conversationId
  try {
    const saved = props.item ? await api.patch(`followups/${props.item.id}/`, body, { silent: true }) : await api.post('followups/', body, { silent: true })
    toast.success(props.item ? 'Follow-up updated' : 'Follow-up created')
    emit('saved', saved)
    emit('update:open', false)
  } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { saving.value = false }
}
</script>
