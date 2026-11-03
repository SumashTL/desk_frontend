<template>
  <div
    class="min-h-screen flex p-4 sm:p-5 gap-6 relative overflow-hidden bg-[#F5F7FA]"
    style="background-image: radial-gradient(circle at 82% 14%, #FDF8EE 0%, transparent 38%);"
  >
    <!-- Left Banner (Shared between Login & Forgot Password) -->
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

    <!-- Right Side (Dynamic Auth Form Slot) -->
    <div class="flex-1 flex flex-col justify-between py-2 px-2 sm:px-6 relative z-10">
      <div></div>

      <slot />

      <footer class="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 pt-4 gap-2">
        <div>
          Copyright © 2026, All Rights Reserved By <span class="font-bold text-primary-green">Desk</span>
        </div>
      </footer>
    </div>
  </div>
</template>

