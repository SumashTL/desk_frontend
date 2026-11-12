<template>
  <SdModal :open="open && !contact" title="Start a new chat" description="Pick a customer. WhatsApp requires an approved template as the first message." @update:open="v => $emit('update:open', v)">
    <SdSearch v-model="q" placeholder="Search contacts by name or number" />
    <div class="mt-3 max-h-[320px] space-y-1 overflow-auto">
      <p v-if="loading" class="py-6 text-center text-[12.5px] text-[var(--sd-muted)]">Searching…</p>
      <SdEmpty v-else-if="!results.length" compact :title="q ? 'No contact found' : 'Type to search'" :text="q && can('contacts.edit') ? 'Add the customer on the Contacts page first.' : ''">
        <SdButton v-if="q && can('contacts.edit')" size="sm" to="/dashboard/contacts?new=1">Add contact</SdButton>
      </SdEmpty>
      <button v-for="c in results" :key="c.id" type="button" :disabled="c.is_blocked" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--sd-surface-soft)] disabled:opacity-50" @click="contact = c">
        <SdAvatar :name="c.name" :seed="c.id" size="sm" />
        <span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-semibold">{{ c.name }}</span><span class="text-[11.5px] text-[var(--sd-muted)]">{{ c.phone }}</span></span>
        <SdBadge v-if="c.is_blocked" tone="red">Blocked</SdBadge>
      </button>
    </div>
  </SdModal>
  <InboxTemplatePicker :open="open && !!contact" source="templates/" :contact-name="contact?.name" :sending="sending"
    :description="contact ? `To ${contact.name} · ${contact.phone}` : ''" @update:open="v => { if (!v) { contact = null; $emit('update:open', false) } }" @send="send" />
</template>
<script setup lang="ts">
import { toast } from 'vue-sonner'
const props = defineProps<{ open: boolean, preset?: any }>()
const emit = defineEmits(['update:open', 'started'])
const api = useApi()
const { can } = useSession()
const q = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const contact = ref<any>(null)
const sending = ref(false)
let timer: any
watch(() => props.open, (o) => { if (o) { contact.value = props.preset || null; q.value = ''; search() } })
watch(q, () => { clearTimeout(timer); timer = setTimeout(search, 250) })
async function search() {
  loading.value = true
  try { results.value = (await api.get('contacts/', { query: { search: q.value, ordering: '-last_interaction_at' }, silent: true })).results.slice(0, 20) } catch {} finally { loading.value = false }
}
async function send({ template, params, extras }: any) {
  sending.value = true
  try {
    const res = await api.post('inbox/conversations/start/', { contact: contact.value.id, template, params, extras })
    toast.success('Message sent')
    emit('started', res.conversation)
    contact.value = null
    emit('update:open', false)
  } catch {} finally { sending.value = false }
}
</script>
