<template>
  <div class="sumash-app flex min-h-screen text-slate-900 transition-colors duration-200">
    <DashboardSidebar />
    <main class="min-w-0 flex-1 overflow-x-hidden"><slot /></main>
  </div>
</template>
<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/Sidebar.vue'
</script>
