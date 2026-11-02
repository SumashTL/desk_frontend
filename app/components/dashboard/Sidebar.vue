<template>
  <aside
    :class="[
      'bg-sidebar-bg border-r border-zinc-200/70 min-h-screen flex flex-col justify-between py-6 shrink-0 select-none transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-20 px-3' : 'w-64 px-4',
    ]">
    <div>
      <div
        :class="[
          'flex items-center mb-8',
          isCollapsed ? 'justify-center' : 'justify-between px-2',
        ]">
        <NuxtLink
          v-if="!isCollapsed"
          to="/dashboard"
          class="flex items-center gap-2.5 overflow-hidden">
          <div
            class="w-8 h-8 rounded-lg bg-logo-green flex items-center justify-center text-white font-extrabold text-lg shadow-xs shrink-0">
            D
          </div>
          <span
            class="text-[22px] font-extrabold tracking-tight text-zinc-900 truncate">
            Desk
          </span>
        </NuxtLink>

        <button
          type="button"
          @click="isCollapsed = !isCollapsed"
          :class="[
            'flex items-center justify-center transition-colors cursor-pointer',
            isCollapsed
              ? 'w-11 h-11 rounded-2xl bg-subtle-bg border border-zinc-200/80 text-zinc-800 hover:bg-active-nav-bg hover:text-primary-green'
              : 'p-1.5 rounded-lg text-zinc-600 hover:bg-subtle-bg hover:text-zinc-900',
          ]"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <LayoutGrid class="w-5 h-5" />
        </button>
      </div>

      <nav class="space-y-1.5">
        <NuxtLink
          v-for="item in visibleMenuItems"
          :key="item.name"
          :to="item.to"
          :class="[
            'group relative flex items-center transition-colors duration-150',
            isCollapsed
              ? 'w-11 h-11 rounded-2xl justify-center mx-auto'
              : 'justify-between px-3.5 py-2.5 rounded-xl text-sm',
            isActive(item.to)
              ? 'bg-active-nav-bg text-primary-green font-semibold'
              : 'text-zinc-800 font-medium hover:bg-subtle-bg',
          ]">
          <div :class="['flex items-center', isCollapsed ? '' : 'gap-3']">
            <component
              :is="item.icon"
              :class="[
                'w-[18px] h-[18px] shrink-0 transition-colors',
                isActive(item.to) ? 'text-primary-green' : 'text-zinc-700',
              ]" />
            <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
          </div>

          <span
            v-if="item.badge && !isCollapsed"
            class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-badge-bg text-zinc-900">
            {{ item.badge }}
          </span>

          <span
            v-if="item.badge && isCollapsed"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary-green text-white flex items-center justify-center">
            {{ item.badge }}
          </span>

          <span
            v-if="isCollapsed"
            class="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
            {{ item.name }}
          </span>
        </NuxtLink>
      </nav>
    </div>

    <div class="pt-6 border-t border-zinc-100">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            :class="[
              'w-full flex items-center rounded-2xl transition-colors cursor-pointer group outline-none data-[state=open]:bg-active-nav-bg hover:bg-subtle-bg',
              isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2',
            ]">
            <div :class="['flex items-center min-w-0', isCollapsed ? '' : 'gap-3']">
              <div class="relative shrink-0">
                <img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                  :class="[
                    'object-cover transition-all',
                    isCollapsed ? 'w-11 h-11 rounded-2xl' : 'w-10 h-10 rounded-full',
                  ]" />
                <div
                  v-else
                  :class="[
                    'bg-avatar-bg flex items-center justify-center text-dark-green font-bold text-sm transition-all',
                    isCollapsed ? 'w-11 h-11 rounded-2xl' : 'w-10 h-10 rounded-full',
                  ]">
                  {{ initials }}
                </div>
                <span
                  class="w-3 h-3 rounded-full bg-primary-green border-2 border-white absolute -bottom-0.5 -right-0.5"></span>
              </div>

              <div v-if="!isCollapsed" class="min-w-0 text-left">
                <p class="text-sm font-bold text-zinc-900 truncate leading-tight">
                  {{ user?.name }}
                </p>
                <p class="text-xs text-zinc-500 truncate mt-0.5">
                  {{ user?.email }}
                </p>
              </div>
            </div>

            <ChevronDown
              v-if="!isCollapsed"
              class="w-4 h-4 text-zinc-500 group-hover:text-zinc-800 transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          :side-offset="10"
          class="w-56 rounded-2xl border border-zinc-200/80 bg-card p-2 shadow-xl shadow-zinc-200/60">
          <div class="px-3 pt-1.5 pb-2">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-active-nav-bg text-primary-green text-[10px] font-extrabold tracking-widest uppercase">
              {{ user?.role }}
            </span>
          </div>

          <DropdownMenuItem as-child>
            <NuxtLink
              to="/dashboard/profile"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-800 transition-colors w-full cursor-pointer">
              <User class="w-4 h-4 text-zinc-600" />
              <span>Profile</span>
            </NuxtLink>
          </DropdownMenuItem>

          <DropdownMenuItem as-child>
            <NuxtLink
              to="/dashboard/notifications"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-800 transition-colors w-full cursor-pointer">
              <Bell class="w-4 h-4 text-zinc-600" />
              <span>Notification settings</span>
            </NuxtLink>
          </DropdownMenuItem>

          <DropdownMenuSeparator class="my-1.5 bg-zinc-100" />

          <DropdownMenuItem
            :disabled="signingOut"
            @select="handleSignOut"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
            <Loader2 v-if="signingOut" class="w-4 h-4 animate-spin" />
            <LogOut v-else class="w-4 h-4 text-red-500" />
            <span>{{ signingOut ? 'Signing out...' : 'Sign out' }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </aside>
</template>

<script setup>
import {
  Bell,
  ChevronDown,
  Contact,
  LayoutGrid,
  Loader2,
  LogOut,
  Megaphone,
  MessageSquareText,
  Puzzle,
  Radio,
  SlidersHorizontal,
  User,
  Users,
} from "@lucide/vue";
import { computed, ref } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const route = useRoute();
const isCollapsed = ref(false);

// GET /api/auth/me/ থেকে আসা ইউজার (nuxt-auth নিজে আনে)
const { data: user } = useAuth();
const { logout, loading: signingOut } = useLogout();

const MANAGE = ["admin", "manager"];

// roles না থাকলে সবাই দেখবে। এটা শুধু মেনু লুকানো; আসল নিষেধ Django সার্ভারে।
const menuItems = [
  { name: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { name: "Inbox", to: "/dashboard/inbox", icon: MessageSquareText, badge: 12 },
  { name: "Contacts", to: "/dashboard/contacts", icon: Contact },
  { name: "Members", to: "/dashboard/members", icon: Users, roles: MANAGE },
  { name: "Broadcast", to: "/dashboard/broadcast", icon: Megaphone, roles: MANAGE },
  { name: "Channels", to: "/dashboard/channels", icon: Radio, roles: ["admin"] },
  { name: "Connectors", to: "/dashboard/connectors", icon: Puzzle, roles: ["admin"] },
  { name: "Settings", to: "/dashboard/settings", icon: SlidersHorizontal, roles: MANAGE },
];

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => !item.roles || item.roles.includes(user.value?.role)),
);

const initials = computed(() => {
  const name = user.value?.name?.trim() || "";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
});

const isActive = (path) => {
  if (path === "/dashboard") {
    return route.path === "/dashboard";
  }
  return route.path.startsWith(path);
};

const handleSignOut = () => logout();
</script>