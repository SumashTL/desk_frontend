<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 sm:p-6 lg:p-8">
    <div class="w-full max-w-md">
      <div
        class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none p-6 sm:p-8">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4 shadow-sm">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Enter your credentials to access your account
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <InputForm
            v-model="form.email"
            label="Email or Username"
            placeholder="name@example.com"
            type="text"
            :left-icon="Mail"
            :error="errors.email"
            :disabled="loading"
            @input="errors.email = ''"
            required />

          <PasswordInputForm
            v-model="form.password"
            label="Password"
            placeholder="Enter your password"
            :left-icon="Lock"
            :error="errors.password"
            :disabled="loading"
            @input="errors.password = ''"
            required />

          <div class="flex items-center justify-between text-sm pt-1 ">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
              <span class="text-zinc-600 dark:text-zinc-400">Remember me</span>
            </label>

            <NuxtLink
              to="/forgot-password"
              class="font-medium text-primary hover:text-primary-dark hover:underline transition-colors">
              Forgot password?
            </NuxtLink>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full h-11 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? "Signing in..." : "Sign In" }}</span>
            <ArrowRight v-if="!loading" class="w-4 h-4 ml-0.5" />
          </button>
        </form>

        <p class="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="font-semibold text-primary hover:text-primary-dark hover:underline ml-1">
            Create account
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Loader2, Lock, Mail } from "@lucide/vue";
import { reactive, ref } from "vue";
import { toast } from "vue-sonner";
import InputForm from "~/components/form/InputForm.vue";
import PasswordInputForm from "~/components/form/PasswordInputForm.vue";

useHead({
  title: "Sign In — Desk",
});

const loading = ref(false);

const form = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const errors = reactive({
  email: "",
  password: "",
});

const validate = () => {
  let isValid = true;
  errors.email = "";
  errors.password = "";

  if (!form.email.trim()) {
    errors.email = "Email or username is required";
    isValid = false;
  }

  if (!form.password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  console.log("Login button clicked. Form data:", {
    email: form.email,
    password: form.password,
    rememberMe: form.rememberMe,
  });

  if (!validate()) {
    toast.error("Please fix the errors before submitting");
    return;
  }

  loading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Signed in successfully! Welcome back.");
    // await navigateTo('/')
  } catch (err) {
    toast.error("Login failed. Please check your credentials and try again.");
  } finally {
    loading.value = false;
  }
};
</script>
