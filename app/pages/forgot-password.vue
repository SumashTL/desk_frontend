<template>
  <div class="w-full max-w-[420px] mx-auto bg-white rounded-[28px] p-8 sm:p-10 border border-[#EBF2EA] shadow-[0_14px_45px_-12px_rgba(23,144,13,0.045),0_4px_18px_-4px_rgba(0,0,0,0.025)]">
    <!-- State 1: Forgot Password Form -->
    <div v-if="!submitted">
      <!-- Key Icon -->
      <div class="w-12 h-12 rounded-2xl bg-active-nav-bg border border-light-green-border/30 flex items-center justify-center text-primary-green mb-5 shadow-sm">
        <KeyRound class="w-6 h-6 stroke-[2]" />
      </div>

      <!-- Heading -->
      <h1 class="text-2xl sm:text-[30px] font-extrabold tracking-tight text-zinc-900 leading-tight mb-2">
        Forgot your <span class="text-primary-green">password?</span>
      </h1>

      <!-- Subheading -->
      <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-7">
        Enter your email and we will send you a reset link if the account exists.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleResetRequest" novalidate class="space-y-4">
        <InputForm
          v-model="email"
          label="Email"
          placeholder="you@sumashtech.com"
          type="email"
          :left-icon="Mail"
          :error="error"
          :disabled="loading"
          custom-input-classes="w-full rounded-xl border border-[#E4EFE3] bg-[#F6FAF6] hover:border-light-green-border/50 focus:bg-white pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15"
          @input="error = ''"
          required
        />

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 shadow-[0_6px_18px_-4px_rgba(23,144,13,0.3)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>{{ loading ? 'Sending reset link...' : 'Send reset link' }}</span>
          <ArrowRight v-if="!loading" class="w-4 h-4" />
        </button>

        <div class="flex justify-center pt-2">
          <NuxtLink
            to="/login"
            class="text-xs font-bold text-primary-green hover:text-dark-green transition-colors"
          >
            Back to login
          </NuxtLink>
        </div>
      </form>
    </div>

    <!-- State 2: Check Your Email (Shows after email submission on the same URL) -->
    <div v-else>
      <!-- Envelope Icon with Checkmark -->
      <div class="w-12 h-12 rounded-2xl bg-active-nav-bg border border-light-green-border/30 flex items-center justify-center text-primary-green mb-5 shadow-sm">
        <MailCheck class="w-6 h-6 stroke-[2]" />
      </div>

      <!-- Password Reset Eyebrow Badge -->
      <div class="inline-flex items-center px-3 py-1 rounded-full bg-active-nav-bg/80 border border-light-green-border/20 text-primary-green text-[10px] font-extrabold tracking-widest uppercase mb-4">
        PASSWORD RESET
      </div>

      <!-- Heading -->
      <h1 class="text-2xl sm:text-[30px] font-extrabold tracking-tight text-zinc-900 leading-tight mb-2">
        Check your <span class="text-primary-green">email</span>
      </h1>

      <!-- Description -->
      <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-7">
        If an account matches <span class="font-bold text-zinc-900">{{ email }}</span>, we sent a password reset link there. Open that email to continue setting a new password.
      </p>

      <div class="space-y-4">
        <NuxtLink
          to="/login"
          class="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 shadow-[0_6px_18px_-4px_rgba(23,144,13,0.3)] transition-all duration-200 cursor-pointer text-center"
        >
          <span>Back to login</span>
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>

        <div class="flex justify-center pt-1">
          <button
            type="button"
            @click="submitted = false"
            class="text-xs font-bold text-primary-green hover:text-dark-green transition-colors cursor-pointer"
          >
            Didn't receive email? Try again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, KeyRound, Loader2, Mail, MailCheck } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import InputForm from '~/components/form/InputForm.vue'

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  },
})

useHead({
  title: 'Forgot Password - Desk',
})

const email = ref('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = () => {
  error.value = ''
  const val = email.value.trim()
  if (!val) {
    error.value = 'Email is required'
    return false
  }
  if (!EMAIL_RE.test(val)) {
    error.value = 'Enter a valid email address'
    return false
  }
  return true
}

const handleResetRequest = async () => {
  if (loading.value) return
  if (!validate()) return

  loading.value = true
  error.value = ''


  // Transitioning to the "Check your email" view:
  setTimeout(() => {
    loading.value = false
    submitted.value = true
    toast.success('If an account exists with this email, a reset link has been sent.')
  }, 400)
}
</script>
