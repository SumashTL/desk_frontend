<template>
  <div
    class="min-h-screen flex p-4 sm:p-5 gap-6 relative overflow-hidden select-none bg-[#F5F7FA]"
    style="background-image: radial-gradient(circle at 82% 14%, #FDF8EE 0%, transparent 38%);"
  >
    <div
      class="hidden lg:flex lg:w-[48%] xl:w-[50%] rounded-[32px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.055),0_2px_10px_-3px_rgba(0,0,0,0.025)] items-center justify-center relative overflow-hidden p-10"
      style="background: radial-gradient(circle at 12% 15%, #FEF7EA 0%, transparent 52%), radial-gradient(circle at 88% 20%, #EAF7E8 0%, transparent 54%), radial-gradient(circle at 80% 88%, #EBF8E9 0%, transparent 54%), linear-gradient(135deg, #F9FCF9 0%, #EFF8EE 100%);"
    >
      <div class="relative z-10 flex flex-col items-center justify-center">
        <img
          src="/login-img.webp"
          alt="Desk"
          class="w-full max-w-[330px] xl:max-w-[370px] object-contain pointer-events-none select-none drop-shadow-[0_28px_26px_rgba(0,0,0,0.12)]"
        />
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between py-2 px-2 sm:px-6 relative z-10">
      <div></div>

      <div class="w-full max-w-[420px] mx-auto bg-white rounded-[28px] p-8 sm:p-10 border border-[#EBF2EA] shadow-[0_14px_45px_-12px_rgba(23,144,13,0.045),0_4px_18px_-4px_rgba(0,0,0,0.025)]">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-active-nav-bg/80 border border-light-green-border/20 text-primary-green text-[10px] font-extrabold tracking-widest uppercase mb-4">
          WELCOME BACK
        </div>

        <h1 class="text-2xl sm:text-[30px] font-extrabold tracking-tight text-zinc-900 leading-tight mb-2">
          Sign in to <span class="text-primary-green">Desk</span>
        </h1>

        <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-7">
          Pick up right where you left off - every conversation, every channel.
        </p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <InputForm
            v-model="form.email"
            label="Email"
            placeholder="ashikurrahmanasif02@gmail.com"
            type="email"
            :left-icon="Mail"
            :error="errors.email"
            :disabled="loading"
            custom-input-classes="w-full rounded-xl border border-[#E4EFE3] bg-[#F6FAF6] hover:border-light-green-border/50 focus:bg-white pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15"
            @input="errors.email = ''"
            required
          />

          <PasswordInputForm
            v-model="form.password"
            label="Password"
            placeholder="••••••••••••"
            :left-icon="Lock"
            :error="errors.password"
            :disabled="loading"
            custom-input-classes="w-full rounded-xl border border-[#E4EFE3] bg-[#F6FAF6] hover:border-light-green-border/50 focus:bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15"
            @input="errors.password = ''"
            required
          />

          <div class="flex justify-end pt-0.5">
            <NuxtLink
              to="/forgot-password"
              class="text-xs font-bold text-primary-green hover:text-dark-green transition-colors"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 shadow-[0_6px_18px_-4px_rgba(23,144,13,0.3)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
            <ArrowRight v-if="!loading" class="w-4 h-4" />
          </button>
        </form>
      </div>

      <footer class="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 pt-4 gap-2">
        <div>
          Copyright © 2026, All Rights Reserved By <span class="font-bold text-primary-green">Desk</span>
        </div>
        <NuxtLink to="/privacy-policy" class="hover:text-zinc-600 transition-colors">
          Privacy Policy
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Loader2, Lock, Mail } from '@lucide/vue'
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import InputForm from '~/components/form/InputForm.vue'
import PasswordInputForm from '~/components/form/PasswordInputForm.vue'

useHead({
  title: 'Sign in to Desk'
})

const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validate = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  console.log('Login button clicked. Form data:', {
    email: form.email,
    password: form.password
  })

  if (!validate()) {
    toast.error('Please fix the errors before submitting')
    return
  }

  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Signed in successfully! Welcome back.')
    // await navigateTo('/dashboard')
  } catch (err) {
    toast.error('Login failed. Please check your credentials and try again.')
  } finally {
    loading.value = false
  }
}
</script>
