<template>
  <div class="card p-0 overflow-hidden">
    <!-- Card Header: Title & View All Link -->
    <div
      class="px-5 py-4 sm:px-6 sm:py-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-4"
    >
      <h2
        class="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight"
      >
        Recent Conversations
      </h2>

      <NuxtLink
        to="/dashboard/inbox"
        class="inline-flex items-center gap-1 text-xs sm:text-[13px] font-bold text-primary-green hover:text-dark-green transition-colors shrink-0"
      >
        <span>View all</span>
        <ArrowUpRight class="w-3.5 h-3.5 stroke-[2.5]" />
      </NuxtLink>
    </div>

    <!-- Responsive Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-subtle-bg/50 dark:bg-zinc-800/20"
          >
            <th class="py-3 pl-5 sm:pl-6 pr-4 font-bold">Customer</th>
            <th class="py-3 px-4 font-bold">Channel</th>
            <th class="py-3 px-4 font-bold">Assigned To</th>
            <th class="py-3 px-4 font-bold">Status</th>
            <th class="py-3 px-4 font-bold">Last Message</th>
            <th class="py-3 pl-4 pr-5 sm:pr-6 text-right font-bold">Updated</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          <tr
            v-for="conversation in conversations"
            :key="conversation.id"
            class="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
          >
            <!-- 1. Customer -->
            <td class="py-3.5 pl-5 sm:pl-6 pr-4 whitespace-nowrap">
              <div class="flex items-center gap-3 min-w-[200px]">
                <div
                  class="w-9 h-9 rounded-full bg-active-nav-bg dark:bg-emerald-950/60 border border-light-green-border/35 dark:border-emerald-800/50 text-primary-green dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0 select-none"
                >
                  {{ conversation.initials }}
                </div>
                <span
                  class="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 truncate"
                >
                  {{ conversation.customer }}
                </span>
              </div>
            </td>

            <!-- 2. Channel -->
            <td class="py-3.5 px-4 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-full bg-[#25D366]/15 dark:bg-[#25D366]/20 flex items-center justify-center shrink-0"
                >
                  <WhatsAppIcon class="w-5 h-5" />
                </div>
                <div class="leading-tight">
                  <div
                    class="text-xs font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    {{ conversation.channelName }}
                  </div>
                  <div
                    class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5"
                  >
                    {{ conversation.channelPlatform }}
                  </div>
                </div>
              </div>
            </td>

            <!-- 3. Assigned To -->
            <td class="py-3.5 px-4 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <div
                  :class="[
                    'w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 border select-none',
                    conversation.isUnassigned
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      : 'bg-active-nav-bg/70 dark:bg-emerald-950/40 border-light-green-border/35 dark:border-emerald-800/50 text-primary-green dark:text-emerald-400',
                  ]"
                >
                  {{ conversation.assigneeInitials }}
                </div>
                <span
                  :class="[
                    'text-xs font-medium',
                    conversation.isUnassigned
                      ? 'text-zinc-500 dark:text-zinc-400'
                      : 'text-zinc-800 dark:text-zinc-200 font-semibold',
                  ]"
                >
                  {{ conversation.assignedTo }}
                </span>
              </div>
            </td>

            <!-- 4. Status -->
            <td class="py-3.5 px-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
                  conversation.status === 'Open'
                    ? 'bg-active-nav-bg text-primary-green border-light-green-border/40 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60'
                    : 'bg-amber-50 text-amber-600 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
                ]"
              >
                {{ conversation.status }}
              </span>
            </td>

            <!-- 5. Last Message -->
            <td class="py-3.5 px-4 max-w-[260px] sm:max-w-[360px] xl:max-w-[460px]">
              <p
                :title="conversation.lastMessage"
                class="text-xs sm:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 truncate"
              >
                {{ truncateMessage(conversation.lastMessage, 48) }}
              </p>
            </td>

            <!-- 6. Updated -->
            <td
              class="py-3.5 pl-4 pr-5 sm:pr-6 text-right whitespace-nowrap text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums"
            >
              {{ conversation.updated }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ArrowUpRight } from "@lucide/vue";
import { ref } from "vue";
import WhatsAppIcon from "~/components/icons/WhatsAppIcon.vue";

const truncateMessage = (text, maxLength = 48) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

const conversations = ref([
  {
    id: 1,
    customer: "Asif Mahmud",
    initials: "AM",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Unassigned",
    assigneeInitials: "U",
    isUnassigned: true,
    status: "Open",
    lastMessage: "Hello, could you please share the store location and opening hours?",
    updated: "2m ago",
  },
  {
    id: 2,
    customer: "Priyanka Saha",
    initials: "PS",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Unassigned",
    assigneeInitials: "U",
    isUnassigned: true,
    status: "Open",
    lastMessage: "Is this available in Black and Silver color variants?",
    updated: "3m ago",
  },
  {
    id: 3,
    customer: "Dr. Tareq Ahmed",
    initials: "DA",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Unassigned",
    assigneeInitials: "U",
    isUnassigned: true,
    status: "Open",
    lastMessage: "Product inquiry: Wireless Stylus Pen, Order reference #ST-9399",
    updated: "3m ago",
  },
  {
    id: 4,
    customer: "Nurul Amin",
    initials: "NA",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Unassigned",
    assigneeInitials: "U",
    isUnassigned: true,
    status: "Open",
    lastMessage: "Can you confirm the current discount price for bulk orders?",
    updated: "4m ago",
  },
  {
    id: 5,
    customer: "Asiful Alam Rakib",
    initials: "AA",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Sadikul Islam Sadi",
    assigneeInitials: "SI",
    isUnassigned: false,
    status: "Pending",
    lastMessage: "Thank you, I have received the tracking details.",
    updated: "8m ago",
  },
  {
    id: 6,
    customer: "Sadayeen Sabit Shoron",
    initials: "SS",
    channelName: "Sumash Tech",
    channelPlatform: "WHATSAPP",
    assignedTo: "Unassigned",
    assigneeInitials: "U",
    isUnassigned: true,
    status: "Open",
    lastMessage:
      "For any further information or urgent support, please contact our customer care hotline number.",
    updated: "10m ago",
  },
]);
</script>

