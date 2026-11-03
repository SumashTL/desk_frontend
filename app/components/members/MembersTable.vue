<template>
  <div class="card p-0 overflow-hidden">
    <!-- Card Header: Title, Subtitle & Total Members Count -->
    <div class="p-5 sm:px-6 sm:py-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Team performance
        </h3>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
          Showing workspace roster
        </p>
      </div>

      <span class="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">
        {{ members.length }} members
      </span>
    </div>

    <!-- Table Responsive Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-subtle-bg/40 dark:bg-zinc-800/20">
            <th class="py-3 pl-4 sm:pl-6 pr-4 font-bold">Member</th>
            <th class="py-3 px-4 font-bold">Role</th>
            <th class="py-3 px-4 font-bold">Channel Access</th>
            <th class="py-3 px-4 font-bold">Status</th>
            <th class="py-3 pl-4 pr-4 sm:pr-6 text-right font-bold">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          <MemberTableRow
            v-for="member in members"
            :key="member.id"
            :member="member"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MemberTableRow from './MemberTableRow.vue'

// Demo data matching the design roster
const members = ref([
  {
    id: 1,
    name: 'Sadikul Islam Sadi',
    email: 'sadikulsadi.sumashtech@gmail.com',
    role: 'Agent',
    channel: 'All channels',
    channelScope: 'workspace-wide',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-orange-100 dark:bg-orange-950/40 border-orange-200/80',
    avatarText: '😊',
    isViewOnly: false,
  },
  {
    id: 2,
    name: 'Asifur Rahman Akash',
    email: 'asifst.ltd@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200/80',
    avatarText: '😃',
    isViewOnly: false,
  },
  {
    id: 3,
    name: 'Golam Farhan Samik',
    email: 'sgolamfarhan@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-purple-100 dark:bg-purple-950/40 border-purple-200/80',
    avatarText: '🙂',
    isViewOnly: false,
  },
  {
    id: 4,
    name: 'Musaddiqur Rahman Asik',
    email: 'musaddiqurrahmanasik.sumashtech@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-blue-100 dark:bg-blue-950/40 border-blue-200/80',
    avatarText: '😄',
    isViewOnly: false,
  },
  {
    id: 5,
    name: 'Ahsan Hossain Alvy',
    email: 'ahsanalvy315@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-rose-100 dark:bg-rose-950/40 border-rose-200/80',
    avatarText: '😊',
    isViewOnly: false,
  },
  {
    id: 6,
    name: 'Subrina Afrin Onu',
    email: 'subrinasumash@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-amber-100 dark:bg-amber-950/40 border-amber-200/80',
    avatarText: '🤗',
    isViewOnly: false,
  },
  {
    id: 7,
    name: 'Ubayda Alvii',
    email: 'ubaydaalvii01@gmail.com',
    role: 'Manager',
    channel: 'Sumash Tech',
    channelScope: '',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-violet-100 dark:bg-violet-950/40 border-violet-200/80',
    avatarText: '😌',
    isViewOnly: false,
  },
  {
    id: 8,
    name: 'Sumash Tech Limited',
    email: 'contact@sumashtech.com',
    role: 'Workspace admin',
    channel: 'All channels',
    channelScope: 'workspace-wide',
    status: 'Active',
    isActive: true,
    avatarBg: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200/80',
    avatarText: '🏢',
    isViewOnly: true,
  },
])
</script>

