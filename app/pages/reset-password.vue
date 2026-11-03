<template>
  <div
    class="w-full max-w-[420px] mx-auto bg-white rounded-[28px] p-8 sm:p-10 border border-[#EBF2EA] shadow-[0_14px_45px_-12px_rgba(23,144,13,0.045),0_4px_18px_-4px_rgba(0,0,0,0.025)]">
    <!-- State 1: Reset Password Form -->
    <div v-if="!submitted">
      <!-- Key Icon -->
      <div
        class="w-12 h-12 rounded-2xl bg-active-nav-bg border border-light-green-border/30 flex items-center justify-center text-primary-green mb-5 shadow-sm">
        <KeyRound class="w-6 h-6 stroke-[2]" />
      </div>

      <!-- Heading -->
      <h1
        class="text-2xl sm:text-[30px] font-extrabold tracking-tight text-zinc-900 leading-tight mb-2">
        Create a new <span class="text-primary-green">password</span>
      </h1>

      <!-- Subheading -->
      <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-7">
        Choose a new password for your account. This reset link works only while
        it is still valid.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleResetPassword" novalidate class="space-y-4">
        <!-- New Password Field -->
        <PasswordInputForm
          v-model="form.newPassword"
          placeholder="New Password"
          helper="Use at least 8 characters. This matches the backend validation rules."
          :error="errors.newPassword"
          :disabled="loading"
          custom-input-classes="w-full rounded-xl border border-[#E4EFE3] bg-[#F6FAF6] hover:border-light-green-border/50 focus:bg-white px-4 pr-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15"
          @input="errors.newPassword = ''"
          required />

        <!-- Confirm New Password Field -->
        <PasswordInputForm
          v-model="form.confirmPassword"
          placeholder="Confirm New Password"
          :error="errors.confirmPassword"
          :disabled="loading"
          custom-input-classes="w-full rounded-xl border border-[#E4EFE3] bg-[#F6FAF6] hover:border-light-green-border/50 focus:bg-white px-4 pr-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors duration-150 focus:border-primary-green focus:ring-2 focus:ring-primary-green/15"
          @input="errors.confirmPassword = ''"
          required />

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 shadow-[0_6px_18px_-4px_rgba(23,144,13,0.3)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>{{
            loading ? "Updating password..." : "Update password"
          }}</span>
          <ArrowRight v-if="!loading" class="w-4 h-4" />
        </button>

        <!-- Bottom Links -->
        <div
          class="flex items-center justify-between text-xs pt-4 text-zinc-500">
          <div>
            Need a new reset link?
            <NuxtLink
              to="/forgot-password"
              class="font-bold text-primary-green hover:text-dark-green transition-colors ml-1">
              Request one
            </NuxtLink>
          </div>

          <NuxtLink
            to="/login"
            class="font-bold text-primary-green hover:text-dark-green transition-colors">
            Back to login
          </NuxtLink>
        </div>
      </form>
    </div>

    <!-- State 2: Password Updated Success Confirmation -->
    <div v-else class="text-center">
      <div
        class="w-12 h-12 rounded-2xl bg-active-nav-bg border border-light-green-border/30 flex items-center justify-center text-primary-green mb-5 mx-auto shadow-sm">
        <CheckCircle2 class="w-6 h-6 stroke-[2]" />
      </div>

      <div
        class="inline-flex items-center px-3 py-1 rounded-full bg-active-nav-bg/80 border border-light-green-border/20 text-primary-green text-[10px] font-extrabold tracking-widest uppercase mb-4">
        SUCCESS
      </div>

      <h1
        class="text-2xl sm:text-[30px] font-extrabold tracking-tight text-zinc-900 leading-tight mb-2">
        Password <span class="text-primary-green">updated</span>
      </h1>

      <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-7">
        Your password has been changed successfully. You can now sign in with
        your new credentials.
      </p>

      <NuxtLink
        to="/login"
        class="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#15820C] via-primary-green to-[#23A018] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 shadow-[0_6px_18px_-4px_rgba(23,144,13,0.3)] transition-all duration-200 cursor-pointer">
        <span>Sign in now</span>
        <ArrowRight class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from "@lucide/vue";
import { reactive, ref } from "vue";
import { toast } from "vue-sonner";
import PasswordInputForm from "~/components/form/PasswordInputForm.vue";

definePageMeta({
  layout: "auth",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
  },
});

useHead({
  title: "Reset Password - Desk",
});

const loading = ref(false);
const submitted = ref(false);

const form = reactive({
  newPassword: "",
  confirmPassword: "",
});

const errors = reactive({
  newPassword: "",
  confirmPassword: "",
});

const validate = () => {
  errors.newPassword = "";
  errors.confirmPassword = "";

  if (!form.newPassword) {
    errors.newPassword = "New password is required";
  } else if (form.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return !errors.newPassword && !errors.confirmPassword;
};

const handleResetPassword = async () => {
  if (loading.value) return;
  if (!validate()) return;

  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    submitted.value = true;
    toast.success("Your password has been reset successfully!");
  }, 400);
};
</script>
