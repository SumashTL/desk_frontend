<template>
  <div ref="host" class="sd-emoji-picker overflow-hidden rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-surface)] shadow-xl" />
</template>
<script setup lang="ts">
// Full emoji keyboard (search, categories, skin tones, recently used). Emoji data is bundled with the app,
// so it works offline and never calls a third-party server.
import dataSource from 'emoji-picker-element-data/en/emojibase/data.json?url'

const emit = defineEmits<{ pick: [string] }>()
const host = ref<HTMLElement>()
const { isDark } = useTheme()
let picker: any = null

onMounted(async () => {
  const { Picker } = await import('emoji-picker-element')
  picker = new Picker({ dataSource, locale: 'en', emojiVersion: 15 })
  picker.classList.add(isDark.value ? 'dark' : 'light')
  picker.addEventListener('emoji-click', (e: any) => emit('pick', e.detail.unicode || e.detail.emoji?.unicode || ''))
  host.value?.appendChild(picker)
  nextTick(() => picker?.shadowRoot?.querySelector('input')?.focus())
})
watch(isDark, (dark) => {
  if (!picker) return
  picker.classList.toggle('dark', dark)
  picker.classList.toggle('light', !dark)
})
onBeforeUnmount(() => { picker?.remove(); picker = null })
</script>
<style>
.sd-emoji-picker emoji-picker {
  --background: var(--sd-surface);
  --border-color: transparent;
  --border-size: 0;
  --button-hover-background: var(--sd-surface-strong);
  --button-active-background: var(--sd-primary-soft);
  --indicator-color: var(--sd-primary);
  --input-border-color: var(--sd-border);
  --input-border-radius: 10px;
  --input-font-color: var(--sd-text);
  --input-placeholder-color: var(--sd-faint);
  --outline-color: var(--sd-primary);
  --category-font-color: var(--sd-muted);
  --category-font-size: 12px;
  --num-columns: 8;
  --emoji-size: 1.45rem;
  --emoji-padding: 0.35rem;
  width: min(352px, calc(100vw - 32px));
  height: 360px;
}
</style>
