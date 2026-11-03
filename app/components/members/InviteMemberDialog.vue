<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="sm:max-w-[760px] p-0 gap-0 overflow-visible rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-card-surface shadow-2xl"
    >
      <!-- Dialog Header -->
      <DialogHeader
        class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-row items-center gap-3.5 space-y-0 text-left"
      >
        <div
          class="w-10 h-10 rounded-full bg-active-nav-bg dark:bg-emerald-950/60 border border-light-green-border/40 dark:border-emerald-800/50 flex items-center justify-center text-primary-green shrink-0"
        >
          <UserPlus class="w-5 h-5 stroke-[2.2]" />
        </div>
        <div class="flex-1 min-w-0 pr-6">
          <DialogTitle
            class="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug"
          >
            Invite team members
          </DialogTitle>
          <DialogDescription
            class="text-xs sm:text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5"
          >
            Send an email invite - they'll get access right after accepting.
          </DialogDescription>
        </div>
      </DialogHeader>

      <!-- Dialog Body -->
      <form @submit.prevent="handleSubmit" class="flex flex-col">
        <div class="px-6 py-4 space-y-4">
          <!-- Row 1: Email addresses (Tag / Multi-email input) -->
          <div>
            <label
              for="invite-emails-input"
              class="flex items-center gap-2 mb-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <Mail class="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Email addresses</span>
            </label>

            <div
              @click="focusEmailInput"
              class="min-h-[46px] w-full rounded-xl border border-zinc-200/90 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900 px-3.5 py-2 flex flex-wrap items-center gap-1.5 cursor-text transition-colors duration-150 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-primary-green focus-within:ring-2 focus-within:ring-primary-green/15"
            >
              <!-- Added Email Pills -->
              <span
                v-for="(email, index) in form.emails"
                :key="`${email}-${index}`"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-active-nav-bg dark:bg-emerald-950/60 border border-light-green-border/40 text-primary-green text-xs font-bold"
              >
                <span>{{ email }}</span>
                <button
                  type="button"
                  @click.stop="removeEmail(index)"
                  class="hover:opacity-75 cursor-pointer"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>

              <!-- Input for typing new emails -->
              <input
                id="invite-emails-input"
                ref="emailInputRef"
                v-model="emailInput"
                type="text"
                :placeholder="
                  form.emails.length === 0
                    ? 'name@company.com, another@company.com'
                    : 'Add another email...'
                "
                @keydown="handleEmailKeydown"
                @blur="commitPendingEmail"
                class="flex-1 min-w-[220px] bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none py-0.5"
              />
            </div>

            <p class="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Press Enter or comma to add multiple addresses.
            </p>
          </div>

          <!-- Row 2: Role Selection -->
          <div>
            <label
              class="flex items-center gap-2 mb-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <ShieldCheck
                class="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0"
              />
              <span>Role</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="roleOption in roleOptions"
                :key="roleOption.value"
                type="button"
                @click="form.role = roleOption.value"
                :class="[
                  'relative text-left rounded-2xl px-4 py-3.5 border transition-all cursor-pointer outline-none',
                  form.role === roleOption.value
                    ? 'border-primary-green bg-active-nav-bg/35 dark:bg-emerald-950/30 ring-1 ring-primary-green/40 shadow-2xs'
                    : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700',
                ]"
              >
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    class="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                  >
                    {{ roleOption.label }}
                  </span>
                  <Check
                    v-if="form.role === roleOption.value"
                    class="w-4 h-4 text-primary-green stroke-[2.5] shrink-0"
                  />
                </div>
                <p
                  class="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-snug"
                >
                  {{ roleOption.description }}
                </p>
              </button>
            </div>
          </div>

          <!-- Row 3: Channel Access Selection -->
          <div>
            <label
              class="flex items-center gap-2 mb-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <ShieldCheck
                class="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0"
              />
              <span>Channel access</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="accessOption in channelAccessOptions"
                :key="accessOption.value"
                type="button"
                @click="form.channelAccess = accessOption.value"
                :class="[
                  'text-left rounded-2xl px-3.5 py-3.5 border transition-all cursor-pointer outline-none flex flex-col justify-between',
                  form.channelAccess === accessOption.value
                    ? 'border-primary-green bg-active-nav-bg/35 dark:bg-emerald-950/30 ring-1 ring-primary-green/40 shadow-2xs'
                    : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700',
                ]"
              >
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <component
                      :is="accessOption.icon"
                      :class="[
                        'w-4 h-4 shrink-0',
                        form.channelAccess === accessOption.value
                          ? 'text-primary-green'
                          : 'text-zinc-500 dark:text-zinc-400',
                      ]"
                    />
                    <span
                      class="text-[13px] font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      {{ accessOption.label }}
                    </span>
                  </div>
                  <p
                    class="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-snug"
                  >
                    {{ accessOption.description }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Conditional Row: Channels Selector (Only when "Selected channels" is chosen) -->
          <div v-if="form.channelAccess === 'selected'" class="space-y-1.5">
            <label
              class="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Channels
            </label>

            <!-- Selected channel pills -->
            <div
              v-if="form.selectedChannels.length > 0"
              class="flex flex-wrap gap-1.5 mb-1.5"
            >
              <span
                v-for="channel in selectedChannelObjects"
                :key="channel.id"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-active-nav-bg dark:bg-emerald-950/60 border border-light-green-border/40 text-primary-green text-xs font-bold"
              >
                <span>{{ channel.name }}</span>
                <button
                  type="button"
                  @click="toggleChannel(channel.id)"
                  class="hover:opacity-75 cursor-pointer"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>

            <!-- Searchable Channel Dropdown Input -->
            <div ref="channelDropdownRef" class="relative">
              <div class="relative flex items-center">
                <input
                  v-model="channelSearchQuery"
                  type="text"
                  placeholder="Search channels"
                  @focus="isChannelDropdownOpen = true"
                  :class="`${roundedInputClasses} pr-10`"
                />
                <button
                  type="button"
                  @click="isChannelDropdownOpen = !isChannelDropdownOpen"
                  class="absolute right-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <ChevronDown
                    :class="[
                      'w-4 h-4 transition-transform duration-150',
                      isChannelDropdownOpen ? 'rotate-180' : '',
                    ]"
                  />
                </button>
              </div>

              <!-- Dropdown Menu List (Floating so it doesn't increase modal height) -->
              <div
                v-if="isChannelDropdownOpen"
                class="absolute left-0 right-0 top-full mt-1.5 w-full rounded-xl border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1.5 max-h-40 overflow-y-auto z-30"
              >
                <button
                  v-for="channel in filteredChannels"
                  :key="channel.id"
                  type="button"
                  @click="toggleChannel(channel.id)"
                  class="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="w-2 h-2 rounded-full bg-primary-green shrink-0"
                    ></span>
                    <span
                      class="text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      {{ channel.name }}
                    </span>
                    <span class="text-[11px] text-zinc-400">
                      {{ channel.type }}
                    </span>
                  </div>
                  <Check
                    v-if="form.selectedChannels.includes(channel.id)"
                    class="w-4 h-4 text-primary-green stroke-[2.5]"
                  />
                </button>
                <div
                  v-if="filteredChannels.length === 0"
                  class="px-3.5 py-2.5 text-xs text-zinc-400 text-center"
                >
                  No channels found
                </div>
              </div>
            </div>
          </div>

          <!-- Row 4: Send invite email toggle card -->
          <div
            class="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <span
              class="text-[13px] font-bold text-zinc-900 dark:text-zinc-100"
            >
              Send invite email
            </span>

            <!-- Brand Green Shadcn Switch -->
            <Switch v-model="form.sendInviteEmail" />
          </div>
        </div>

        <!-- Dialog Footer -->
        <div
          class="px-6 py-3.5 rounded-b-2xl border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 flex items-center justify-between gap-4"
        >
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {{ footerSummary }}
          </span>

          <div class="flex items-center gap-3">
            <DialogClose as-child>
              <button
                type="button"
                class="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </DialogClose>

            <button
              type="submit"
              :disabled="!isFormValid"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_-2px_rgba(23,144,13,0.35)] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:opacity-50 disabled:active:scale-100"
            >
              <Mail class="w-4 h-4 stroke-[2.2]" />
              <span>Send invite email</span>
            </button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Ban,
  Check,
  ChevronDown,
  Globe,
  Layers,
  Mail,
  ShieldCheck,
  UserPlus,
  X,
} from "@lucide/vue";
import { onClickOutside } from "@vueuse/core";
import { computed, reactive, ref } from "vue";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:open", "invited"]);

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const roundedInputClasses =
  "w-full rounded-xl border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15";

