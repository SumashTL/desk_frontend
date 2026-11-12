<template>
  <span :class="['relative inline-grid shrink-0 place-items-center rounded-full font-bold', sizes[size]]"
    :style="src ? undefined : isDark ? { background: `hsl(${h} 30% 22%)`, color: `hsl(${h} 55% 78%)` } : { background: `hsl(${h} 55% 92%)`, color: `hsl(${h} 45% 30%)` }">
    <img v-if="src && !broken" :src="assetUrl(src)" :alt="name" class="h-full w-full rounded-full object-cover" @error="broken = true">
    <span v-else>{{ initials(name) }}</span>
    <span v-if="online !== undefined" :class="['absolute bottom-0 right-0 rounded-full border-2 border-[var(--sd-surface)]', dot[size], online ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600']" />
  </span>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ name?: string, src?: string | null, size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl', online?: boolean, seed?: string | number }>(), { size: 'md', online: undefined })
const broken = ref(false)
const { isDark } = useTheme()
watch(() => props.src, () => { broken.value = false })
const h = computed(() => hue(props.seed ?? props.name))
const sizes = { xs: 'h-6 w-6 text-[9px]', sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs', lg: 'h-12 w-12 text-sm', xl: 'h-20 w-20 text-xl' }
const dot = { xs: 'h-2 w-2', sm: 'h-2.5 w-2.5', md: 'h-3 w-3', lg: 'h-3.5 w-3.5', xl: 'h-4 w-4' }
</script>
