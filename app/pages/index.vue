<template>
  <div class="p-8 max-w-5xl mx-auto space-y-10">
    <div>
      <h1 class="text-3xl font-extrabold text-zinc-900 tracking-tight">UI Components Playground</h1>
      <p class="text-sm text-zinc-500 mt-1">Testing design system components and circular progress bars.</p>
    </div>

    <!-- Buttons Section -->
    <div class="space-y-3">
      <h2 class="text-lg font-bold text-zinc-800">Buttons</h2>
      <div class="flex flex-wrap gap-4">
        <Button>Default Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    </div>

    <!-- Circular Progress Section -->
    <div class="space-y-6">
      <div>
        <h2 class="text-lg font-bold text-zinc-800">Circular / Rounded Progress Bars</h2>
        <p class="text-xs text-zinc-500">Styled to match the Zurvis theme (primary green, smooth rounded caps, customizable sizes).</p>
      </div>

      <!-- Interactive Playground Card -->
      <div class="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div class="flex items-center gap-6">
            <CircularProgress
              :value="progressValue"
              size="lg"
              variant="primary"
            />
            <div>
              <h3 class="font-bold text-zinc-900 text-lg">Interactive Progress</h3>
              <p class="text-xs text-zinc-500 mt-0.5">Use the slider below to test smooth SVG animations.</p>
            </div>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-64">
            <input
              v-model.number="progressValue"
              type="range"
              min="0"
              max="100"
              class="w-full accent-primary-green cursor-pointer"
            >
            <span class="text-xs font-bold text-zinc-700 w-10 text-right">{{ progressValue }}%</span>
          </div>
        </div>

        <!-- Variants Showcase -->
        <div>
          <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Preset States & Values</h4>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
            <!-- 0% like user request image -->
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-subtle-bg border border-zinc-100">
              <CircularProgress :value="0" size="md" />
              <span class="text-xs font-medium text-zinc-600">0% Initial</span>
            </div>

            <!-- 25% -->
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-subtle-bg border border-zinc-100">
              <CircularProgress :value="25" size="md" />
              <span class="text-xs font-medium text-zinc-600">25% Progress</span>
            </div>

            <!-- 65% with Gradient -->
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-subtle-bg border border-zinc-100">
              <CircularProgress :value="65" size="md" :use-gradient="true" />
              <span class="text-xs font-medium text-zinc-600">65% Gradient</span>
            </div>

            <!-- 100% Complete -->
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-subtle-bg border border-zinc-100">
              <CircularProgress :value="100" size="md" variant="success" />
              <span class="text-xs font-medium text-zinc-600">100% Done</span>
            </div>

            <!-- Indeterminate Loading -->
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-subtle-bg border border-zinc-100">
              <CircularProgress indeterminate size="md" />
              <span class="text-xs font-medium text-zinc-600">Indeterminate</span>
            </div>
          </div>
        </div>

        <!-- Sizes Showcase -->
        <div>
          <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Different Sizes (sm, md, lg, xl)</h4>
          <div class="flex flex-wrap items-end gap-6">
            <div class="flex flex-col items-center gap-2">
              <CircularProgress :value="75" size="sm" />
              <span class="text-xs text-zinc-500">sm (56px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <CircularProgress :value="75" size="md" />
              <span class="text-xs text-zinc-500">md (76px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <CircularProgress :value="75" size="lg" />
              <span class="text-xs text-zinc-500">lg (96px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <CircularProgress :value="75" size="xl" label="Storage" />
              <span class="text-xs text-zinc-500">xl with label</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const progressValue = ref(68)
</script>
