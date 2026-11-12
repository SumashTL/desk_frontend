<template>
  <div class="sd-page"><div class="sd-page-inner">
    <SdPageHeader title="Team members" subtitle="Who can sign in, what they can do and how much they are handling right now.">
      <template v-if="can('members.manage')">
        <SdButton :icon="Mail" @click="openInvite">Invite by email</SdButton>
        <SdButton variant="primary" :icon="UserPlus" @click="openCreate">Add member</SdButton>
      </template>
    </SdPageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SdStat label="Total members" :value="num(stats.total)" :icon="Users" :loading="!members.loaded.value" />
      <SdStat label="Active" :value="num(stats.active)" :icon="UserCheck" :loading="!members.loaded.value" />
      <SdStat label="Online now" :value="num(stats.online)" :icon="Wifi" tone="blue" :loading="!members.loaded.value" />
      <SdStat label="Pending invites" :value="num(stats.pending_invites)" :icon="Mail" tone="amber" :loading="!members.loaded.value" />
      <SdStat label="Disabled" :value="num(stats.disabled)" :icon="UserX" tone="gray" :loading="!members.loaded.value" />
    </div>

    <div class="sd-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--sd-border)] p-3">
        <SdTabs v-model="view" :tabs="[{ value: 'members', label: 'Members', count: stats.total }, { value: 'invites', label: 'Invitations', count: stats.pending_invites }]" />
        <div class="flex-1" />
        <template v-if="view === 'members'">
          <SdSearch v-model="members.filters.search" placeholder="Name, email or phone" class="w-full sm:w-64" />
          <select v-model="members.filters.role" class="sd-input !w-auto"><option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="agent">Agent</option></select>
          <select v-model="members.filters.status" class="sd-input !w-auto"><option value="">Any status</option><option value="active">Active</option><option value="disabled">Disabled</option></select>
        </template>
        <template v-else>
          <SdSearch v-model="invites.filters.search" placeholder="Email or name" class="w-full sm:w-64" />
          <select v-model="invites.filters.status" class="sd-input !w-auto"><option value="">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="expired">Expired</option><option value="revoked">Revoked</option></select>
        </template>
      </div>

      <!-- members -->
      <template v-if="view === 'members'">
        <SdTableSkeleton v-if="members.loading.value && !members.items.value.length" />
        <SdErrorState v-else-if="members.error.value" :message="members.error.value" @retry="members.load" />
        <SdEmpty v-else-if="!members.items.value.length" :icon="Users" title="No members found" text="Try another search or filter." />
        <div v-else class="overflow-x-auto">
          <table class="sd-table min-w-[860px]">
            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th class="text-right">Open chats</th><th class="text-right">Resolved (month)</th><th>Last seen</th><th class="w-10" /></tr></thead>
            <tbody>
              <tr v-for="u in members.items.value" :key="u.id">
                <td>
                  <div class="flex items-center gap-3">
                    <SdAvatar :name="u.name" :src="u.avatar" :seed="u.id" size="sm" :online="u.is_online" />
                    <div class="min-w-0"><p class="truncate font-semibold">{{ u.name }}<span v-if="u.id === me?.id" class="ml-1 text-[11px] font-normal text-[var(--sd-muted)]">(you)</span></p><p class="truncate text-[12px] text-[var(--sd-muted)]">{{ u.email }}</p></div>
                  </div>
                </td>
                <td>
                  <SdBadge :tone="u.role === 'admin' ? 'violet' : u.role === 'manager' ? 'blue' : 'gray'">{{ ROLE_LABEL[u.role] }}</SdBadge>
                  <p v-if="u.role === 'agent'" class="mt-1 text-[11px] text-[var(--sd-muted)]">{{ u.only_assigned_chats ? 'Own chats + queue' : 'Sees all chats' }}</p>
                </td>
                <td>
                  <SdBadge :tone="u.status === 'active' ? 'green' : 'red'" dot>{{ u.status === 'active' ? 'Active' : 'Disabled' }}</SdBadge>
                  <p v-if="u.status === 'active'" class="mt-1 text-[11px] text-[var(--sd-muted)]">{{ u.is_available ? 'Available' : 'Away' }} · max {{ u.max_open_chats }}</p>
                </td>
                <td class="text-right font-semibold">{{ u.open_conversations }}</td>
                <td class="text-right font-semibold">{{ u.resolved_this_month }}</td>
                <td class="text-[12px] text-[var(--sd-muted)]">{{ u.is_online ? 'Online now' : u.last_seen_at ? timeAgo(u.last_seen_at) : 'Never' }}</td>
                <td><SdMenu v-if="Object.values(u.permissions).some(Boolean)" :items="memberMenu(u)" /><span v-else class="text-[11px] text-[var(--sd-faint)]" title="You can't change this member">—</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <SdPagination v-model:page="members.page.value" :count="members.count.value" />
      </template>

      <!-- invitations -->
      <template v-else>
        <SdTableSkeleton v-if="invites.loading.value && !invites.items.value.length" />
        <SdErrorState v-else-if="invites.error.value" :message="invites.error.value" @retry="invites.load" />
        <SdEmpty v-else-if="!invites.items.value.length" :icon="Mail" title="No invitations" text="Invite teammates by email — they choose their own password.">
          <SdButton v-if="can('members.manage')" size="sm" variant="primary" @click="openInvite">Invite by email</SdButton>
        </SdEmpty>
        <div v-else class="overflow-x-auto">
          <table class="sd-table min-w-[760px]">
            <thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Invited by</th><th>Expires</th><th class="w-10" /></tr></thead>
            <tbody>
              <tr v-for="i in invites.items.value" :key="i.id">
                <td><p class="font-semibold">{{ i.email }}</p><p v-if="i.display_name" class="text-[12px] text-[var(--sd-muted)]">{{ i.display_name }}</p></td>
                <td><SdBadge :tone="i.role === 'manager' ? 'blue' : i.role === 'admin' ? 'violet' : 'gray'">{{ ROLE_LABEL[i.role] }}</SdBadge></td>
                <td><SdBadge :tone="({ pending: 'amber', accepted: 'green', expired: 'gray', revoked: 'red' } as any)[i.status]" dot>{{ i.status }}</SdBadge></td>
                <td class="text-[12.5px]">{{ i.invited_by?.name || '—' }}<p class="text-[11px] text-[var(--sd-muted)]">{{ timeAgo(i.last_sent_at || i.created_at) }}</p></td>
                <td class="text-[12.5px] text-[var(--sd-muted)]">{{ i.status === 'pending' ? dateTime(i.expires_at, false) : i.accepted_at ? `Joined ${dateTime(i.accepted_at, false)}` : '—' }}</td>
                <td><SdMenu v-if="i.status !== 'accepted' && can('members.manage')" :items="inviteMenu(i)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <SdPagination v-model:page="invites.page.value" :count="invites.count.value" />
      </template>
    </div>

    <!-- create member -->
    <SdModal v-model:open="createOpen" title="Add a team member" description="Set their password now, or use “Invite by email” to let them choose one.">
      <form id="create-form" class="grid gap-3 sm:grid-cols-2" @submit.prevent="create">
        <SdField label="Full name" :error="errors.display_name" required class="sm:col-span-2"><input v-model="cform.display_name" class="sd-input" autocomplete="off"></SdField>
        <SdField label="Email" :error="errors.email" required><input v-model="cform.email" type="email" class="sd-input" autocomplete="off"></SdField>
        <SdField label="Phone" :error="errors.phone" optional><input v-model="cform.phone" class="sd-input" placeholder="+8801…"></SdField>
        <SdField label="Password" :error="errors.password" required hint="At least 8 characters."><AuthPasswordInput v-model="cform.password" autocomplete="new-password" /></SdField>
        <SdField label="Confirm password" :error="errors.confirm_password" required><AuthPasswordInput v-model="cform.confirm_password" autocomplete="new-password" /></SdField>
        <SdField label="Role" :error="errors.role" class="sm:col-span-2">
          <div class="grid gap-2 sm:grid-cols-3">
            <label v-for="r in grantable" :key="r" :class="['cursor-pointer rounded-xl border p-3 transition', cform.role === r ? 'border-[var(--sd-primary)] bg-[var(--sd-primary-soft)]' : 'border-[var(--sd-border)] hover:border-[var(--sd-border-strong)]']">
              <input v-model="cform.role" type="radio" :value="r" class="sr-only">
              <p class="text-[13px] font-semibold">{{ ROLE_LABEL[r] }}</p><p class="mt-0.5 text-[11.5px] leading-4 text-[var(--sd-muted)]">{{ ROLE_HELP[r] }}</p>
            </label>
          </div>
        </SdField>
        <SdToggle v-if="cform.role === 'agent'" v-model="cform.only_assigned_chats" class="sm:col-span-2" label="Only their own chats" description="Off = this agent can read every conversation." />
        <SdToggle v-model="cform.send_email" class="sm:col-span-2" label="Email them a sign-in link" description="The password itself is never emailed." />
      </form>
      <template #footer><SdButton @click="createOpen = false">Cancel</SdButton><SdButton type="submit" form="create-form" variant="primary" :loading="saving">Add member</SdButton></template>
    </SdModal>

    <!-- invite -->
    <SdModal v-model:open="inviteOpen" :title="inviteLinks.length ? 'Invitation links' : 'Invite teammates'" :description="inviteLinks.length ? 'Share each link privately. It works once and expires.' : 'They get an email with a link to set their name, photo and password.'">
      <div v-if="inviteLinks.length" class="space-y-2">
        <div v-for="l in inviteLinks" :key="l.email" class="flex items-center gap-2 rounded-xl border border-[var(--sd-border)] p-2.5">
          <div class="min-w-0 flex-1"><p class="text-[12.5px] font-semibold">{{ l.email }}</p><p class="truncate text-[11.5px] text-[var(--sd-muted)]">{{ l.url }}</p></div>
          <SdButton size="xs" :icon="Copy" @click="copy(l.url)">Copy</SdButton>
        </div>
      </div>
      <form v-else id="invite-form" class="space-y-3" @submit.prevent="invite">
        <SdField label="Email addresses" :error="errors.emails" hint="One per line or separated by commas. Up to 20 at once." required>
          <textarea v-model="iform.emails" class="sd-input" rows="3" placeholder="nusrat@company.com, rafi@company.com" />
        </SdField>
        <SdField label="Role"><select v-model="iform.role" class="sd-input"><option v-for="r in grantable" :key="r" :value="r">{{ ROLE_LABEL[r] }} — {{ ROLE_HELP[r] }}</option></select></SdField>
        <SdToggle v-if="iform.role === 'agent'" v-model="iform.only_assigned_chats" label="Only their own chats" description="Off = this agent can read every conversation." />
        <SdToggle v-model="iform.send_email" :disabled="!emailReady" label="Send the invitation email" :description="emailReady ? 'Off = you get links to share yourself (e.g. on WhatsApp).' : 'Email is not set up on the server yet, so you’ll get a link to share yourself (WhatsApp, Messenger…).'" />
        <div v-if="inviteFailed.length" class="rounded-xl bg-rose-500/10 p-3 text-[12px] text-rose-700 dark:text-rose-300">
          <p v-for="f in inviteFailed" :key="f.email"><b>{{ f.email }}</b>: {{ (f.errors || []).join(" ") || f.error }}</p>
        </div>
      </form>
      <template #footer>
        <SdButton v-if="inviteLinks.length" variant="primary" @click="inviteOpen = false">Done</SdButton>
        <template v-else><SdButton @click="inviteOpen = false">Cancel</SdButton><SdButton type="submit" form="invite-form" variant="primary" :loading="saving">Send invitations</SdButton></template>
      </template>
    </SdModal>

    <!-- edit -->
    <SdModal v-model:open="editOpen" :title="`Edit ${editing?.name || ''}`" description="Changes apply immediately.">
      <form id="edit-form" class="grid gap-3 sm:grid-cols-2" @submit.prevent="saveEdit">
        <SdField label="Full name" :error="errors.display_name" class="sm:col-span-2"><input v-model="eform.display_name" class="sd-input"></SdField>
        <SdField label="Phone" :error="errors.phone"><input v-model="eform.phone" class="sd-input"></SdField>
        <SdField label="Role" :error="errors.role"><select v-model="eform.role" class="sd-input" :disabled="!editing?.permissions.change_role"><option v-for="r in roleChoices" :key="r" :value="r">{{ ROLE_LABEL[r] }}</option></select></SdField>
        <SdField label="Max open chats" :error="errors.max_open_chats" hint="Auto-assignment stops at this number."><input v-model.number="eform.max_open_chats" type="number" min="1" max="500" class="sd-input"></SdField>
        <div class="flex items-end"><SdToggle v-model="eform.is_available" label="Available for new chats" class="w-full" /></div>
        <SdToggle v-if="eform.role === 'agent'" v-model="eform.only_assigned_chats" class="sm:col-span-2" label="Only their own chats" description="Off = this agent can read every conversation." />
      </form>
      <template #footer><SdButton @click="editOpen = false">Cancel</SdButton><SdButton type="submit" form="edit-form" variant="primary" :loading="saving">Save</SdButton></template>
    </SdModal>

    <!-- set password -->
    <SdModal v-model:open="pwOpen" :title="`New password for ${editing?.name || ''}`" description="They will be signed out of every device." size="sm">
      <form id="pw-form" class="space-y-3" @submit.prevent="setPassword">
        <SdField label="New password" :error="errors.new_password"><AuthPasswordInput v-model="pform.new_password" autocomplete="new-password" /></SdField>
        <SdField label="Confirm password" :error="errors.confirm_password"><AuthPasswordInput v-model="pform.confirm_password" autocomplete="new-password" /></SdField>
        <SdToggle v-model="pform.notify" label="Email them a notice" description="Without the password." />
      </form>
      <template #footer><SdButton @click="pwOpen = false">Cancel</SdButton><SdButton type="submit" form="pw-form" variant="primary" :loading="saving">Set password</SdButton></template>
    </SdModal>
  </div></div>
