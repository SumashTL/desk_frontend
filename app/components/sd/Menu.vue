<template>
  <DropdownMenuRoot :modal="false">
    <DropdownMenuTrigger as-child><slot><SdButton size="icon-sm" variant="ghost" :icon="MoreHorizontal" aria-label="More actions" /></slot></DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent :align="align" :side-offset="6" class="z-50 min-w-[190px] rounded-xl border border-[var(--sd-border)] bg-[var(--sd-surface)] p-1 text-[var(--sd-text)] shadow-xl">
        <template v-for="(item, i) in visible" :key="i">
          <DropdownMenuSeparator v-if="item.separator" class="my-1 h-px bg-[var(--sd-border)]" />
          <DropdownMenuItem v-else :disabled="item.disabled"
            :class="['flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-[var(--sd-surface-strong)] data-[disabled]:opacity-45', item.danger && 'text-[var(--sd-danger)]']"
            @select="item.onSelect?.()">
            <component :is="item.icon" v-if="item.icon" class="h-4 w-4 opacity-75" />{{ item.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuSeparator, DropdownMenuTrigger } from 'reka-ui'
export interface MenuItem { label?: string, icon?: any, danger?: boolean, disabled?: boolean, hidden?: boolean, separator?: boolean, onSelect?: () => void }
const props = withDefaults(defineProps<{ items: MenuItem[], align?: 'start' | 'end' | 'center' }>(), { align: 'end' })
const visible = computed(() => props.items.filter(i => !i.hidden))
</script>
