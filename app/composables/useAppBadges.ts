/** Sidebar badges (inbox unread, notifications) kept fresh by realtime events. */
export function useAppBadges() {
  const inbox = useState<Record<string, number>>('badge-inbox', () => ({}))
  const notifications = useState<number>('badge-notifications', () => 0)
  const api = useApi()
  let t1: any, t2: any

  function refreshInbox() {
    clearTimeout(t1)
    t1 = setTimeout(async () => {
      try { inbox.value = await api.get('inbox/counts/', { silent: true }) } catch {}
    }, 400)
  }
  function refreshNotifications() {
    clearTimeout(t2)
    t2 = setTimeout(async () => {
      try { notifications.value = (await api.get('notifications/', { silent: true })).count } catch {}
    }, 800)
  }
  return { inbox, notifications, refreshInbox, refreshNotifications }
}
