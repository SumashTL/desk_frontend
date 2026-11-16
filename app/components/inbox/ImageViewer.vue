<template>
  <Teleport to="body">
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition duration-150" leave-active-class="transition duration-150">
      <div v-if="src" class="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Image preview" @click.self="close">
        <div class="flex items-center gap-2 px-3 py-2 text-white sm:px-5" @click.self="close">
          <span class="min-w-0 flex-1 truncate text-[13px] text-white/70">{{ name }}</span>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" :title="zoomed ? 'Fit to screen' : 'Actual size'" :aria-label="zoomed ? 'Fit to screen' : 'Actual size'" @click="zoomed = !zoomed">
            <component :is="zoomed ? ZoomOut : ZoomIn" class="h-5 w-5" />
          </button>
          <a :href="src" :download="name || ''" target="_blank" rel="noopener" class="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" title="Download" aria-label="Download image"><Download class="h-5 w-5" /></a>
          <button ref="closeBtn" type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" title="Close (Esc)" aria-label="Close preview" @click="close"><X class="h-5 w-5" /></button>
        </div>
        <div :class="['flex min-h-0 flex-1 p-2 sm:p-6', zoomed ? 'overflow-auto' : 'items-center justify-center overflow-hidden']" @click.self="close">
          <img :src="src" :alt="caption || 'Image'" :class="zoomed ? 'm-auto max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in rounded-lg object-contain shadow-2xl'" @click="zoomed = !zoomed">
        </div>
        <p v-if="caption" class="mx-auto max-w-2xl whitespace-pre-wrap break-words px-4 pb-4 text-center text-[13.5px] text-white/85" @click.self="close">{{ caption }}</p>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { Download, X, ZoomIn, ZoomOut } from '@lucide/vue'

const props = defineProps<{ src: string | null, caption?: string, name?: string }>()
const emit = defineEmits<{ close: [] }>()
const zoomed = ref(false)
const closeBtn = ref<HTMLButtonElement>()

function close() { emit('close') }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

watch(() => props.src, (open) => {
  zoomed.value = false
  if (open) {
    window.addEventListener('keydown', onKey)
    nextTick(() => closeBtn.value?.focus())
  } else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>