</template>

<script setup lang="ts">
import { Copy, KeyRound, Mail, Pencil, Power, RefreshCw, Send, Trash2, UserCheck, UserPlus, Users, UserX, Wifi, XCircle } from '@lucide/vue'
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', capability: 'members.view' })
useHead({ title: 'Team members' })

const api = useApi()
const rt = useRealtime()
const { confirm } = useConfirm()
const { me, can } = useSession()
const ROLE_HELP: Record<string, string> = { admin: 'Everything, incl. WhatsApp & security', manager: 'Team, inbox, broadcasts, reports', agent: 'Own chats, contacts, follow-ups' }

const view = ref<'members' | 'invites'>('members')
const members = useList<any>('members/', { role: '', status: '' })
const invites = useList<any>('invitations/', { status: 'pending' }, { immediate: false })
watch(view, v => { if (v === 'invites' && !invites.loaded.value) invites.load() })
const stats = computed(() => members.extra.value.stats || {})
const grantable = computed<string[]>(() => members.extra.value.meta?.grantable_roles || me.value?.grantable_roles || ['agent'])
const emailReady = computed(() => members.extra.value.meta?.email_configured !== false)
const roleChoices = computed(() => Array.from(new Set([...(grantable.value), editing.value?.role].filter(Boolean))))

