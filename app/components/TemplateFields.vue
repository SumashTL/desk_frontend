<template>
  <!-- Everything a WhatsApp template needs before it can be sent: title values, a photo/video/document,
       {{1}} values for the message and the ending of dynamic links. Used by chats, new chats and broadcasts. -->
  <div class="space-y-4">
    <div class="sd-chat-wallpaper rounded-xl p-4">
      <div class="ml-auto max-w-[92%] overflow-hidden rounded-2xl rounded-tr-md bg-[var(--sd-bubble-out)] text-[13px] shadow-sm">
        <div v-if="header?.format && header.format !== 'TEXT'" class="grid h-28 place-items-center bg-black/[.06] text-[11.5px] text-[var(--sd-muted)] dark:bg-white/[.06]">
          <img v-if="mediaPreview" :src="mediaPreview" alt="" class="h-full w-full object-cover">
          <span v-else class="inline-flex items-center gap-1.5"><component :is="mediaIcon" class="h-4 w-4" />{{ mediaName || `${headerKind} goes here` }}</span>
        </div>
        <div class="px-3 py-2">
          <p v-if="headerText" class="mb-1 font-bold">{{ headerText }}</p>
          <p class="whitespace-pre-wrap">{{ bodyText }}</p>
          <p v-if="need?.footer" class="mt-1 text-[11px] text-[var(--sd-muted)]">{{ need.footer }}</p>
        </div>
        <div v-if="need?.buttons?.length" class="divide-y divide-black/5 border-t border-black/5 dark:divide-white/10 dark:border-white/10">
          <p v-for="b in need.buttons" :key="b.index" class="flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-semibold text-sky-600 dark:text-sky-400">
            <ExternalLink v-if="b.type === 'URL'" class="h-3.5 w-3.5" /><Phone v-else-if="b.type === 'PHONE_NUMBER'" class="h-3.5 w-3.5" /><Reply v-else class="h-3.5 w-3.5" />{{ b.text }}
          </p>
        </div>
      </div>
    </div>

    <SdField v-if="header && header.format !== 'TEXT'" :label="`${headerKind} at the top`" :error="showErrors && !media.id && !media.link ? 'Required' : ''"
      :hint="header.format === 'IMAGE' ? 'JPG or PNG up to 5 MB.' : header.format === 'VIDEO' ? 'MP4 up to 16 MB.' : 'PDF or other document up to 100 MB.'">
      <div class="flex flex-wrap items-center gap-2">
        <label class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--sd-border)] px-3 text-[12.5px] font-semibold hover:bg-[var(--sd-surface-soft)]">
          <Loader2 v-if="uploading" class="h-4 w-4 animate-spin" /><Upload v-else class="h-4 w-4" />{{ media.id ? 'Change file' : 'Upload file' }}
          <input type="file" class="hidden" :accept="accept" :disabled="uploading" @change="upload">
        </label>
        <span v-if="mediaName" class="truncate text-[12px] text-[var(--sd-muted)]">{{ mediaName }}</span>
      </div>
    </SdField>
    <SdField v-for="(_, i) in model.header_params" :key="`h${i}`" :label="`Title value {{${i + 1}}}`" :error="showErrors && !model.header_params[i]?.trim() ? 'Required' : ''">
      <input v-model="model.header_params[i]" class="sd-input" :placeholder="`Title value ${i + 1}`">
    </SdField>
    <SdField v-for="(_, i) in model.params" :key="`b${i}`" :label="`Value for {{${i + 1}}}`" :error="showErrors && !model.params[i]?.trim() ? 'Required' : ''" :hint="personalise && i === 0 ? 'Tip: type {name} to use each customer’s name.' : ''">
      <input v-model="model.params[i]" class="sd-input" :placeholder="i === 0 && contactName ? contactName : `Value ${i + 1}`">
    </SdField>
    <SdField v-for="b in urlButtons" :key="`u${b.index}`" :label="`“${b.text}” link ending`" :hint="b.url" :error="showErrors && !model.button_params[b.index]?.trim() ? 'Required' : ''">
      <input v-model="model.button_params[b.index]" class="sd-input" placeholder="e.g. order-1024">
    </SdField>
    <p v-if="!model.params.length && !model.header_params.length && !urlButtons.length && !(header && header.format !== 'TEXT')" class="text-[12px] text-[var(--sd-muted)]">Nothing to fill in — this template is ready to send.</p>
  </div>
