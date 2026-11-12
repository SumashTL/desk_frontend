<template>
  <div class="sd-page"><div class="sd-page-inner max-w-3xl">
    <SdPageHeader title="My profile" subtitle="How your teammates see you, and your sign-in password." />

    <div class="sd-card mb-4 p-5">
      <div class="flex flex-wrap items-center gap-5">
        <SdAvatar :name="me?.name" :src="preview || me?.avatar" :seed="me?.id" size="xl" />
        <div class="flex-1">
          <p class="text-[17px] font-bold">{{ me?.name }}</p>
          <p class="text-[13px] text-[var(--sd-muted)]">{{ me?.email }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5"><SdBadge tone="violet">{{ roleLabel }}</SdBadge><SdBadge :tone="me?.is_available ? 'green' : 'amber'" dot>{{ me?.is_available ? 'Available' : 'Away' }}</SdBadge></div>
        </div>
        <div class="flex flex-wrap gap-2">
          <label class="inline-flex h-8 cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--sd-border)] px-3 text-xs font-semibold hover:bg-[var(--sd-surface-soft)]">
            <Camera class="h-4 w-4" />Change photo<input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="pickAvatar">
          </label>
          <SdButton v-if="me?.avatar" size="sm" variant="danger-soft" @click="removeAvatar">Remove</SdButton>
        </div>
      </div>
      <form class="mt-5 grid gap-4 border-t border-[var(--sd-border)] pt-5 sm:grid-cols-2" @submit.prevent="saveName">
        <SdField label="Display name" :error="perr.display_name" hint="Shown to your team on chats and notes."><input v-model.trim="displayName" class="sd-input" maxlength="100"></SdField>
        <SdField label="Email" hint="Ask an admin to change it."><input :value="me?.email" class="sd-input" disabled></SdField>
        <div class="flex justify-end sm:col-span-2"><SdButton type="submit" variant="primary" :loading="savingName" :disabled="!displayName || displayName === me?.display_name">Save name</SdButton></div>
      </form>
    </div>

    <div class="sd-card mb-4 p-5">
      <SdToggle :model-value="!!me?.is_available" label="Available for new chats" :description="`Auto-assignment gives you new chats only while you are available (up to ${me?.max_open_chats} open).`" @update:model-value="setAvailable" />
    </div>

    <div class="sd-card p-5">
      <h2 class="text-[15px] font-bold">Change password</h2>
      <p class="mb-4 mt-1 text-[12.5px] text-[var(--sd-muted)]">Other devices are signed out; this one stays signed in.</p>
      <form class="grid gap-4 sm:grid-cols-3" @submit.prevent="changePassword">
        <SdField label="Current password" :error="errors.current_password"><AuthPasswordInput v-model="pw.current_password" /></SdField>
        <SdField label="New password" :error="errors.new_password"><AuthPasswordInput v-model="pw.new_password" autocomplete="new-password" /></SdField>
        <SdField label="Confirm new password" :error="errors.confirm_password"><AuthPasswordInput v-model="pw.confirm_password" autocomplete="new-password" /></SdField>
        <div class="flex justify-end sm:col-span-3"><SdButton type="submit" variant="primary" :icon="KeyRound" :loading="savingPw">Update password</SdButton></div>
      </form>
    </div>
  </div></div>
</template>
<script setup lang="ts">
import { Camera, KeyRound } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'My profile' })
const api = useApi()
const { me, roleLabel, refreshMe } = useSession()
const signInWithTokens = useTokenSignIn()
const displayName = ref(me.value?.display_name || me.value?.name || '')
watch(() => me.value?.display_name, v => { if (v) displayName.value = v })
const preview = ref<string | null>(null)
const savingName = ref(false)
const savingPw = ref(false)
const perr = reactive<Record<string, string>>({})
const errors = reactive<Record<string, string>>({})
const pw = reactive({ current_password: '', new_password: '', confirm_password: '' })

async function saveName() {
  savingName.value = true
  Object.keys(perr).forEach(k => delete perr[k])
  try { await api.patch('auth/me/', { display_name: displayName.value }, { silent: true }); await refreshMe(); toast.success('Name updated') } catch (e: any) { Object.assign(perr, e.fields); toast.error(e.message) } finally { savingName.value = false }
}
async function pickAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB.'); return }
  preview.value = URL.createObjectURL(file)
  const body = new FormData()
  body.append('avatar', file)
  try { await api.patch('auth/me/', body); await refreshMe(); toast.success('Photo updated') } catch {} finally { preview.value = null }
}
async function removeAvatar() {
  try { await api.patch('auth/me/', { avatar: null }); await refreshMe(); toast.success('Photo removed') } catch {}
}
async function setAvailable(value: boolean) {
  try { await api.patch('auth/me/availability/', { is_available: value }); await refreshMe() } catch {}
}
async function changePassword() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!pw.current_password) errors.current_password = 'Enter your current password.'
  if (pw.new_password.length < 8) errors.new_password = 'Use at least 8 characters.'
  if (pw.new_password !== pw.confirm_password) errors.confirm_password = 'Passwords do not match.'
  if (Object.keys(errors).length) return
  savingPw.value = true
  try {
    await signInWithTokens(await api.post('auth/me/password/', pw, { silent: true }))
    Object.assign(pw, { current_password: '', new_password: '', confirm_password: '' })
    toast.success('Password changed')
  } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { savingPw.value = false }
}
</script>
