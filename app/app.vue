<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-right" rich-colors close-button :theme="isDark ? 'dark' : 'light'" />
  <SdConfirmHost />
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
const { isDark } = useTheme()
</script>
