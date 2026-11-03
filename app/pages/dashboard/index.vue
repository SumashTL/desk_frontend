<template>
  <div class="space-y-6">
    <DashboardHeader />
    <DashboardStatCards />
    <DashboardAnalyticsCharts />
    <DashboardTeamCommandCenter />
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
