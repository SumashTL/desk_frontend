<template>
  <AuthCard v-if="!sent" eyebrow="Password help" title="Forgot your password?" subtitle="Enter your work email and we'll send you a link to set a new one.">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <SdField label="Email" :error="error">
        <input v-model.trim="email" type="email" autocomplete="username" placeholder="you@company.com" :class="['sd-input', error && 'is-invalid']" autofocus>
      </SdField>
      <SdButton type="submit" variant="primary" block :loading="loading" class="!h-11">Send reset link</SdButton>
    </form>
    <template #footer><NuxtLink to="/login" class="sd-link">Back to sign in</NuxtLink></template>
  </AuthCard>
  <AuthCard v-else eyebrow="Check your inbox" title="Reset link sent" :subtitle="message">
    <SdButton to="/login" variant="primary" block class="!h-11">Back to sign in</SdButton>
    <button class="mt-3 w-full text-center text-[12.5px] text-[var(--sd-muted)] hover:text-[var(--sd-text)]" @click="sent = false">Use another email</button>
  </AuthCard>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/dashboard/inbox' } })
useHead({ title: 'Forgot password' })
const api = useApi()
const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)
const message = ref('')
async function submit() {
  error.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter a valid email address.'
  if (error.value || loading.value) return
  loading.value = true
  try {
    const res = await api.post('auth/password-reset/', { email: email.value.toLowerCase() }, { silent: true })
    message.value = res.detail
    sent.value = true
  } catch (e: any) {
    error.value = e.fields?.email || e.message
  } finally { loading.value = false }
}
</script>
