<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toaster position="top-right" richColors closeButton />
    </ClientOnly>
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
