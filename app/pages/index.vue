<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">This is demo index page</h1>
    <div class="flex flex-wrap gap-4">
      <Button>Default Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="destructive">Destructive Button</Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
</script>
