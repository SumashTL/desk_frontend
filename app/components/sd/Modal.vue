<template>
  <DialogRoot :open="open" @update:open="v => emit('update:open', v)">
    <DialogPortal>
      <DialogOverlay data-slot="dialog-overlay" class="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
      <DialogContent data-slot="dialog-content" :aria-describedby="undefined"
        :class="['fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-surface)] text-[var(--sd-text)] shadow-2xl outline-none', widths[size]]"
        @interact-outside="e => persistent && e.preventDefault()">
        <header class="flex items-start gap-3 border-b border-[var(--sd-border)] px-5 py-4">
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-[15px] font-bold tracking-tight">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-[12.5px] leading-5 text-[var(--sd-muted)]">{{ description }}</DialogDescription>
          </div>
          <DialogClose class="-mr-1 rounded-lg p-1.5 text-[var(--sd-muted)] transition hover:bg-[var(--sd-surface-strong)] hover:text-[var(--sd-text)]" aria-label="Close"><X class="h-4 w-4" /></DialogClose>
        </header>
        <div class="sd-scroll flex-1 px-5 py-4"><slot /></div>
        <footer v-if="$slots.footer" class="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--sd-border)] px-5 py-3.5"><slot name="footer" /></footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
<script setup lang="ts">
import { X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
withDefaults(defineProps<{ open: boolean, title: string, description?: string, size?: 'sm' | 'md' | 'lg' | 'xl', persistent?: boolean }>(), { size: 'md' })
const emit = defineEmits<{ 'update:open': [boolean] }>()
const widths = { sm: 'max-w-[420px]', md: 'max-w-[540px]', lg: 'max-w-[720px]', xl: 'max-w-[960px]' }
</script>
