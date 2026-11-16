<template>
  <a v-if="data" :href="data.url || url" target="_blank" rel="noopener noreferrer nofollow"
    class="-mx-1 mb-1 flex max-w-[340px] flex-col overflow-hidden rounded-xl bg-black/[.05] transition hover:bg-black/[.08] dark:bg-white/[.06] dark:hover:bg-white/[.09]">
    <img v-if="data.image && !imgBroken" :src="data.image" alt="" class="max-h-[170px] w-full object-cover" loading="lazy" referrerpolicy="no-referrer" @error="imgBroken = true">
    <span class="block px-3 py-2">
      <span v-if="data.site_name" class="block truncate text-[10.5px] font-semibold uppercase tracking-wide text-[var(--sd-primary-ink)]">{{ data.site_name }}</span>
      <span v-if="data.title" class="line-clamp-2 block text-[12.5px] font-semibold leading-snug text-[var(--sd-text)]">{{ data.title }}</span>
      <span v-if="data.description" class="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-[var(--sd-muted)]">{{ data.description }}</span>
    </span>
  </a>
</template>
<script lang="ts">
// shared by every bubble: one request per link for the whole page
const cache = new Map<string, any>()
const pending = new Map<string, Promise<any>>()
</script>
<script setup lang="ts">
const props = defineProps<{ url: string }>()
const api = useApi()
const data = ref<any>(null)
const imgBroken = ref(false)

async function load(url: string) {
  imgBroken.value = false
  if (cache.has(url)) { data.value = cache.get(url); return }
  let job = pending.get(url)
  if (!job) {
    job = api.get('inbox/link-preview/', { query: { url }, silent: true })
      .then((r: any) => r?.preview || null).catch(() => null)
    pending.set(url, job)
  }
  const preview = await job
  cache.set(url, preview)
  pending.delete(url)
  if (props.url === url) data.value = preview
}

watch(() => props.url, url => { data.value = null; if (url) load(url) }, { immediate: true })
</script>