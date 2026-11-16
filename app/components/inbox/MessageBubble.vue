<template>
  <div :id="`m-${m.id}`" :class="['group flex px-3 sm:px-6', out ? 'justify-end' : 'justify-start']">
    <div :class="['relative max-w-[min(78%,560px)]', m.extra?.automated && 'opacity-95']">
      <div :class="['rounded-2xl px-3 pb-1.5 pt-2 text-[13.5px] leading-[1.45] shadow-[0_1px_1px_rgba(0,0,0,.06)]',
                    out ? 'rounded-tr-md bg-[var(--sd-bubble-out)]' : 'rounded-tl-md bg-[var(--sd-bubble-in)]',
                    m.status === 'failed' && 'ring-1 ring-[var(--sd-danger)]/50']">
        <p v-if="out && (m.sent_by || m.extra?.automated)" class="mb-0.5 text-[11px] font-semibold text-[var(--sd-primary-ink)]">
          {{ m.extra?.automated ? automatedLabel : m.sent_by?.name }}
        </p>
        <button v-if="m.reply_to" type="button" class="mb-1.5 block w-full rounded-lg border-l-[3px] border-[var(--sd-primary)] bg-black/[.04] px-2 py-1 text-left text-[12px] text-[var(--sd-muted)] dark:bg-white/[.06]" @click="$emit('jump', m.reply_to.id)">
          <span class="block font-semibold text-[var(--sd-primary-ink)]">{{ m.reply_to.direction === 'in' ? 'Customer' : 'You' }}</span>
          <span class="line-clamp-2">{{ m.reply_to.preview }}</span>
        </button>

        <!-- media -->
        <template v-if="att">
          <div v-if="att.download_status !== 'done' || !att.url" class="mb-1 rounded-lg bg-black/[.04] px-3 py-2.5 text-[12px] text-[var(--sd-muted)] dark:bg-white/[.06]">
            <div class="flex items-center gap-2">
              <Loader2 v-if="att.download_status === 'pending' || retrying" class="h-4 w-4 shrink-0 animate-spin" /><FileWarning v-else class="h-4 w-4 shrink-0" />
              <span>{{ att.download_status === 'pending' ? `Loading ${typeLabel.toLowerCase()}…` : att.download_status === 'purged' ? `${typeLabel} was deleted (media retention)` : `${typeLabel} could not be downloaded` }}</span>
              <button v-if="att.download_status === 'failed' && !out" type="button" class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-[var(--sd-primary-ink)] hover:bg-black/[.05] disabled:opacity-50 dark:hover:bg-white/[.08]" :disabled="retrying" @click="retry">
                <RotateCw class="h-3 w-3" />Retry
              </button>
            </div>
            <p v-if="att.download_status === 'failed' && att.error" class="mt-1 break-words text-[11px] text-[var(--sd-faint)]">{{ att.error }}</p>
          </div>
          <button v-else-if="m.type === 'image' || m.type === 'sticker'" type="button" class="-mx-1 mb-1 block cursor-zoom-in overflow-hidden rounded-xl" :title="`Open ${typeLabel.toLowerCase()}`" @click="viewing = true">
            <span v-if="imgFailed" class="flex h-[160px] w-[220px] max-w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-black/[.05] text-[12px] text-[var(--sd-muted)] dark:bg-white/[.06]">
              <template v-if="imgGaveUp"><FileWarning class="h-5 w-5" />Image not available</template>
              <template v-else><Loader2 class="h-5 w-5 animate-spin" />Loading image…</template>
            </span>
            <img v-else :key="imgSrc" :src="imgSrc" :alt="m.body || 'Image'" :class="['max-h-[320px] w-auto max-w-full object-cover', m.type === 'sticker' && 'max-h-[140px] bg-transparent']" loading="lazy" @error="onImgError">
          </button>
          <video v-else-if="m.type === 'video'" :src="att.url" controls preload="metadata" class="-mx-1 mb-1 max-h-[320px] max-w-full rounded-xl" />
          <audio v-else-if="m.type === 'audio'" :src="att.url" controls preload="metadata" class="mb-1 w-[260px] max-w-full" />
          <a v-else :href="att.url" target="_blank" rel="noopener" class="mb-1 flex items-center gap-3 rounded-xl bg-black/[.04] px-3 py-2.5 hover:bg-black/[.07] dark:bg-white/[.06]">
            <FileText class="h-8 w-8 shrink-0 text-[var(--sd-primary)]" />
            <span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold">{{ att.file_name || 'Document' }}</span><span class="text-[11px] text-[var(--sd-muted)]">{{ fileSize(att.file_size) }} · {{ (att.mime_type || '').split('/').pop() }}</span></span>
            <Download class="ml-auto h-4 w-4 text-[var(--sd-muted)]" />
          </a>
        </template>

        <a v-if="m.type === 'location' && m.extra?.latitude" :href="`https://maps.google.com/?q=${m.extra.latitude},${m.extra.longitude}`" target="_blank" rel="noopener" class="mb-1 flex items-center gap-2 rounded-lg bg-black/[.04] px-3 py-2 dark:bg-white/[.06]">
          <MapPin class="h-4 w-4 text-[var(--sd-primary)]" /><span class="text-[12.5px] font-medium">{{ m.extra.name || m.extra.address || 'Shared location' }}</span>
        </a>
        <p v-if="m.type === 'template'" class="mb-1 inline-flex items-center gap-1 rounded bg-black/[.05] px-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--sd-muted)] dark:bg-white/[.07]"><FileText class="h-3 w-3" />Template · {{ m.extra?.template }}</p>
        <p v-if="m.type === 'interactive' || m.type === 'button'" class="mb-1 inline-flex items-center gap-1 rounded bg-black/[.05] px-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--sd-muted)] dark:bg-white/[.07]"><MousePointerClick class="h-3 w-3" />Tapped</p>
        <p v-if="m.type === 'unsupported'" class="italic text-[var(--sd-muted)]">This message type isn't supported by WhatsApp's API.</p>

        <InboxLinkPreview v-if="previewUrl" :url="previewUrl" />
        <p v-if="m.body && m.type !== 'location'" class="whitespace-pre-wrap break-words"><template v-for="(part, i) in bodyParts" :key="i"><a v-if="part.href" :href="part.href" target="_blank" rel="noopener noreferrer nofollow" class="break-all font-medium text-sky-700 underline decoration-1 underline-offset-2 hover:opacity-80 dark:text-sky-300">{{ part.text }}</a><template v-else>{{ part.text }}</template></template></p>

        <div class="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] text-[var(--sd-faint)]">
          <span>{{ clock(m.sent_at) }}</span>
          <template v-if="out">
            <Clock3 v-if="m.status === 'pending'" class="h-3 w-3" />
            <Check v-else-if="m.status === 'sent'" class="h-3.5 w-3.5" />
            <CheckCheck v-else-if="m.status === 'delivered'" class="h-3.5 w-3.5" />
            <CheckCheck v-else-if="m.status === 'read'" class="h-3.5 w-3.5 text-sky-500" />
            <AlertCircle v-else-if="m.status === 'failed'" class="h-3.5 w-3.5 text-[var(--sd-danger)]" />
          </template>
        </div>
      </div>
      <p v-if="m.status === 'failed'" class="mt-1 text-right text-[11px] text-[var(--sd-danger)]">{{ m.error_message || 'Not delivered' }}<span v-if="m.error_code"> ({{ m.error_code }})</span></p>
      <div v-if="reactions?.length" :class="['absolute -bottom-3 flex gap-0.5 rounded-full border border-[var(--sd-border)] bg-[var(--sd-surface)] px-1.5 text-[13px] shadow-sm', out ? 'right-3' : 'left-3']">
        <button v-for="(r, i) in reactions" :key="i" type="button" :class="[r.mine && canReact ? 'cursor-pointer' : 'cursor-default']" :title="r.mine ? (canReact ? 'Your reaction · click to remove' : 'Your reaction') : 'Customer reacted'" @click="r.mine && canReact && $emit('react', m, '')">{{ r.emoji }}</button>
      </div>
      <div v-if="canReply && m.type !== 'reaction'" :class="['absolute top-1 flex items-center gap-1', out ? '-left-[4.75rem] flex-row-reverse' : '-right-[4.75rem]', picker ? 'flex' : 'hidden group-hover:flex']">
        <button type="button" class="rounded-full bg-[var(--sd-surface)] p-1.5 text-[var(--sd-muted)] shadow-sm hover:text-[var(--sd-text)]" title="Reply" aria-label="Reply to this message" @click="$emit('reply', m)">
          <Reply class="h-3.5 w-3.5" />
        </button>
        <button v-if="canReact" type="button" class="rounded-full bg-[var(--sd-surface)] p-1.5 text-[var(--sd-muted)] shadow-sm hover:text-[var(--sd-text)]" title="React" aria-label="React to this message" @click="picker = !picker">
          <SmilePlus class="h-3.5 w-3.5" />
        </button>
      </div>
      <div v-if="picker" :class="['absolute -top-10 z-10 flex gap-0.5 rounded-full border border-[var(--sd-border)] bg-[var(--sd-surface)] p-1 shadow-lg', out ? 'right-0' : 'left-0']" @mouseleave="picker = false">
        <button v-for="e in EMOJIS" :key="e" type="button" :class="['rounded-full px-1.5 py-0.5 text-[18px] leading-none transition hover:scale-125 hover:bg-[var(--sd-surface-strong)]', myReaction === e && 'bg-[var(--sd-primary-soft)]']" @click="pick(e)">{{ e }}</button>
      </div>
    </div>
    <InboxImageViewer v-if="att && (m.type === 'image' || m.type === 'sticker')" :src="viewing ? imgSrc : null" :caption="m.body" :name="att.file_name" @close="viewing = false" />
  </div>
