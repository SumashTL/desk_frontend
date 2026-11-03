<template>
  <div class="space-y-6">
    <DashboardHeader />
    <DashboardStatCards />
    <DashboardAnalyticsCharts />
    <DashboardTeamCommandCenter />
    <DashboardLiveChannelStatus />
    <DashboardRecentConversations />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Dashboard — Desk'
})
</script>