const emailInputRef = ref(null);
const emailInput = ref("");

const form = reactive({
  emails: [],
  role: "agent",
  channelAccess: "all",
  selectedChannels: [],
  sendInviteEmail: true,
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const addEmailsFromString = (raw) => {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (isValidEmail(part) && !form.emails.includes(part)) {
      form.emails.push(part);
    }
  }
};

const handleEmailKeydown = (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    if (emailInput.value.trim()) {
      addEmailsFromString(emailInput.value);
      emailInput.value = "";
    }
  } else if (
    e.key === "Backspace" &&
    !emailInput.value &&
    form.emails.length > 0
  ) {
    form.emails.pop();
  }
};

const commitPendingEmail = () => {
  if (emailInput.value.trim()) {
    addEmailsFromString(emailInput.value);
    emailInput.value = "";
  }
};

const removeEmail = (index) => {
  form.emails.splice(index, 1);
};

const focusEmailInput = () => {
  emailInputRef.value?.focus();
};

const roleOptions = [
  {
    value: "agent",
    label: "Agent",
    description: "For inbox operators who handle assigned conversations.",
  },
  {
    value: "manager",
    label: "Manager",
    description: "For supervisors who monitor team workflow and coverage.",
  },
];

const channelAccessOptions = [
  {
    value: "all",
    label: "All channels",
    description: "Current and future workspace channels.",
    icon: Globe,
  },
  {
    value: "selected",
    label: "Selected channels",
    description: "Only channels selected below.",
    icon: Layers,
  },
  {
    value: "none",
    label: "No channels",
    description: "No channel access until changed.",
    icon: Ban,
  },
];

