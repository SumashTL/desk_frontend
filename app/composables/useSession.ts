/** Signed-in user, role and capabilities (from GET /auth/me/). The backend enforces the same rules. */
export type Capability =
  | 'inbox.view' | 'inbox.view_all' | 'inbox.assign_any' | 'inbox.send_template'
  | 'contacts.view' | 'contacts.edit' | 'contacts.import' | 'contacts.export' | 'contacts.block'
  | 'tags.manage' | 'quick_replies.view' | 'quick_replies.manage_team'
  | 'templates.view' | 'templates.sync' | 'broadcasts.manage' | 'members.view' | 'members.manage'
  | 'followups.view' | 'followups.view_all' | 'csat.view' | 'csat.configure'
  | 'dashboard.view' | 'reports.view' | 'reports.team' | 'reports.export'
  | 'settings.personal' | 'settings.workspace' | 'settings.whatsapp' | 'settings.security' | 'audit.view'

export interface Me {
  id: number
  email: string
  display_name: string
  name: string
  avatar: string | null
  phone: string
  role: 'admin' | 'manager' | 'agent'
  can_manage: boolean
  is_superuser: boolean
  grantable_roles: string[]
  capabilities: Record<Capability, boolean>
  only_assigned_chats: boolean
  is_available: boolean
  max_open_chats: number
}

export const ROLE_LABEL: Record<string, string> = { admin: 'Admin', manager: 'Manager', agent: 'Agent' }

export function useSession() {
  const { data, status } = useAuth()
  const me = computed(() => (data.value || null) as Me | null)
  const can = (cap: Capability) => Boolean(me.value?.capabilities?.[cap])
  const role = computed(() => me.value?.role || 'agent')
  return {
    me,
    status,
    role,
    roleLabel: computed(() => ROLE_LABEL[role.value] || role.value),
    isAdmin: computed(() => role.value === 'admin'),
    canManage: computed(() => Boolean(me.value?.can_manage)),
    /** Agent who only sees own (+queue) chats. */
    seesAll: computed(() => can('inbox.view_all') || me.value?.only_assigned_chats === false),
    can,
    refreshMe: () => useAuth().getSession(),
  }
}
