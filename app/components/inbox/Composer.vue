<template>
  <div class="border-t border-[var(--sd-border)] bg-[var(--sd-surface)]">
    <!-- window closed / not allowed -->
    <div v-if="!canReply" class="flex items-center gap-3 px-4 py-4 text-[12.5px] text-[var(--sd-muted)]">
      <Ban class="h-4 w-4 shrink-0" />{{ blockedReason }}
    </div>
    <template v-else>
      <div class="flex items-center gap-1 px-3 pt-2">
        <button v-for="m in modes" :key="m.value" type="button" :class="['flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition', mode === m.value ? (m.value === 'note' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-[var(--sd-primary-soft)] text-[var(--sd-primary-ink)]') : 'text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)]']" @click="mode = m.value">
          <component :is="m.icon" class="h-3.5 w-3.5" />{{ m.label }}
        </button>
        <span v-if="mode === 'reply' && windowOpen && secondsLeft !== null" :class="['ml-auto text-[11px]', secondsLeft < 3600 ? 'font-semibold text-amber-600' : 'text-[var(--sd-faint)]']">
          <Clock class="mr-0.5 inline h-3 w-3" />{{ windowText }} left to reply freely
        </span>
      </div>

      <div v-if="mode === 'reply' && !windowOpen" class="m-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12.5px] leading-5">
        <p class="font-semibold text-amber-800 dark:text-amber-200">The 24-hour window is closed</p>
        <p class="mt-0.5 text-amber-800/80 dark:text-amber-200/80">WhatsApp only allows an approved template until the customer writes again.</p>
        <SdButton class="mt-2" size="sm" variant="primary" :icon="FileText" @click="$emit('template')">Choose template</SdButton>
      </div>

      <template v-else>
        <div v-if="replyTo && mode === 'reply'" class="mx-3 mt-2 flex items-start gap-2 rounded-lg border-l-[3px] border-[var(--sd-primary)] bg-[var(--sd-surface-soft)] px-3 py-2 text-[12px]">
          <div class="min-w-0 flex-1"><p class="font-semibold text-[var(--sd-primary-ink)]">Replying to {{ replyTo.direction === 'in' ? 'customer' : 'your message' }}</p><p class="truncate text-[var(--sd-muted)]">{{ replyTo.body || `[${replyTo.type}]` }}</p></div>
          <button class="text-[var(--sd-muted)] hover:text-[var(--sd-text)]" aria-label="Cancel reply" @click="$emit('cancel-reply')"><X class="h-4 w-4" /></button>
        </div>
        <div v-if="file" class="mx-3 mt-2 flex items-center gap-3 rounded-lg bg-[var(--sd-surface-soft)] px-3 py-2">
          <img v-if="filePreview" :src="filePreview" class="h-12 w-12 rounded-md object-cover" alt="">
          <FileText v-else class="h-8 w-8 text-[var(--sd-primary)]" />
          <div class="min-w-0 flex-1"><p class="truncate text-[12.5px] font-semibold">{{ file.name }}</p><p class="text-[11px] text-[var(--sd-muted)]">{{ fileSize(file.size) }} · the text below becomes the caption</p></div>
          <button class="text-[var(--sd-muted)] hover:text-[var(--sd-text)]" aria-label="Remove file" @click="clearFile"><X class="h-4 w-4" /></button>
        </div>

        <div class="relative px-3 pb-4 pt-2 sm:px-4">
          <div v-if="suggestions.length" class="absolute bottom-full left-3 right-3 mb-1 max-h-64 overflow-auto rounded-xl border border-[var(--sd-border)] bg-[var(--sd-surface)] p-1 shadow-xl">
            <p class="px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Quick replies</p>
            <button v-for="(r, i) in suggestions" :key="r.id" type="button" :class="['block w-full rounded-lg px-2.5 py-2 text-left', i === pick ? 'bg-[var(--sd-surface-strong)]' : 'hover:bg-[var(--sd-surface-soft)]']" @mousedown.prevent="applyReply(r)">
              <span class="text-[12px] font-semibold text-[var(--sd-primary-ink)]">/{{ r.shortcut }}</span> <span class="text-[12px] font-medium">{{ r.title }}</span>
              <span class="block truncate text-[11.5px] text-[var(--sd-muted)]">{{ render(r.body) }}</span>
            </button>
          </div>
          <div v-if="qrOpen" class="sd-qr-panel absolute bottom-full left-3 right-3 z-30 mb-2 flex max-h-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-surface)] shadow-xl sm:left-4 sm:right-auto sm:w-[420px]" @keydown.esc="qrOpen = false">
            <div class="flex items-center gap-2 border-b border-[var(--sd-border)] p-2">
              <SdSearch v-model="qrSearch" placeholder="Search quick replies" class="flex-1" />
              <SdButton size="xs" variant="ghost" to="/dashboard/quick-replies">Manage</SdButton>
            </div>
            <div class="sd-scroll min-h-0 flex-1 p-1">
              <p v-if="!qrShown.length" class="px-3 py-6 text-center text-[12.5px] text-[var(--sd-muted)]">No quick replies yet. Create them on the Quick replies page.</p>
              <button v-for="r in qrShown" :key="r.id" type="button" class="block w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--sd-surface-soft)]" @click="applyReply(r)">
                <span class="flex items-center gap-2"><span class="text-[12px] font-semibold text-[var(--sd-primary-ink)]">/{{ r.shortcut }}</span><span class="truncate text-[12.5px] font-medium">{{ r.title }}</span><span v-if="r.category" class="ml-auto shrink-0 text-[10.5px] text-[var(--sd-faint)]">{{ r.category }}</span></span>
                <span class="mt-0.5 line-clamp-2 block text-[12px] leading-[17px] text-[var(--sd-muted)]">{{ render(r.body) }}</span>
              </button>
            </div>
          </div>
          <div v-if="emojiOpen" class="absolute bottom-full left-3 z-30 mb-2 sm:left-4" @keydown.esc="emojiOpen = false">
            <InboxEmojiPicker @pick="insertEmoji" />
          </div>
          <div :class="['rounded-2xl border transition focus-within:border-[var(--sd-primary)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sd-primary)_12%,transparent)]', mode === 'note' ? 'border-amber-400/50 bg-[var(--sd-note)]' : 'border-[var(--sd-border)] bg-[var(--sd-surface)]']">
            <!-- recording a voice note -->
            <div v-if="rec.state !== 'idle'" class="flex min-h-[64px] items-center gap-3 px-4 py-3">
              <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', rec.state === 'recording' ? 'animate-pulse bg-rose-500' : 'bg-[var(--sd-faint)]']" />
              <span class="w-12 shrink-0 font-mono text-[13px] tabular-nums">{{ recTime }}</span>
              <div class="flex h-8 flex-1 items-center justify-end gap-[3px] overflow-hidden" aria-hidden="true">
                <span v-for="(l, i) in rec.levels" :key="i" class="w-[3px] shrink-0 rounded-full bg-[var(--sd-primary)]" :style="{ height: `${Math.max(12, l * 100)}%`, opacity: 0.35 + l * 0.65 }" />
              </div>
              <span v-if="rec.state === 'sending'" class="text-[12px] text-[var(--sd-muted)]">Sending…</span>
            </div>
            <textarea v-else ref="box" v-model="text" rows="2" :placeholder="mode === 'note' ? 'Internal note — only your team sees this' : 'Write a message… use / for quick replies'"
              class="block max-h-56 min-h-[64px] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-[14px] leading-[22px] outline-none placeholder:text-[var(--sd-faint)] focus-visible:outline-none"
              @keydown="onKey" @input="onInput" @paste="onPaste" />
            <div class="flex items-center gap-0.5 px-2 pb-2">
              <template v-if="rec.state !== 'idle'">
                <SdButton size="icon-sm" variant="ghost" :icon="Trash2" title="Discard recording" aria-label="Discard recording" :disabled="rec.state === 'sending'" @click="cancelRecording" />
                <span class="ml-1 text-[11.5px] text-[var(--sd-muted)]">{{ rec.state === 'recording' ? 'Recording… press send when done' : '' }}</span>
              </template>
              <template v-else>
                <template v-if="mode === 'reply'">
                  <SdButton size="icon-sm" variant="ghost" :icon="Paperclip" title="Attach photo, video or file" aria-label="Attach a file" @click="fileInput?.click()" />
                  <SdButton v-if="canTemplate" size="icon-sm" variant="ghost" :icon="FileText" title="Send a template" aria-label="Send a template" @click="$emit('template')" />
                  <input ref="fileInput" type="file" class="hidden" accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*,application/vnd.ms-excel,application/vnd.ms-powerpoint,text/plain,text/csv,application/zip" @change="onFile">
                </template>
                <SdButton size="icon-sm" :variant="emojiOpen ? 'soft' : 'ghost'" :icon="Smile" title="Emoji" aria-label="Emoji" @click="emojiOpen = !emojiOpen" />
                <SdButton v-if="mode === 'reply'" size="icon-sm" :variant="qrOpen ? 'soft' : 'ghost'" :icon="Zap" title="Quick replies" aria-label="Quick replies" @click="qrOpen = !qrOpen" />
                <span class="ml-2 hidden text-[10.5px] text-[var(--sd-faint)] md:inline"><span class="sd-kbd">Enter</span> send · <span class="sd-kbd">Shift</span>+<span class="sd-kbd">Enter</span> new line</span>
              </template>
              <div class="flex-1" />
              <SdButton v-if="mode === 'reply' && rec.state === 'idle' && !text.trim() && !file && canRecord" size="icon" variant="primary" :icon="Mic" title="Record a voice message" aria-label="Record a voice message" class="!h-9 !w-9 !rounded-full" @click="startRecording" />
              <SdButton v-else-if="rec.state !== 'idle'" size="icon" variant="primary" :icon="Send" :loading="rec.state === 'sending'" title="Send voice message" aria-label="Send voice message" class="!h-9 !w-9 !rounded-full" @click="stopAndSend" />
              <SdButton v-else size="icon" :variant="mode === 'note' ? 'quiet' : 'primary'" :icon="Send" :loading="sending" :disabled="!canSend" :title="mode === 'note' ? 'Add note' : 'Send'" aria-label="Send" class="!h-9 !w-9 !rounded-full" @click="submit" />
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Ban, Clock, FileText, MessageSquareText, Mic, Paperclip, Send, Smile, StickyNote, Trash2, X, Zap } from '@lucide/vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ conversationId: string, canReply: boolean, blockedReason: string, windowOpen: boolean, secondsLeft: number | null, canTemplate: boolean, replyTo: any | null, contactName: string, contactPhone?: string }>()
const emit = defineEmits<{
  send: [{ body: string, reply_to?: number | null, done: (ok: boolean) => void }]
  media: [{ file: File, caption: string, done: (ok: boolean) => void }]
  note: [{ text: string, done: (ok: boolean) => void }]
  template: []
  'cancel-reply': []
  typing: []
}>()

