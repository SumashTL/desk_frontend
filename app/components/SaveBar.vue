<template>
  <div class="mt-5 flex justify-end border-t border-[var(--sd-border)] pt-4"><SdButton variant="primary" :loading="saving" @click="$emit('save')">Save changes</SdButton></div>
</template>
<script setup lang="ts">
defineProps<{ saving?: boolean }>()
defineEmits(['save'])
</script>
