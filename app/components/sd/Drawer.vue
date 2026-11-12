<template>
  <DialogRoot :open="open" @update:open="v => emit('update:open', v)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40" />
      <DialogContent :aria-describedby="undefined"
        :class="['fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[var(--sd-border)] bg-[var(--sd-surface)] text-[var(--sd-text)] shadow-2xl outline-none', width]">
        <header class="flex items-center gap-3 border-b border-[var(--sd-border)] px-5 py-4">
          <DialogTitle class="min-w-0 flex-1 truncate text-[15px] font-bold">{{ title }}</DialogTitle>
          <DialogClose class="rounded-lg p-1.5 text-[var(--sd-muted)] hover:bg-[var(--sd-surface-strong)]" aria-label="Close"><X class="h-4 w-4" /></DialogClose>
        </header>
        <div class="sd-scroll flex-1"><slot /></div>
        <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-[var(--sd-border)] px-5 py-3.5"><slot name="footer" /></footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
<script setup lang="ts">
import { X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
withDefaults(defineProps<{ open: boolean, title: string, width?: string }>(), { width: 'max-w-[440px]' })
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>