const api = useApi()
const mode = ref<'reply' | 'note'>('reply')
const modes = [{ value: 'reply', label: 'Reply', icon: MessageSquareText }, { value: 'note', label: 'Note', icon: StickyNote }] as const
const text = ref('')
const sending = ref(false)
const file = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()
const box = ref<HTMLTextAreaElement>()
const quickReplies = ref<any[]>([])
const pick = ref(0)

const drafts = useState<Record<string, string>>('inbox-drafts', () => ({}))
watch(() => props.conversationId, (id, old) => {
  if (old) drafts.value[old] = text.value
  text.value = drafts.value[id] || ''
  clearFile()
  mode.value = 'reply'
  nextTick(resize)
}, { immediate: true })

const canSend = computed(() => !sending.value && (text.value.trim().length > 0 || (!!file.value && mode.value === 'reply')))
const windowText = computed(() => {
  const s = props.secondsLeft || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
})

const slash = computed(() => mode.value === 'reply' && /^\/[\w-]*$/.test(text.value) ? text.value.slice(1).toLowerCase() : null)
const suggestions = computed(() => slash.value === null ? [] : quickReplies.value.filter(r => r.shortcut.startsWith(slash.value!) || r.title.toLowerCase().includes(slash.value!)).slice(0, 8))
async function loadQuickReplies() {
  try { quickReplies.value = await api.get('inbox/quick-replies/', { silent: true }) } catch {}
}
watch(slash, (s, old) => {
  pick.value = 0
  if (s !== null && old === null) loadQuickReplies() // refresh each time "/" is typed, so new replies show up
})
onMounted(loadQuickReplies)