const saving = ref(false)
const errors = reactive<Record<string, string>>({})
const clearErrors = () => Object.keys(errors).forEach(k => delete errors[k])
function failed(e: any) { Object.assign(errors, e.fields); if (!Object.keys(e.fields || {}).length) toast.error(e.message) }

// create
const createOpen = ref(false)
const cform = reactive<any>({})
function openCreate() {
  clearErrors()
  Object.assign(cform, { display_name: '', email: '', phone: '', password: '', confirm_password: '', role: grantable.value.includes('agent') ? 'agent' : grantable.value[0], only_assigned_chats: false, send_email: emailReady.value })
  createOpen.value = true
}
async function create() {
  clearErrors(); saving.value = true
  try { await api.post('members/', cform, { silent: true }); toast.success(`${cform.display_name} was added`); createOpen.value = false; members.load() } catch (e) { failed(e) } finally { saving.value = false }
}

// invite
const inviteOpen = ref(false)
const iform = reactive<any>({})
const inviteLinks = ref<{ email: string, url: string }[]>([])
const inviteFailed = ref<any[]>([])
function openInvite() {
  clearErrors(); inviteLinks.value = []; inviteFailed.value = []
  Object.assign(iform, { emails: '', role: grantable.value.includes('agent') ? 'agent' : grantable.value[0], only_assigned_chats: false, send_email: emailReady.value })
  inviteOpen.value = true
}
async function invite() {
  clearErrors(); inviteFailed.value = []
  const emails = iform.emails.split(/[\s,;]+/).map((s: string) => s.trim()).filter(Boolean)
  if (!emails.length) { errors.emails = 'Add at least one email.'; return }
  saving.value = true
  try {
    const res = await api.post('invitations/', { ...iform, emails }, { silent: true })
    inviteFailed.value = res.failed || []
    if (!iform.send_email) inviteLinks.value = res.invited.map((i: any) => ({ email: i.email, url: i.invite_url }))
    else { toast.success(`${res.invited.length} invitation${res.invited.length > 1 ? 's' : ''} sent`); if (!inviteFailed.value.length) inviteOpen.value = false }
    members.load(); if (invites.loaded.value) invites.load()
  } catch (e: any) { inviteFailed.value = e.data?.failed || []; if (!inviteFailed.value.length) failed(e) } finally { saving.value = false }
}