</template>
<script setup lang="ts">
import { ExternalLink, FileText, Film, Image as ImageIcon, Loader2, Phone, Reply, Upload } from '@lucide/vue'
import { toast } from 'vue-sonner'

export interface TemplateValues { params: string[], header_params: string[], button_params: Record<string, string>, header_media_id?: string, header_media_link?: string, header_media_name?: string }
const props = defineProps<{ template: any, contactName?: string, showErrors?: boolean, personalise?: boolean, initial?: any }>()
const model = defineModel<TemplateValues>({ required: true })
const api = useApi()
const need = computed(() => props.template?.requirements || { body_params: props.template?.param_count || 0, header: null, buttons: [], footer: '' })
const header = computed(() => need.value.header)
const headerKind = computed(() => ({ IMAGE: 'Photo', VIDEO: 'Video', DOCUMENT: 'Document' } as any)[header.value?.format] || 'File')
const mediaIcon = computed(() => header.value?.format === 'VIDEO' ? Film : header.value?.format === 'DOCUMENT' ? FileText : ImageIcon)
const accept = computed(() => ({ IMAGE: 'image/*', VIDEO: 'video/*', DOCUMENT: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv' } as any)[header.value?.format] || '*/*')
const urlButtons = computed(() => (need.value.buttons || []).filter((b: any) => b.needs_value))
const media = computed(() => ({ id: model.value.header_media_id, link: model.value.header_media_link }))
const mediaName = computed(() => model.value.header_media_name || '')
const mediaPreview = ref<string | null>(null)
const uploading = ref(false)

// reset the values whenever another template is chosen
watch(() => props.template?.id, () => {
  const init = props.initial || {}
  model.value = {
    params: Array.from({ length: need.value.body_params || 0 }, (_, i) => init.params?.[i] ?? (i === 0 && props.contactName ? props.contactName : '')),
    header_params: Array.from({ length: header.value?.params || 0 }, (_, i) => init.header_params?.[i] ?? ''),
    button_params: { ...(init.button_params || {}) },
    header_media_id: init.header_media_id || '', header_media_link: init.header_media_link || '', header_media_name: init.header_media_name || '',
  }
  mediaPreview.value = null
}, { immediate: true })

const fill = (text: string, values: string[]) => (text || '').replace(/\{\{(\d+)\}\}/g, (_: string, n: string) => values[Number(n) - 1] || `{{${n}}}`)
const bodyText = computed(() => fill(props.template?.body || '', model.value.params.map(v => props.personalise ? v.replace('{name}', 'Rahim') : v)))
const headerText = computed(() => header.value?.format === 'TEXT' ? fill(header.value.text, model.value.header_params) : '')

async function upload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  const body = new FormData()
  body.append('file', file)
  try {
    const res = await api.post('inbox/template-media/', body)
    model.value = { ...model.value, header_media_id: res.media_id, header_media_name: file.name }
    mediaPreview.value = header.value?.format === 'IMAGE' ? URL.createObjectURL(file) : null
    toast.success('File ready')
  } catch {} finally { uploading.value = false }
}

/** true when everything required is filled in */
function valid() {
  const v = model.value
  if (v.params.some(p => !p.trim()) || v.header_params.some(p => !p.trim())) return false
  if (header.value && header.value.format !== 'TEXT' && !v.header_media_id && !v.header_media_link) return false
  return urlButtons.value.every((b: any) => (v.button_params[b.index] || '').trim())
}
/** what the API expects in `extras` */
function extras() {
  const v = model.value
  const out: any = {}
  if (v.header_params.length) out.header_params = v.header_params.map(s => s.trim())
  if (v.header_media_id) out.header_media_id = v.header_media_id
  if (v.header_media_link) out.header_media_link = v.header_media_link
  if (v.header_media_name) out.header_media_name = v.header_media_name
  if (urlButtons.value.length) out.button_params = Object.fromEntries(urlButtons.value.map((b: any) => [String(b.index), (v.button_params[b.index] || '').trim()]))
  return out
}
defineExpose({ valid, extras })
</script>
