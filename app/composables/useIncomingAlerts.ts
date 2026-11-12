/**
 * Sound + desktop notification for a new customer message, unless the agent is already looking at that chat.
 * Controlled by the user's preferences (Settings → Notifications): { sound: bool, desktop: bool }.
 */
export function useIncomingAlerts() {
  const prefs = useState<{ sound: boolean, desktop: boolean }>('notify-prefs', () => ({ sound: true, desktop: true }))
  const openConversation = useState<string | null>('inbox-open-conversation', () => null)
  const api = useApi()
  let ctx: AudioContext | null = null

  async function init() {
    try {
      const p = await api.get('me/preferences/', { silent: true })
      prefs.value = { sound: p.notifications?.sound ?? true, desktop: p.notifications?.desktop ?? true }
    } catch {}
  }

  function beep() {
    try {
      ctx ||= new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(880, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18)
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.32)
    } catch {}
  }

  function onMessage(e: any) {
    const m = e.message
    if (!m || m.direction !== 'in' || m.type === 'reaction') return
    // Meta re-delivers messages it could not deliver earlier; don't ring for those
    if (m.sent_at && Date.now() - new Date(m.sent_at).getTime() > 10 * 60 * 1000) return
    const looking = document.visibilityState === 'visible' && openConversation.value === e.conversation?.id
    if (looking) return
    if (prefs.value.sound) beep()
    if (prefs.value.desktop && document.visibilityState !== 'visible' && 'Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(e.conversation?.contact?.name || 'New WhatsApp message', {
        body: m.body || `[${m.type}]`, tag: e.conversation?.id, icon: '/favicon.ico',
      })
      n.onclick = () => { window.focus(); navigateTo(`/dashboard/inbox?c=${e.conversation?.id}`); n.close() }
    }
  }

  return { prefs, init, onMessage, beep }
}
