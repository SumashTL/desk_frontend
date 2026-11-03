<template>
  <div class="card p-5 sm:p-6 md:p-7 space-y-5">
    <!-- Header: Title, Subtitle & Summary Pill -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div>
        <h2
          class="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight"
        >
          Live Channel Status
        </h2>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Realtime connection health and message volume
        </p>
      </div>

      <!-- Summary Pill Badge (Brand Green Theme) -->
      <div class="self-start sm:self-auto">
        <span
          class="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-active-nav-bg text-primary-green border border-light-green-border/35 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60 shadow-2xs"
        >
          {{ totalMessagesFormatted }} messages in {{ periodLabel }}
        </span>
      </div>
    </div>

    <!-- Channels Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-light-green-border/50 px-4 py-3.5 flex items-center justify-between gap-4 shadow-2xs transition-all"
      >
        <!-- Left: Icon + Name/Type + Health Status -->
        <div class="flex items-center gap-3.5 min-w-0">
          <!-- WhatsApp Circle Badge -->
          <div
            class="w-10 h-10 rounded-full bg-[#25D366]/15 dark:bg-[#25D366]/20 flex items-center justify-center shrink-0"
          >
            <WhatsAppIcon class="w-7 h-7" />
          </div>

          <div class="min-w-0">
            <!-- Channel Name & Platform Pill -->
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate"
              >
                {{ channel.name }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700"
              >
                {{ channel.platform }}
              </span>
            </div>

            <!-- Connection Health -->
            <div class="flex items-center gap-1.5 mt-1">
              <span
                :class="[
                  'w-2 h-2 rounded-full shrink-0',
                  channel.healthy ? 'bg-emerald-500' : 'bg-amber-500',
                ]"
              />
              <span
                class="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate"
              >
                {{ channel.statusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Message Volume Count Pill -->
        <span
          class="px-3 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-xs sm:text-[13px] font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0"
        >
          {{ formatNumber(channel.messages) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import WhatsAppIcon from "~/components/icons/WhatsAppIcon.vue";

const periodLabel = ref("Last 7 days");

const channels = ref([
  {
    id: "sumash-tech",
    name: "Sumash Tech",
    platform: "WHATSAPP",
    healthy: true,
    statusText: "1/1 accounts connected and healthy.",
    messages: 18581,
  },
]);

const formatNumber = (val) => Number(val || 0).toLocaleString();

const totalMessagesFormatted = computed(() => {
  const sum = channels.value.reduce((acc, c) => acc + (c.messages || 0), 0);
  return formatNumber(sum);
});
</script>