// edit / password
const editing = ref<any>(null)
const editOpen = ref(false)
const eform = reactive<any>({})
function openEdit(u: any) {
  clearErrors(); editing.value = u
  Object.assign(eform, { display_name: u.display_name || u.name, phone: u.phone || '', role: u.role, only_assigned_chats: u.only_assigned_chats, is_available: u.is_available, max_open_chats: u.max_open_chats })
  editOpen.value = true
}
async function saveEdit() {
  clearErrors(); saving.value = true
  const body: any = { ...eform }
  if (!editing.value.permissions.change_role || body.role === editing.value.role) delete body.role
  try { await api.patch(`members/${editing.value.id}/`, body, { silent: true }); toast.success('Member updated'); editOpen.value = false; members.load() } catch (e) { failed(e) } finally { saving.value = false }
}
const pwOpen = ref(false)
const pform = reactive<any>({})
function openPassword(u: any) { clearErrors(); editing.value = u; Object.assign(pform, { new_password: '', confirm_password: '', notify: true }); pwOpen.value = true }
async function setPassword() {
  clearErrors(); saving.value = true
  try { const r = await api.post(`members/${editing.value.id}/set-password/`, pform, { silent: true }); toast.success(r.detail || 'Password changed'); pwOpen.value = false } catch (e) { failed(e) } finally { saving.value = false }
}

