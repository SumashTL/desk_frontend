<template>
  <AuthCard v-if="state === 'checking'" title="Checking your link…"><div class="sd-skeleton h-10 w-full" /></AuthCard>
  <AuthCard v-else-if="state === 'invalid'" eyebrow="Link expired" title="This reset link can't be used" subtitle="It was already used or has expired. Request a new one — it only takes a moment.">
    <SdButton to="/forgot-password" variant="primary" block class="!h-11">Request a new link</SdButton>
  </AuthCard>
  <AuthCard v-else eyebrow="New password" title="Set a new password" :subtitle="`For ${email}. You'll be signed in right after.`">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <SdField label="New password" :error="errors.new_password" hint="At least 8 characters; avoid common words.">
        <AuthPasswordInput v-model="form.new_password" autocomplete="new-password" :invalid="!!errors.new_password" />
      </SdField>
      <SdField label="Confirm password" :error="errors.confirm_password">
        <AuthPasswordInput v-model="form.confirm_password" autocomplete="new-password" :invalid="!!errors.confirm_password" />
      </SdField>
      <SdButton type="submit" variant="primary" block :loading="loading" class="!h-11">Save and sign in</SdButton>
    </form>
  </AuthCard>
</template>
<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Reset password' })
const route = useRoute()
const api = useApi()
const signInWithTokens = useTokenSignIn()
const uid = String(route.query.uid || '')
const token = String(route.query.token || '')
const state = ref<'checking' | 'invalid' | 'ready'>('checking')
const email = ref('')
const loading = ref(false)
const form = reactive({ new_password: '', confirm_password: '' })
const errors = reactive<Record<string, string>>({})

onMounted(async () => {
  if (!uid || !token) { state.value = 'invalid'; return }
  try {
    email.value = (await api.post('auth/password-reset/verify/', { uid, token }, { silent: true })).email
    state.value = 'ready'
  } catch { state.value = 'invalid' }
})

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (form.new_password.length < 8) errors.new_password = 'Use at least 8 characters.'
  if (form.new_password !== form.confirm_password) errors.confirm_password = 'Passwords do not match.'
  if (Object.keys(errors).length || loading.value) return
  loading.value = true
  try {
    const tokens = await api.post('auth/password-reset/confirm/', { uid, token, ...form }, { silent: true })
    await signInWithTokens(tokens)
    toast.success('Password changed. Welcome back!')
    await navigateTo('/dashboard/inbox', { replace: true })
  } catch (e: any) {
    Object.assign(errors, e.fields)
    if (e.fields?.token) state.value = 'invalid'
    else if (!Object.keys(e.fields || {}).length) toast.error(e.message)
  } finally { loading.value = false }
}
</script>
