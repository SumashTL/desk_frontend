<template>
  <div class="flex min-h-screen bg-dashboard-bg text-zinc-900">
    <DashboardSidebar />

    <main class="flex-1 min-w-0 p-6 md:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import DashboardSidebar from '~/components/dashboard/Sidebar.vue'
</script>

