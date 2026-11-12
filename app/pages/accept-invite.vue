<template>
  <AuthCard v-if="state === 'checking'" title="Opening your invitation…"><div class="sd-skeleton h-10 w-full" /></AuthCard>
  <AuthCard v-else-if="state === 'invalid'" eyebrow="Invitation" title="This invitation can't be used" subtitle="It has expired, was revoked or was already accepted. Ask your admin to send a new one.">
    <SdButton to="/login" variant="primary" block class="!h-11">Go to sign in</SdButton>
  </AuthCard>
  <AuthCard v-else eyebrow="You're invited" :title="`Join ${appName}`" :subtitle="`${invite.invited_by || 'Your team'} invited ${invite.email} as ${ROLE_LABEL[invite.role] || invite.role}.`">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <div class="flex items-center gap-4">
        <SdAvatar :name="form.display_name || invite.email" :src="preview" size="lg" />
        <div>
          <label class="sd-btn inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-[var(--sd-border)] px-3 text-xs font-semibold hover:bg-[var(--sd-surface-soft)]">
            <Camera class="h-3.5 w-3.5" />{{ avatar ? 'Change photo' : 'Add photo' }}
            <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="pick">
          </label>
          <p class="mt-1 text-[11.5px] text-[var(--sd-faint)]">Optional · JPG, PNG or WebP</p>
          <p v-if="errors.avatar" class="sd-error">{{ errors.avatar }}</p>
        </div>
      </div>
      <SdField label="Your name" :error="errors.display_name" hint="Customers never see this; your team does.">
        <input v-model.trim="form.display_name" class="sd-input" autocomplete="name" placeholder="e.g. Nusrat Jahan">
      </SdField>
      <SdField label="Password" :error="errors.password" hint="At least 8 characters.">
        <AuthPasswordInput v-model="form.password" autocomplete="new-password" :invalid="!!errors.password" />
      </SdField>
      <SdField label="Confirm password" :error="errors.confirm_password">
        <AuthPasswordInput v-model="form.confirm_password" autocomplete="new-password" :invalid="!!errors.confirm_password" />
      </SdField>
      <SdButton type="submit" variant="primary" block :loading="loading" class="!h-11">Create my account</SdButton>
    </form>
  </AuthCard>
</template>
<script setup lang="ts">
import { Camera } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Accept invitation' })
const appName = useRuntimeConfig().public.appName
const route = useRoute()
const api = useApi()
const signInWithTokens = useTokenSignIn()
const token = String(route.query.token || '')
const state = ref<'checking' | 'invalid' | 'ready'>('checking')
const invite = ref<any>({})
const loading = ref(false)
const avatar = ref<File | null>(null)
const preview = ref<string | null>(null)
const form = reactive({ display_name: '', password: '', confirm_password: '' })
const errors = reactive<Record<string, string>>({})

onMounted(async () => {
  if (!token) { state.value = 'invalid'; return }
  try {
    invite.value = await api.post('invitations/verify/', { token }, { silent: true })
    form.display_name = invite.value.display_name || ''
    state.value = 'ready'
  } catch { state.value = 'invalid' }
})

function pick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { errors.avatar = 'Photo must be under 5 MB.'; return }
  delete errors.avatar
  avatar.value = file
  preview.value = URL.createObjectURL(file)
}

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.display_name) errors.display_name = 'Enter your name.'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
  if (form.password !== form.confirm_password) errors.confirm_password = 'Passwords do not match.'
  if (Object.keys(errors).length || loading.value) return
  loading.value = true
  try {
    const body = new FormData()
    body.append('token', token)
    Object.entries(form).forEach(([k, v]) => body.append(k, v))
    if (avatar.value) body.append('avatar', avatar.value)
    await signInWithTokens(await api.post('invitations/accept/', body, { silent: true }))
    toast.success('Welcome to the team!')
    await navigateTo('/dashboard/inbox', { replace: true })
  } catch (e: any) {
    Object.assign(errors, e.fields)
    if (e.fields?.token) state.value = 'invalid'
    else if (!Object.keys(e.fields || {}).length) toast.error(e.message)
  } finally { loading.value = false }
}
</script>
