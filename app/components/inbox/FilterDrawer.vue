<template>
  <SdDrawer :open="open" title="Filter chats" width="max-w-[360px]" @update:open="v => $emit('update:open', v)">
    <div class="space-y-4 p-5">
      <SdField v-if="seesAll && options.members?.length" label="Assigned to">
        <select v-model="local.assigned" class="sd-input">
          <option value="">Anyone</option><option value="me">Me</option><option value="unassigned">Unassigned</option>
          <option v-for="m in options.members" :key="m.id" :value="String(m.id)">{{ m.name }}</option>
        </select>
      </SdField>
      <SdField label="24-hour window">
        <div class="grid grid-cols-3 gap-1.5">
          <button v-for="o in [['', 'Any'], ['open', 'Active'], ['closed', 'Template']]" :key="o[0]" type="button" :class="['sd-chip !h-8 justify-center', local.window === o[0] && 'is-active']" @click="local.window = o[0]">{{ o[1] }}</button>
        </div>
      </SdField>
      <SdField label="Last message">
        <select v-model="local.activity" class="sd-input">
          <option value="">Any time</option><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="older">Older than 30 days</option>
        </select>
      </SdField>
      <SdField label="Customer waiting for a reply">
        <select v-model="local.waiting" class="sd-input">
          <option value="">Don't filter</option><option value="15">More than 15 minutes</option><option value="60">More than 1 hour</option><option value="240">More than 4 hours</option><option value="1440">More than 1 day</option>
        </select>
      </SdField>
      <SdField label="Country">
        <select v-model="local.country" class="sd-input">
          <option value="">Any country</option>
          <option v-for="c in options.countries" :key="c.code" :value="c.code">{{ flag(c.code) }} {{ countryName(c.code) }} ({{ c.count }})</option>
        </select>
      </SdField>
      <SdField label="Priority">
        <select v-model="local.priority" class="sd-input"><option value="">Any priority</option><option v-for="p in options.priorities" :key="p.value" :value="p.value">{{ p.label }}</option></select>
      </SdField>
      <SdField v-if="options.tags?.length" label="Customer tag">
        <select v-model="local.tag" class="sd-input"><option value="">Any tag</option><option v-for="t in options.tags" :key="t.id" :value="String(t.id)">{{ t.name }}</option></select>
      </SdField>
      <SdToggle v-model="starred" label="Starred only" />
      <SdToggle v-model="snoozed" label="Snoozed only" description="Chats you put aside until later." />
    </div>
    <template #footer>
      <SdButton @click="reset">Reset</SdButton>
      <SdButton variant="primary" @click="apply">Show chats</SdButton>
    </template>
  </SdDrawer>
</template>
<script setup lang="ts">
const props = defineProps<{ open: boolean, options: any, modelValue: Record<string, any>, seesAll: boolean }>()
const emit = defineEmits(['update:open', 'update:modelValue'])
const local = reactive<Record<string, any>>({})
const starred = ref(false)
const snoozed = ref(false)
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(local, { assigned: '', country: '', priority: '', tag: '', window: '', activity: '', waiting: '', ...props.modelValue })
  starred.value = props.modelValue.starred === 'true'
  snoozed.value = props.modelValue.snoozed === 'true'
})
function apply() {
  emit('update:modelValue', { assigned: local.assigned, country: local.country, priority: local.priority, tag: local.tag, window: local.window, activity: local.activity, waiting: local.waiting, starred: starred.value ? 'true' : '', snoozed: snoozed.value ? 'true' : '' })
  emit('update:open', false)
}
function reset() {
  Object.assign(local, { assigned: '', country: '', priority: '', tag: '', window: '', activity: '', waiting: '' })
  starred.value = false
  snoozed.value = false
  apply()
}
</script>