</template>
<script setup lang="ts">
import { AlertCircle, Check, CheckCheck, Clock3, Download, FileText, FileWarning, Loader2, MapPin, MousePointerClick, Reply, RotateCw, SmilePlus } from '@lucide/vue'
const props = defineProps<{ m: any, reactions?: { emoji: string, mine: boolean }[], canReply?: boolean }>()
const emit = defineEmits<{ reply: [any], jump: [number], react: [any, string], retry: [any, () => void] }>()
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']
const picker = ref(false)
const retrying = ref(false)
// WhatsApp lets the business react to the customer's messages
const canReact = computed(() => !!props.canReply && props.m.direction === 'in' && props.m.type !== 'reaction')
const myReaction = computed(() => props.reactions?.find(r => r.mine)?.emoji || '')
function pick(e: string) {
  picker.value = false
  emit('react', props.m, myReaction.value === e ? '' : e)
}
function retry() {
  retrying.value = true
  emit('retry', props.m, () => { retrying.value = false })
}
const out = computed(() => props.m.direction === 'out')
const att = computed(() => props.m.attachment && { ...props.m.attachment, url: assetUrl(props.m.attachment.url) })
// links in the text are clickable; the first one in a text message gets a preview card
const bodyParts = computed(() => linkParts(props.m.body || ''))
const previewUrl = computed(() => props.m.type === 'text' ? bodyParts.value.find(p => p.href)?.href : undefined)