const availableChannels = [
  { id: "sumash-tech", name: "Sumash Tech", type: "WhatsApp" },
  { id: "whatsapp-support", name: "WhatsApp Support", type: "WhatsApp" },
  { id: "sales-hotline", name: "Sales Hotline", type: "WhatsApp" },
  { id: "vip-care", name: "VIP Care", type: "WhatsApp" },
];

const channelDropdownRef = ref(null);
const channelSearchQuery = ref("");
const isChannelDropdownOpen = ref(false);

onClickOutside(channelDropdownRef, () => {
  isChannelDropdownOpen.value = false;
});

const filteredChannels = computed(() => {
  const q = channelSearchQuery.value.trim().toLowerCase();
  if (!q) return availableChannels;
  return availableChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q),
  );
});

const selectedChannelObjects = computed(() =>
  availableChannels.filter((c) => form.selectedChannels.includes(c.id)),
);

const toggleChannel = (channelId) => {
  const index = form.selectedChannels.indexOf(channelId);
  if (index === -1) {
    form.selectedChannels.push(channelId);
  } else {
    form.selectedChannels.splice(index, 1);
  }
};

const effectiveRecipientsCount = computed(() => {
  const typedValid = emailInput.value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isValidEmail(s) && !form.emails.includes(s)).length;
  return form.emails.length + typedValid;
});

const footerSummary = computed(() => {
  const rCount = effectiveRecipientsCount.value;
  const rLabel = `${rCount} ${rCount === 1 ? "recipient" : "recipients"}`;

  let accessLabel = "No channel access";
  if (form.channelAccess === "all") {
    accessLabel = "Workspace-wide access";
  } else if (form.channelAccess === "selected") {
    const cCount = form.selectedChannels.length;
    accessLabel = `${cCount} ${cCount === 1 ? "channel" : "channels"}`;
  }

  return `${rLabel} · ${accessLabel}`;
});

const isFormValid = computed(() => {
  if (effectiveRecipientsCount.value === 0) return false;
  if (form.channelAccess === "selected") {
    return form.selectedChannels.length > 0;
  }
  return true;
});

const handleSubmit = () => {
  commitPendingEmail();
  if (!isFormValid.value) return;
  emit("invited", { ...form });
  isOpen.value = false;
};
</script>

