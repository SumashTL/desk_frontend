/**
 * One WebSocket per browser tab to /ws/inbox/, shared by every page.
 *
 *   const rt = useRealtime(); rt.connect()
 *   const off = rt.on(event => { ... })     // returns an unsubscribe function
 *   rt.send({ type: 'viewing', conversation_id })
 *
 * Auth: a 30-second single-use ticket from POST /inbox/realtime-ticket/ (the JWT never goes in a URL).
 * Reconnects with back-off; after a reconnect it emits { type: 'resync' } so lists reload what was missed.
 */
type Handler = (event: any) => void
type Status = 'idle' | 'connecting' | 'open' | 'closed'

const handlers = new Set<Handler>()
let socket: WebSocket | null = null
let wanted = false
let attempts = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null
let pingTimer: ReturnType<typeof setInterval> | null = null
let everOpened = false
let listening = false

export function useRealtime() {
  const status = useState<Status>('rt-status', () => 'idle')
  const config = useRuntimeConfig()
  const api = useApi()

  function wsUrl(path: string, ticket: string) {
    let origin = String(config.public.wsBase || '')
    if (!origin) {
      const u = new URL(String(config.public.apiBase), window.location.href)
      origin = `${u.protocol === 'https:' ? 'wss:' : 'ws:'}//${u.host}`
    }
    return `${origin.replace(/\/+$/, '')}${path}?ticket=${encodeURIComponent(ticket)}`
  }

  function emit(event: any) {
    handlers.forEach((h) => { try { h(event) } catch (e) { console.error(e) } })
  }

  function scheduleRetry() {
    if (!wanted || retryTimer) return
    const delay = Math.min(20000, [1000, 2000, 4000, 8000, 12000][attempts] ?? 20000)
    attempts++
    retryTimer = setTimeout(() => { retryTimer = null; open() }, delay)
  }

  async function open() {
    if (!wanted || (socket && socket.readyState <= 1)) return
    status.value = 'connecting'
    let ticket: { ticket: string, path: string }
    try {
      ticket = await api.post('inbox/realtime-ticket/', {}, { silent: true })
    } catch {
      status.value = 'closed'
      return scheduleRetry()
    }
    const ws = new WebSocket(wsUrl(ticket.path || '/ws/inbox/', ticket.ticket))
    socket = ws
    ws.onopen = () => {
      status.value = 'open'
      attempts = 0
      if (everOpened) emit({ type: 'resync' })
      everOpened = true
      pingTimer && clearInterval(pingTimer)
      pingTimer = setInterval(() => send({ type: 'ping' }), 25000)
    }
    ws.onmessage = (msg) => {
      try { emit(JSON.parse(msg.data)) } catch {}
    }
    ws.onclose = () => {
      if (socket === ws) socket = null
      pingTimer && clearInterval(pingTimer)
      status.value = 'closed'
      scheduleRetry()
    }
    ws.onerror = () => ws.close()
  }

  function connect() {
    if (typeof window === 'undefined') return
    wanted = true
    if (!listening) {
      listening = true
      const wake = () => { if (wanted && (!socket || socket.readyState > 1)) { attempts = 0; retryTimer && clearTimeout(retryTimer); retryTimer = null; open() } }
      window.addEventListener('online', wake)
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake() })
    }
    open()
  }

  function disconnect() {
    wanted = false
    everOpened = false
    retryTimer && clearTimeout(retryTimer)
    retryTimer = null
    pingTimer && clearInterval(pingTimer)
    socket?.close(1000)
    socket = null
    status.value = 'idle'
  }

  function send(data: any) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data))
  }

  function on(handler: Handler) {
    handlers.add(handler)
    const off = () => handlers.delete(handler)
    if (getCurrentInstance()) onBeforeUnmount(off)
    return off
  }

  return { status, connect, disconnect, send, on }
}
