<template>
  <SdModal :open="open" title="Tags" description="Group customers (VIP, Wholesale, Dhaka…). Used for filters and broadcast audiences." @update:open="v => $emit('update:open', v)">
    <form class="mb-4 flex gap-2" @submit.prevent="add">
      <input v-model="color" type="color" class="h-10 w-12 cursor-pointer rounded-lg border border-[var(--sd-border)] bg-transparent p-1" aria-label="Tag colour">
      <input v-model.trim="name" class="sd-input flex-1" placeholder="New tag name" maxlength="50">
      <SdButton type="submit" variant="primary" :icon="Plus" :loading="busy === 'new'" :disabled="!name">Add</SdButton>
    </form>
    <p v-if="error" class="sd-error -mt-2 mb-3">{{ error }}</p>
    <div v-if="loading" class="space-y-2"><div v-for="i in 3" :key="i" class="sd-skeleton h-10" /></div>
    <SdEmpty v-else-if="!tags.length" compact :icon="Tags" title="No tags yet" />
    <div v-else class="divide-y divide-[var(--sd-border)] rounded-xl border border-[var(--sd-border)]">
      <div v-for="t in tags" :key="t.id" class="flex items-center gap-3 px-3 py-2">
        <input type="color" :value="t.color" class="h-7 w-8 cursor-pointer rounded border-0 bg-transparent" aria-label="Change colour" @change="e => update(t, { color: (e.target as HTMLInputElement).value })">
        <input :value="t.name" class="flex-1 bg-transparent text-[13px] font-semibold outline-none" maxlength="50" @change="e => update(t, { name: (e.target as HTMLInputElement).value })">
        <span class="text-[12px] text-[var(--sd-muted)]">{{ t.contacts_count }} contacts</span>
        <SdButton v-if="deleting !== t.id" size="icon-sm" variant="danger-soft" :icon="Trash2" aria-label="Delete tag" @click="deleting = t.id" />
        <template v-else><SdButton size="xs" @click="deleting = null">Keep</SdButton><SdButton size="xs" variant="danger" @click="remove(t)">Delete</SdButton></template>
      </div>
    </div>
  </SdModal>
</template>
<script setup lang="ts">
import { Plus, Tags, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'changed'])
const api = useApi()
const tags = ref<any[]>([])
const loading = ref(false)
const name = ref('')
const color = ref('#0f7a43')
const busy = ref<string | null>(null)
const error = ref('')
async function load() { loading.value = true; try { tags.value = await api.get('tags/') } catch {} finally { loading.value = false } }
watch(() => props.open, o => { if (o) { error.value = ''; load() } })
async function add() {
  busy.value = 'new'; error.value = ''
  try { await api.post('tags/', { name: name.value, color: color.value }, { silent: true }); name.value = ''; await load(); emit('changed') } catch (e: any) { error.value = e.fields?.name || e.fields?.color || e.message } finally { busy.value = null }
}
async function update(t: any, body: any) {
  try { await api.patch(`tags/${t.id}/`, body); toast.success('Tag saved'); await load(); emit('changed') } catch { await load() }
}
const deleting = ref<number | null>(null)
async function remove(t: any) {
  deleting.value = null
  try { await api.del(`tags/${t.id}/`); toast.success(`Tag removed from ${t.contacts_count} contacts`); await load(); emit('changed') } catch {}
}
</script>
