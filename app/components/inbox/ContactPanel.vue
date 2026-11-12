<template>
  <div class="space-y-5 p-4 text-[13px]">
    <div class="flex flex-col items-center text-center">
      <SdAvatar :name="conv.contact.name" :seed="conv.contact.id" size="xl" />
      <template v-if="!editing">
        <p class="mt-3 text-[16px] font-bold">{{ conv.contact.name }}</p>
        <p class="text-[12.5px] text-[var(--sd-muted)]">{{ conv.contact.phone }}</p>
        <p v-if="conv.contact.phone_hidden" class="mt-0.5 text-[11.5px] text-[var(--sd-faint)]">Number hidden by the customer · replies still reach them</p>
        <p v-if="conv.contact.profile_name && conv.contact.custom_name" class="text-[11.5px] text-[var(--sd-faint)]">WhatsApp name: {{ conv.contact.profile_name }}</p>
        <div class="mt-3 flex gap-2">
          <SdButton v-if="can('contacts.edit')" size="xs" :icon="Pencil" @click="startEdit">Edit</SdButton>
          <SdButton size="xs" :icon="Contact" :to="`/dashboard/customer-360?id=${conv.contact.id}`">Customer 360°</SdButton>
        </div>
      </template>
      <form v-else class="mt-3 w-full space-y-2 text-left" @submit.prevent="save">
        <SdField label="Name" :error="errors.custom_name"><input v-model="form.custom_name" class="sd-input" :placeholder="conv.contact.profile_name"></SdField>
        <SdField label="Email" :error="errors.email"><input v-model="form.email" type="email" class="sd-input"></SdField>
        <SdField label="Address"><input v-model="form.address" class="sd-input"></SdField>
        <div class="flex justify-end gap-2 pt-1"><SdButton size="sm" @click="editing = false">Cancel</SdButton><SdButton size="sm" type="submit" variant="primary" :loading="saving">Save</SdButton></div>
      </form>
    </div>

    <section>
      <h3 class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Details</h3>
      <dl class="space-y-2">
        <div v-if="conv.contact.country" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Country</dt><dd>{{ flag(conv.contact.country) }} {{ countryName(conv.contact.country) }}</dd></div>
        <div v-if="conv.contact.email" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Email</dt><dd class="truncate">{{ conv.contact.email }}</dd></div>
        <div v-if="crm" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Segment</dt><dd class="capitalize">{{ crm.segment }}<SdBadge v-if="crm.is_vip" tone="amber" class="ml-1">VIP</SdBadge></dd></div>
        <div v-if="crm" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Marketing consent</dt><dd><SdBadge :tone="crm.consent === 'opted_in' ? 'green' : crm.consent === 'opted_out' ? 'red' : 'gray'">{{ CONSENT[crm.consent] }}</SdBadge></dd></div>
        <div class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Chat started</dt><dd>{{ dateTime(conv.created_at, false) }}</dd></div>
        <div v-if="conv.window_expires_at" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Reply window</dt><dd>{{ conv.window_open ? `open until ${dateTime(conv.window_expires_at)}` : 'closed' }}</dd></div>
        <div v-if="conv.closed_at" class="flex justify-between gap-3"><dt class="text-[var(--sd-muted)]">Resolved</dt><dd>{{ timeAgo(conv.closed_at) }}<template v-if="conv.closed_by"> by {{ conv.closed_by.name }}</template></dd></div>
      </dl>
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between"><h3 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Tags</h3>
        <SdMenu v-if="can('contacts.edit') && allTags.length" :items="tagItems"><button class="sd-link text-[12px]">Edit</button></SdMenu></div>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="t in conv.contact.tags" :key="t.id" class="rounded-full px-2 py-0.5 text-[11.5px] font-semibold" :style="{ background: `${t.color}22`, color: t.color }">{{ t.name }}</span>
        <span v-if="!conv.contact.tags.length" class="text-[12px] text-[var(--sd-faint)]">No tags</span>
      </div>
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between"><h3 class="text-[11px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Follow-ups</h3>
        <button v-if="can('followups.view')" class="sd-link text-[12px]" @click="$emit('followup')">+ Add</button></div>
      <div v-if="timeline?.followups?.length" class="space-y-1.5">
        <div v-for="f in timeline.followups.slice(0, 4)" :key="f.id" class="rounded-lg bg-[var(--sd-surface-soft)] px-3 py-2">
          <p class="font-medium">{{ f.title || 'Follow-up' }}</p>
          <p class="text-[11.5px] text-[var(--sd-muted)]">{{ dateTime(f.due_at) }} · {{ f.status }}<template v-if="f.owner"> · {{ f.owner }}</template></p>
        </div>
      </div>
      <p v-else class="text-[12px] text-[var(--sd-faint)]">Nothing scheduled</p>
    </section>

    <section v-if="timeline?.ratings?.length">
      <h3 class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Ratings</h3>
      <div class="flex flex-wrap gap-1.5">
        <SdBadge v-for="(r, i) in timeline.ratings.slice(0, 6)" :key="i" :tone="r.rating >= (r.max_rating === 5 ? 4 : 3) ? 'green' : r.rating <= 2 ? 'red' : 'amber'">★ {{ r.rating }}/{{ r.max_rating }}</SdBadge>
      </div>
    </section>

    <section>
      <h3 class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sd-faint)]">Internal notes</h3>
      <p class="text-[12px] text-[var(--sd-muted)]">{{ notes.length ? `${notes.length} note${notes.length > 1 ? 's' : ''} in this chat (yellow cards). Switch the composer to “Note” to add one.` : 'Switch the composer to “Note” to leave a message only your team can see.' }}</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { Contact, Pencil } from '@lucide/vue'
