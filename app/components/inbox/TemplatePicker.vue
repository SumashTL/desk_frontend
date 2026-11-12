<template>
  <SdModal :open="open" title="Send a WhatsApp template" :description="description" size="lg" @update:open="v => $emit('update:open', v)">
    <div v-if="loading" class="space-y-2"><div v-for="i in 3" :key="i" class="sd-skeleton h-14" /></div>
    <SdEmpty v-else-if="!templates.length" :icon="FileText" title="No approved templates" :text="canSync ? 'Create a template on the Templates page (Meta approves it in minutes to a day), or sync the ones you already have.' : 'Ask a manager to create or sync templates on the Templates page.'" compact>
      <SdButton v-if="canSync" size="sm" to="/dashboard/templates">Open Templates</SdButton>
    </SdEmpty>
    <div v-else class="grid gap-4 md:grid-cols-[220px_1fr]">
      <div class="space-y-2">
        <SdSearch v-model="q" placeholder="Find template" />
        <div class="sd-scroll max-h-[340px] space-y-1">
          <button v-for="t in shown" :key="t.id" type="button" :class="['w-full rounded-lg px-3 py-2 text-left transition', selected?.id === t.id ? 'bg-[var(--sd-primary-soft)]' : 'hover:bg-[var(--sd-surface-soft)]']" @click="choose(t)">
            <span class="block truncate text-[12.5px] font-semibold">{{ t.name }}</span>
            <span class="text-[11px] text-[var(--sd-muted)]">{{ t.category }} · {{ t.language }}</span>
          </button>
        </div>
      </div>
      <div v-if="selected" class="sd-scroll max-h-[60vh] pr-1">
        <TemplateFields ref="fields" v-model="values" :template="selected" :contact-name="contactName" :show-errors="error" />
      </div>
      <SdEmpty v-else title="Pick a template" text="Approved templates can be sent any time — even after the 24-hour window." compact />
    </div>
    <template #footer>
      <SdButton @click="$emit('update:open', false)">Cancel</SdButton>
      <SdButton variant="primary" :icon="Send" :disabled="!selected" :loading="sending" @click="send">Send template</SdButton>
    </template>
  </SdModal>
</template>
<script setup lang="ts">
import { FileText, Send } from '@lucide/vue'
const props = defineProps<{ open: boolean, source: string, contactName?: string, sending?: boolean, description?: string }>()
const emit = defineEmits<{ 'update:open': [boolean], send: [{ template: number, params: string[], extras: any }] }>()
const api = useApi()
const { can } = useSession()
const canSync = computed(() => can('templates.sync'))
const templates = ref<any[]>([])
const loading = ref(false)
const selected = ref<any>(null)
const values = ref<any>({ params: [], header_params: [], button_params: {} })
const fields = ref<any>()
const q = ref('')
const error = ref(false)
const shown = computed(() => templates.value.filter(t => !q.value || t.name.toLowerCase().includes(q.value.toLowerCase())))

watch(() => props.open, async (open) => {
  if (!open) return
  selected.value = null
  error.value = false
  loading.value = true
  try {
    const res = await api.get(props.source, { query: { status: 'APPROVED' } })
    templates.value = Array.isArray(res) ? res : res.results
    if (templates.value.length === 1) choose(templates.value[0])
  } catch { templates.value = [] } finally { loading.value = false }
})
function choose(t: any) {
  selected.value = t
  error.value = false
}
function send() {
  if (!fields.value?.valid()) { error.value = true; return }
  emit('send', { template: selected.value.id, params: values.value.params.map((p: string) => p.trim()), extras: fields.value.extras() })
}
</script>