async function setActive(u: any, active: boolean) {
  if (!active && !(await confirm({ title: `Deactivate ${u.name}?`, message: 'They are signed out everywhere and cannot sign in. Their chats stay assigned until you reassign them.', confirmText: 'Deactivate', danger: true }))) return
  try { await api.post(`members/${u.id}/${active ? 'activate' : 'deactivate'}/`); toast.success(active ? 'Member activated' : 'Member deactivated'); members.load() } catch {}
}
async function remove(u: any) {
  if (!(await confirm({ title: `Delete ${u.name}?`, message: 'This removes the account permanently. Their past messages keep their name. Deactivating is usually the better choice.', confirmText: 'Delete', danger: true }))) return
  try { await api.del(`members/${u.id}/`); toast.success('Member deleted'); members.load() } catch {}
}
const memberMenu = (u: any) => [
  { label: 'Edit details', icon: Pencil, hidden: !u.permissions.edit, onSelect: () => openEdit(u) },
  { label: 'Set new password', icon: KeyRound, hidden: !u.permissions.set_password, onSelect: () => openPassword(u) },
  { separator: true },
  { label: 'Deactivate', icon: Power, hidden: !u.permissions.deactivate, danger: true, onSelect: () => setActive(u, false) },
  { label: 'Activate', icon: Power, hidden: !u.permissions.activate, onSelect: () => setActive(u, true) },
  { label: 'Delete', icon: Trash2, hidden: !u.permissions.delete, danger: true, onSelect: () => remove(u) },
]

// invitations
async function copy(url: string) { try { await copyText(url); toast.success('Link copied') } catch { toast.error('Copy failed — select the link and copy it manually.') } }
async function resend(i: any, sendEmail: boolean) {
  try {
    const r = await api.post(`invitations/${i.id}/resend/`, { send_email: sendEmail })
    if (sendEmail) toast.success(`Invitation re-sent to ${i.email}`)
    else if (r.invite_url) await copy(r.invite_url)
    invites.load()
  } catch {}
}
async function revoke(i: any) {
  if (!(await confirm({ title: `Revoke the invitation for ${i.email}?`, message: 'The link stops working immediately.', confirmText: 'Revoke', danger: true }))) return
  try { await api.post(`invitations/${i.id}/revoke/`); toast.success('Invitation revoked'); invites.load(); members.load() } catch {}
}
const inviteMenu = (i: any) => [
  { label: 'Resend email', icon: Send, onSelect: () => resend(i, true) },
  { label: 'Copy new link', icon: Copy, onSelect: () => resend(i, false) },
  { separator: true },
  { label: 'Revoke', icon: XCircle, danger: true, hidden: i.status !== 'pending', onSelect: () => revoke(i) },
]

rt.on((e) => {
  if (e.type === 'agent.presence') {
    const u = members.items.value.find(x => x.id === e.agent.id)
    if (u) Object.assign(u, { is_online: e.agent.is_online, is_available: e.agent.is_available })
  }
})
</script>
