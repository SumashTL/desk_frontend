<template>
  <SdModal :open="!!current" :title="current?.title || ''" :description="current?.message" size="sm" @update:open="v => !v && answer(false)">
    <template #footer>
      <SdButton @click="answer(false)">{{ current?.cancelText }}</SdButton>
      <SdButton :variant="current?.danger ? 'danger' : 'primary'" @click="answer(true)">{{ current?.confirmText }}</SdButton>
    </template>
  </SdModal>
</template>
<script setup lang="ts">
const { current, answer } = useConfirm()
</script>