// {{name}} {{first_name}} {{phone}} {{agent}} are filled in automatically
const { me } = useSession()
function render(body: string) {
  const name = /^[+@\d]/.test(props.contactName || '') ? '' : (props.contactName || '')
  const values: Record<string, string> = {
    name, customer_name: name, first_name: name.split(/\s+/)[0] || '', phone: props.contactPhone || '', agent: me.value?.display_name || me.value?.name || '',
  }
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (all, key: string) => key.toLowerCase() in values ? values[key.toLowerCase()]! : all)
    .replace(/ +([,.!?])/g, '$1').replace(/^[ ,]+/, '')
}
function applyReply(r: any) {
  text.value = render(r.body)
  qrOpen.value = false
  api.post(`inbox/quick-replies/${r.id}/used/`, {}, { silent: true }).catch(() => {})
  r.usage_count = (r.usage_count || 0) + 1
  nextTick(() => { resize(); box.value?.focus() })
}
// ⚡ panel: browse and search all quick replies
const qrOpen = ref(false)
const qrSearch = ref('')
const qrShown = computed(() => {
  const q = qrSearch.value.trim().toLowerCase()
  return quickReplies.value.filter(r => !q || r.shortcut.includes(q) || r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q))
})
watch(qrOpen, (o) => { if (o) { qrSearch.value = ''; loadQuickReplies() } })

