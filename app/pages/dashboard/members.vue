<template>
  <div class="space-y-6">
    <MembersHeader />
    <MembersStatCards />
    <MembersTable />
  </div>
</template>

<script setup>
import MembersHeader from '~/components/members/MembersHeader.vue'
import MembersStatCards from '~/components/members/MembersStatCards.vue'
import MembersTable from '~/components/members/MembersTable.vue'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Members — Desk',
})
</script>