import { toast } from 'vue-sonner'
const props = defineProps<{ conv: any, notes: any[] }>()
const emit = defineEmits(['changed', 'followup'])
const api = useApi()
const { can } = useSession()
const CONSENT: Record<string, string> = { opted_in: 'Opted in', opted_out: 'Opted out', unknown: 'Unknown' }
const crm = ref<any>(null)
const timeline = ref<any>(null)
const allTags = ref<any[]>([])
const editing = ref(false)
const saving = ref(false)
const form = reactive({ custom_name: '', email: '', address: '' })
const errors = reactive<Record<string, string>>({})

async function load() {
  const id = props.conv.contact.id
  try {
    const [c, t] = await Promise.all([api.get(`contacts/${id}/`, { silent: true }), api.get(`contacts/${id}/timeline/`, { silent: true })])
    crm.value = c
    timeline.value = t
  } catch {}
}
watch(() => props.conv.contact.id, load, { immediate: true })
onMounted(async () => { if (can('contacts.edit')) { try { allTags.value = await api.get('tags/', { silent: true }) } catch {} } })

function startEdit() {
  Object.assign(form, { custom_name: props.conv.contact.custom_name || '', email: props.conv.contact.email || '', address: props.conv.contact.address || '' })
  editing.value = true
}
async function save() {
  saving.value = true
  Object.keys(errors).forEach(k => delete errors[k])
  try {
    await api.patch(`contacts/${props.conv.contact.id}/`, form, { silent: true })
    editing.value = false
    toast.success('Contact updated')
    emit('changed')
    load()
  } catch (e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields).length) toast.error(e.message) } finally { saving.value = false }
}
const tagItems = computed(() => allTags.value.map(t => {
  const has = props.conv.contact.tags.some((x: any) => x.id === t.id)
  return { label: `${has ? '✓ ' : ''}${t.name}`, onSelect: () => toggleTag(t.id, has) }
}))
async function toggleTag(id: number, has: boolean) {
  const ids = props.conv.contact.tags.map((t: any) => t.id).filter((x: number) => x !== id)
  if (!has) ids.push(id)
  try { await api.patch(`contacts/${props.conv.contact.id}/`, { tag_ids: ids }); emit('changed') } catch {}
}
</script>