function resize() {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(Math.max(el.scrollHeight, 64), 224)}px`
}

// ---------- emoji ----------
const emojiOpen = ref(false)
function insertEmoji(e: string) {
  if (!e) return
  const el = box.value
  const start = el?.selectionStart ?? text.value.length
  const end = el?.selectionEnd ?? text.value.length
  text.value = text.value.slice(0, start) + e + text.value.slice(end)
  nextTick(() => { el?.focus(); el?.setSelectionRange(start + e.length, start + e.length); resize() })
}
function closeEmoji(ev: MouseEvent) {
  const t = ev.target as HTMLElement
  if (emojiOpen.value && !t.closest('.sd-emoji-picker') && !t.closest('[aria-label="Emoji"]')) emojiOpen.value = false
  if (qrOpen.value && !t.closest('.sd-qr-panel') && !t.closest('[aria-label="Quick replies"]')) qrOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', closeEmoji))

// ---------- voice message ----------
// Chrome records WebM/Opus, Firefox OGG/Opus, Safari MP4/AAC; the server turns WebM into OGG for WhatsApp.
const canRecord = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
const rec = reactive({ state: 'idle' as 'idle' | 'recording' | 'sending', started: 0, elapsed: 0, levels: [] as number[] })
let recorder: MediaRecorder | null = null
let chunks: Blob[] = []
let stream: MediaStream | null = null
let audioCtx: AudioContext | null = null
let raf = 0
let discard = false
const MAX_SECONDS = 15 * 60
const recTime = computed(() => `${Math.floor(rec.elapsed / 60)}:${String(Math.floor(rec.elapsed % 60)).padStart(2, '0')}`)

function pickMime() {
  for (const m of ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']) if (MediaRecorder.isTypeSupported(m)) return m
  return ''
}
async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  } catch {
    toast.error('Microphone access is blocked. Allow it from the browser address bar, then try again.')
    return
  }
  const mime = pickMime()
  recorder = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined)
  chunks = []
  discard = false
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  recorder.onstop = finishRecording
  recorder.start(250)
  Object.assign(rec, { state: 'recording', started: Date.now(), elapsed: 0, levels: [] })
  emojiOpen.value = false
  const tick = (t: number) => {
    rec.elapsed = (Date.now() - rec.started) / 1000
    if (rec.elapsed >= MAX_SECONDS) { stopAndSend(); return }
    meter(t)
    raf = requestAnimationFrame(tick)
  }
  let meter = (_t: number) => {}
  try { // live level bars
    audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    audioCtx.createMediaStreamSource(stream).connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    let last = 0
    meter = (t: number) => {
      if (t - last < 90) return
      last = t
      analyser.getByteTimeDomainData(data)
      let peak = 0
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128))
      rec.levels.push(Math.min(1, peak / 60))
      if (rec.levels.length > 60) rec.levels.shift()
    }
  } catch {}
  raf = requestAnimationFrame(tick)
}
function cleanupRecording() {
  cancelAnimationFrame(raf)
  stream?.getTracks().forEach(t => t.stop())
  audioCtx?.close().catch(() => {})
  stream = null
  audioCtx = null
}
function cancelRecording() {
  discard = true
  if (recorder?.state === 'recording') recorder.stop()
  else { cleanupRecording(); rec.state = 'idle' }
}
function stopAndSend() {
  if (recorder?.state !== 'recording') return
  rec.state = 'sending'
  recorder.stop()
}
function finishRecording() {
  cleanupRecording()
  if (discard || rec.elapsed < 0.7 || !chunks.length) {
    if (!discard) toast.message('That recording was too short.')
    rec.state = 'idle'
    return
  }
  const type = (recorder?.mimeType || chunks[0]!.type || 'audio/webm').split(';')[0]!
  const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm'
  const voice = new File(chunks, `voice-${Date.now()}.${ext}`, { type })
  emit('media', { file: voice, caption: '', done: () => { rec.state = 'idle' } })
}
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeEmoji)
  discard = true
  if (recorder?.state === 'recording') recorder.stop()
  cleanupRecording()
})

let lastTyping = 0
function onInput() {
  resize()
  if (mode.value === 'reply' && Date.now() - lastTyping > 3000) { lastTyping = Date.now(); emit('typing') }
}

function onKey(e: KeyboardEvent) {
  if (suggestions.value.length) {
    if (e.key === 'ArrowDown') { e.preventDefault(); pick.value = (pick.value + 1) % suggestions.value.length; return }
    if (e.key === 'ArrowUp') { e.preventDefault(); pick.value = (pick.value - 1 + suggestions.value.length) % suggestions.value.length; return }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyReply(suggestions.value[pick.value]); return }
    if (e.key === 'Escape') { text.value = ''; return }
  }
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    if (slash.value === null) submit() // "/word" with no match is a search, never sent by accident
  }
}

// Size checked before upload; the server converts webp/heic photos, .mov videos and voice notes for WhatsApp.
const LIMITS: Record<string, number> = { image: 15, video: 16, audio: 16, document: 100 }
function kind(f: File) {
  if (f.type.startsWith('image/') && !['image/gif', 'image/svg+xml'].includes(f.type)) return 'image'
  if (f.type.startsWith('video/')) return 'video'
  if (f.type.startsWith('audio/')) return 'audio'
  return 'document'
}
function setFile(f: File) {
  const limit = LIMITS[kind(f)]!
  if (f.size > limit * 1024 * 1024) { toast.error(`${kind(f)[0]!.toUpperCase()}${kind(f).slice(1)}s can be at most ${limit} MB on WhatsApp.`); return }
  file.value = f
  filePreview.value = kind(f) === 'image' ? URL.createObjectURL(f) : null
  box.value?.focus()
}
function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) setFile(f)
  ;(e.target as HTMLInputElement).value = ''
}
function onPaste(e: ClipboardEvent) {
  const f = [...(e.clipboardData?.files || [])][0]
  if (f && mode.value === 'reply') { e.preventDefault(); setFile(f) }
}
function clearFile() {
  if (filePreview.value) URL.revokeObjectURL(filePreview.value)
  file.value = null
  filePreview.value = null
}

function submit() {
  if (!canSend.value) return
  const body = text.value.trim()
  sending.value = true
  const done = (ok: boolean) => {
    sending.value = false
    if (ok) { text.value = ''; drafts.value[props.conversationId] = ''; clearFile(); nextTick(resize) }
    nextTick(() => box.value?.focus())
  }
  if (mode.value === 'note') emit('note', { text: body, done })
  else if (file.value) emit('media', { file: file.value, caption: body, done })
  else emit('send', { body, reply_to: props.replyTo?.id ?? null, done })
}

defineExpose({ focus: () => box.value?.focus() })
</script>
