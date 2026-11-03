<template>
  <tr class="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
    <!-- 1. Member Profile (Avatar, Name, Email) -->
    <td class="py-4 pl-4 sm:pl-6 pr-4">
      <div class="flex items-center gap-3.5 min-w-[200px]">
        <!-- Avatar with Status Dot -->
        <div class="relative shrink-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-2xs border overflow-hidden"
            :class="[member.avatarBg || 'bg-amber-100 text-amber-800 border-amber-200/70']"
          >
            <span v-if="member.avatarText" class="text-base">{{ member.avatarText }}</span>
            <span v-else>{{ member.initials }}</span>
          </div>
          <!-- Online status dot -->
          <span
            v-if="member.isActive"
            class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-card-surface"
          />
        </div>

        <!-- Name & Email -->
        <div class="min-w-0">
          <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
            {{ member.name }}
          </h4>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5 font-medium">
            {{ member.email }}
          </p>
        </div>
      </div>
    </td>

    <!-- 2. Role -->
    <td class="py-4 px-4 whitespace-nowrap">
      <span class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
        {{ member.role }}
      </span>
    </td>

    <!-- 3. Channel Access -->
    <td class="py-4 px-4 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <WhatsAppIcon class="w-4 h-4 shrink-0" />
        <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {{ member.channel }}
        </span>
        <span
          v-if="member.channelScope"
          class="text-xs text-zinc-400 dark:text-zinc-500 font-medium"
        >
          {{ member.channelScope }}
        </span>
      </div>
    </td>

    <!-- 4. Status -->
    <td class="py-4 px-4 whitespace-nowrap">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {{ member.status }}
      </span>
    </td>

    <!-- 5. Action -->
    <td class="py-4 pl-4 pr-4 sm:pr-6 text-right whitespace-nowrap">
      <!-- If view only -->
      <button
        v-if="member.isViewOnly"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-card-surface text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
      >
        <Eye class="w-3.5 h-3.5 text-zinc-400" />
        <span>View only</span>
      </button>

      <!-- Otherwise: options dropdown menu -->
      <DropdownMenu v-else>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="w-8 h-8 rounded-full border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-card-surface hover:bg-zinc-100 dark:hover:bg-zinc-800 data-[state=open]:bg-active-nav-bg data-[state=open]:border-light-green-border/40 data-[state=open]:text-primary-green flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer ml-auto outline-none"
            title="More options"
          >
            <MoreVertical class="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          :side-offset="8"
          class="w-48 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-card p-2 shadow-xl shadow-zinc-200/60 dark:shadow-none"
        >
          <DropdownMenuItem
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-active-nav-bg focus:text-primary-green cursor-pointer"
          >
            <Pencil class="w-4 h-4 text-primary-green shrink-0" />
            <span>Edit access</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-active-nav-bg focus:text-primary-green cursor-pointer"
          >
            <UserCog class="w-4 h-4 text-primary-green shrink-0" />
            <span>Change role</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-active-nav-bg focus:text-primary-green cursor-pointer"
          >
            <KeyRound class="w-4 h-4 text-primary-green shrink-0" />
            <span>Change password</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 focus:text-zinc-900 cursor-pointer"
          >
            <Power class="w-4 h-4 text-amber-600 shrink-0" />
            <span>Deactivate</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 focus:text-red-600 cursor-pointer"
          >
            <Trash2 class="w-4 h-4 text-red-500 shrink-0" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </tr>
</template>

<script setup>
import { Eye, KeyRound, MoreVertical, Pencil, Power, Trash2, UserCog } from '@lucide/vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import WhatsAppIcon from '~/components/WhatsAppIcon.vue'

defineProps({
  member: {
    type: Object,
    required: true,
  },
})
</script>

