<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <!-- Left: Title & Subtitle -->
      <div class="shrink-0">
        <h1
          class="text-2xl sm:text-[28px] font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Members
        </h1>
        <p
          class="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 sm:whitespace-nowrap">
          Track each teammate's access, invites, and workspace coverage.
        </p>
      </div>

      <!-- Center: Bigger Search Box placed in the middle -->
      <div class="flex-1 flex xl:justify-center w-full min-w-0">
        <div class="relative w-full max-w-sm md:max-w-md">
          <Search
            class="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search member..."
            class="w-full h-[42px] pl-11 pr-4 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all shadow-xs"
            @input="$emit('search', searchQuery)" />
        </div>
      </div>

      <!-- Right: Taller Pill Tabs for Period Filtering -->
      <div class="shrink-0 flex items-center justify-start xl:justify-end">
        <PillTabs
          v-model="selectedPeriod"
          :items="periodOptions"
          size="md"
          class="shadow-xs"
          @change="$emit('periodChange', selectedPeriod)" />
      </div>
    </div>

    <!-- Actions Row: Invite by Link & Create Member Buttons -->
    <div class="flex items-center justify-end gap-3">
      <!-- Invite by link (Site's signature green gradient button) -->
      <button
        type="button"
        @click="isInviteDialogOpen = true"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold shadow-[0_4px_14px_-2px_rgba(23,144,13,0.35)] transition-all cursor-pointer whitespace-nowrap"
      >
        <UserPlus class="w-4 h-4 stroke-[2.2]" />
        <span>Invite by link</span>
      </button>

      <!-- Create member (Outline button with brand hover) -->
      <button
        type="button"
        @click="isCreateDialogOpen = true"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-card-surface hover:bg-active-nav-bg/60 border border-zinc-200/90 dark:border-zinc-700 hover:border-light-green-border/50 text-zinc-800 dark:text-zinc-200 hover:text-primary-green text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
      >
        <UserPlus class="w-4 h-4 stroke-[2.2]" />
        <span>Create member</span>
      </button>
    </div>

    <!-- Invite Team Members Modal Dialog -->
    <InviteMemberDialog v-model:open="isInviteDialogOpen" />

    <!-- Create Team Member Modal Dialog -->
    <CreateMemberDialog v-model:open="isCreateDialogOpen" />
  </div>
</template>

<script setup>
import { Search, UserPlus } from "@lucide/vue";
import { ref } from "vue";
import PillTabs from "~/components/PillTabs.vue";
import CreateMemberDialog from "~/components/members/CreateMemberDialog.vue";
import InviteMemberDialog from "~/components/members/InviteMemberDialog.vue";

defineEmits(["search", "periodChange"]);

const searchQuery = ref("");
const selectedPeriod = ref("All");
const isInviteDialogOpen = ref(false);
const isCreateDialogOpen = ref(false);

const periodOptions = [
  "All",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
];
</script>