// Photos: open in a popup on this page. If a photo fails to load (e.g. its file was just replaced by a
// smaller copy), try again a few times instead of showing a broken image; a realtime update usually
// brings the new address first.
const viewing = ref(false)
const imgFailed = ref(false)
const imgTry = ref(0)
let imgTimer: any
const imgSrc = computed(() => {
  const url = att.value?.url
  if (!url || !imgTry.value) return url
  return `${url}${url.includes('?') ? '&' : '?'}r=${imgTry.value}`
})
watch(() => att.value?.url, () => { imgTry.value = 0; imgFailed.value = false; imgGaveUp.value = false; clearTimeout(imgTimer) })
const imgGaveUp = ref(false)
function onImgError() {
  imgFailed.value = true
  if (imgTry.value >= 4) { imgGaveUp.value = true; return }
  clearTimeout(imgTimer)
  imgTimer = setTimeout(() => { imgTry.value += 1; imgFailed.value = false }, 1500 * (imgTry.value + 1))
}
onBeforeUnmount(() => clearTimeout(imgTimer))
const typeLabel = computed(() => ({ image: 'Image', video: 'Video', audio: 'Voice note', document: 'Document', sticker: 'Sticker' } as any)[props.m.type] || 'File')
const automatedLabel = computed(() => ({ greeting: 'Auto greeting', away: 'Away message', csat: 'Rating request' } as any)[props.m.extra?.automated] || 'Automated')
</script>