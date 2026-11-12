<template>
  <div class="relative flex min-h-[100dvh] gap-6 overflow-hidden bg-[var(--sd-bg)] p-3 text-[var(--sd-text)] sm:p-5">
    <aside class="relative hidden overflow-hidden rounded-[28px] lg:flex lg:w-[46%] xl:w-[48%]">
      <div class="absolute inset-0 bg-gradient-to-br from-[#0f7a43] via-[#0d6a3b] to-[#0a4f2d]" />
      <div class="absolute inset-0 opacity-[.13]" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 22px 22px" />
      <div class="relative z-10 flex w-full flex-col justify-between p-10 text-white">
        <div class="flex items-center gap-3"><AppLogo class="h-10 w-10 !bg-white/15 !from-transparent !to-transparent" /><span class="text-lg font-extrabold">SumashDesk</span></div>
        <div class="max-w-md">
          <h2 class="text-[34px] font-extrabold leading-[1.1] tracking-tight">One WhatsApp number.<br>Your whole team.</h2>
          <p class="mt-4 text-[14.5px] leading-6 text-white/80">Every customer chat in one shared inbox — assigned, tracked and answered in real time by the right person.</p>
          <ul class="mt-8 space-y-3 text-[13.5px] text-white/90">
            <li v-for="f in features" :key="f" class="flex items-center gap-3"><span class="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Check class="h-3.5 w-3.5" /></span>{{ f }}</li>
          </ul>
        </div>
        <p class="text-[11.5px] text-white/60">© {{ new Date().getFullYear() }} Sumash Tech · Official WhatsApp Business Platform</p>
      </div>
    </aside>
    <div class="relative z-10 flex flex-1 flex-col">
      <div class="flex items-center gap-2 px-2 pt-2 lg:hidden"><AppLogo class="h-8 w-8" /><span class="font-extrabold">SumashDesk</span></div>
      <div class="flex flex-1 items-center justify-center px-2 py-8"><slot /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Check } from '@lucide/vue'
const features = ['Live team inbox with assignment', '24-hour window & approved templates', 'Broadcasts, follow-ups and CSAT', 'Admin, Manager and Agent roles']
</script>
