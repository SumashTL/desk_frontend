/**
 * The one way the app talks to the Django API.
 *
 *  - adds the Bearer token, sends JSON (or FormData as is)
 *  - on 401 refreshes the token once (shared by every request in flight) and retries
 *  - turns DRF errors into ApiError { message, fields } and shows the backend's message as a toast
 *    (pass { silent: true } when a form shows the field errors itself)
 */
import { toast } from 'vue-sonner'

export interface ApiOptions {
  query?: Record<string, any>
  headers?: Record<string, string>
  silent?: boolean
  signal?: AbortSignal
}

export class ApiError extends Error {
  status: number
  fields: Record<string, string>
  data: any
  constructor(message: string, status = 0, fields: Record<string, string> = {}, data: any = null) {
    super(message)
    this.status = status
    this.fields = fields
    this.data = data
  }
}

const REFRESH_COOKIE = 'sd.refresh'
let refreshing: Promise<boolean> | null = null

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const hit = document.cookie.split('; ').find(c => c.startsWith(`${name}=`))
  if (!hit) return null
  try {
    return JSON.parse(decodeURIComponent(hit.slice(name.length + 1)))
  } catch {
    return decodeURIComponent(hit.slice(name.length + 1))
  }
}

function cleanQuery(query?: Record<string, any>) {
  if (!query) return undefined
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

/** First human sentence out of a DRF error body. */
export function errorMessage(data: any, fallback = 'Something went wrong. Please try again.'): { message: string, fields: Record<string, string> } {
  const fields: Record<string, string> = {}
  if (!data || typeof data !== 'object') return { message: typeof data === 'string' && data.length < 300 ? data : fallback, fields }
  const flat = (v: any): string => Array.isArray(v) ? flat(v[0]) : (v && typeof v === 'object') ? flat(Object.values(v)[0]) : String(v ?? '')
  for (const [key, value] of Object.entries(data)) {
    if (key === 'detail' || key === 'non_field_errors') continue
    fields[key] = flat(value)
  }
  const message = data.detail ? flat(data.detail) : data.non_field_errors ? flat(data.non_field_errors) : Object.values(fields)[0] || fallback
  return { message, fields }
}

export function useApi() {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase).replace(/\/+$/, '')
  const { rawToken, rawRefreshToken, data: session } = useAuthState()
  const router = useRouter()

  async function refreshToken(): Promise<boolean> {
    if (refreshing) return refreshing
    refreshing = (async () => {
      // Another tab may already have rotated the refresh token: always use the cookie's latest value.
      for (let attempt = 0; attempt < 2; attempt++) {
        const refresh = readCookie(REFRESH_COOKIE) || rawRefreshToken.value
        if (!refresh) return false
        try {
          const res: any = await $fetch(`${base}/auth/refresh/`, { method: 'POST', body: { refresh } })
          rawToken.value = res.access
          if (res.refresh) rawRefreshToken.value = res.refresh
          return true
        } catch {
          if (readCookie(REFRESH_COOKIE) === refresh) return false
        }
      }
      return false
    })().finally(() => { setTimeout(() => { refreshing = null }, 0) })
    return refreshing
  }

  async function endSession() {
    rawToken.value = null
    rawRefreshToken.value = null
    session.value = null
    const route = router.currentRoute.value
    if (route.path !== '/login') await router.push({ path: '/login', query: { redirect: route.fullPath } })
  }

  async function request<T = any>(method: string, path: string, body?: any, opts: ApiOptions = {}, retried = false): Promise<T> {
    const url = /^https?:/.test(path) ? path : `${base}/${path.replace(/^\/+/, '')}`
    const headers: Record<string, string> = { Accept: 'application/json', ...(opts.headers || {}) }
    if (rawToken.value) headers.Authorization = `Bearer ${rawToken.value}`
    try {
      return await $fetch<T>(url, { method: method as any, body, query: cleanQuery(opts.query), headers, signal: opts.signal })
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err
      const status = err?.response?.status ?? err?.statusCode ?? 0
      if (status === 401 && !retried && !path.startsWith('auth/login')) {
        if (await refreshToken()) return request<T>(method, path, body, opts, true)
        await endSession()
        throw new ApiError('Your session has expired. Please sign in again.', 401)
      }
      const data = err?.data ?? err?.response?._data
      let { message, fields } = errorMessage(data)
      if (!status) message = 'Cannot reach the server. Check your connection and try again.'
      else if (status === 403 && !data?.detail) message = 'You do not have permission to do this.'
      else if (status === 404 && !data?.detail) message = 'Not found.'
      else if (status === 429) message = data?.detail || 'Too many attempts. Please wait a moment.'
      else if (status >= 500) message = 'The server had a problem. Please try again in a moment.'
      if (!opts.silent && import.meta.client) toast.error(message)
      throw new ApiError(message, status, fields, data)
    }
  }

  /** Download a file (CSV export) with the auth header and save it. */
  async function download(path: string, query?: Record<string, any>, filename = 'export.csv') {
    const run = async (): Promise<Response> => fetch(`${base}/${path.replace(/^\/+/, '')}?${new URLSearchParams(cleanQuery(query) as any)}`, {
      headers: rawToken.value ? { Authorization: `Bearer ${rawToken.value}` } : {},
    })
    let res = await run()
    if (res.status === 401 && await refreshToken()) res = await run()
    if (!res.ok) {
      let data: any = null
      try { data = await res.json() } catch {}
      const { message } = errorMessage(data, res.status === 403 ? 'You do not have permission to export this.' : 'Export failed.')
      toast.error(message)
      throw new ApiError(message, res.status)
    }
    const blob = await res.blob()
    const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || filename
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  return {
    get: <T = any>(path: string, opts?: ApiOptions) => request<T>('GET', path, undefined, opts),
    post: <T = any>(path: string, body?: any, opts?: ApiOptions) => request<T>('POST', path, body ?? {}, opts),
    patch: <T = any>(path: string, body?: any, opts?: ApiOptions) => request<T>('PATCH', path, body ?? {}, opts),
    put: <T = any>(path: string, body?: any, opts?: ApiOptions) => request<T>('PUT', path, body ?? {}, opts),
    del: <T = any>(path: string, opts?: ApiOptions) => request<T>('DELETE', path, undefined, opts),
    download,
    refreshToken,
    endSession,
  }
}
