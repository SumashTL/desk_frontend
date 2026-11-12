<template>
  <AuthCard eyebrow="Welcome back" title="Sign in to SumashDesk" subtitle="Use the email and password your admin gave you.">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <SdField label="Email" :error="errors.email">
        <input v-model.trim="form.email" type="email" autocomplete="username" placeholder="you@company.com" :class="['sd-input', errors.email && 'is-invalid']" autofocus>
      </SdField>
      <SdField label="Password" :error="errors.password">
        <AuthPasswordInput v-model="form.password" :invalid="!!errors.password" />
      </SdField>
      <div class="flex justify-end"><NuxtLink to="/forgot-password" class="sd-link text-[12.5px]">Forgot password?</NuxtLink></div>
      <SdButton type="submit" variant="primary" block :loading="loading" class="!h-11">Sign in</SdButton>
    </form>
  </AuthCard>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth', auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/dashboard/inbox' } })
useHead({ title: 'Sign in' })

const { signIn } = useAuth()
const route = useRoute()
const loading = ref(false)
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function target() {
  const t = route.query.redirect
  return typeof t === 'string' && t.startsWith('/') && !t.startsWith('//') && t !== '/login' ? t : '/dashboard/inbox'
}

async function submit() {
  errors.email = !form.email ? 'Enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : ''
  errors.password = form.password ? '' : 'Enter your password.'
  if (errors.email || errors.password || loading.value) return
  loading.value = true
  try {
    await signIn({ email: form.email.toLowerCase(), password: form.password }, { redirect: false })
    await navigateTo(target(), { replace: true })
  } catch (err: any) {
    const status = err?.statusCode ?? err?.response?.status
    const { message, fields } = errorMessage(err?.data ?? err?.response?._data)
    form.password = ''
    if (!status) toast.error('Cannot reach the server. Check your connection.')
    else if (status === 429) toast.error(message || 'Too many attempts. Please wait a minute.')
    else if (status === 400 && (fields.email || fields.password)) { errors.email = fields.email || ''; errors.password = fields.password || '' }
    else { errors.password = 'Incorrect email or password.'; toast.error(message && status !== 401 ? message : 'Incorrect email or password.') }
  } finally {
    loading.value = false
  }
}
</script>
