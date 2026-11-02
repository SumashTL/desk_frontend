<template>
  <div class="space-y-6">
    <!-- Top Header Bar matching the design -->
    <DashboardHeader />

    <!-- 6 Key Metrics Stat Cards -->
    <DashboardStatCards />

    <!-- Analytics Charts Section: Conversation Volume & Channel Mix -->
    <DashboardAnalyticsCharts />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Dashboard — Zurvis'
})
</script>
