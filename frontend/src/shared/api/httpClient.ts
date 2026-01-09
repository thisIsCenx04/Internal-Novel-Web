import axios, { AxiosError, AxiosHeaders, type AxiosInstance } from 'axios'
import { tokenStore } from './tokenStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

let refreshPromise: Promise<string | null> | null = null
const MIN_LOADING_MS = 600

function redirectToLogin(reason?: string) {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/login') return
  const suffix = reason ? `?reason=${encodeURIComponent(reason)}` : ''
  window.location.assign(`/login${suffix}`)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = api
      .post('/api/auth/refresh', { refreshToken })
      .then((res) => {
        const accessToken = res.data?.data?.accessToken as string | undefined
        const newRefresh = res.data?.data?.refreshToken as string | undefined
        if (accessToken) {
          tokenStore.setTokens(accessToken, newRefresh)
          return accessToken
        }
        return null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers)
  headers.set('x-request-start', Date.now().toString())
  const token = tokenStore.getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  config.headers = headers
  return config
})

function getHeaderValue(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined
  if (headers instanceof AxiosHeaders) {
    const value = headers.get(name)
    return typeof value === 'string' ? value : undefined
  }
  const record = headers as Record<string, unknown>
  const direct = record[name] ?? record[name.toLowerCase()]
  return typeof direct === 'string' ? direct : undefined
}

async function ensureMinDelay(headers?: unknown) {
  const started = getHeaderValue(headers, 'x-request-start')
  const startedMs = started ? Number(started) : NaN
  if (!Number.isNaN(startedMs)) {
    const elapsed = Date.now() - startedMs
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed))
    }
  }
}

api.interceptors.response.use(
  async (response) => {
    await ensureMinDelay(response.config.headers as Record<string, string>)
    return response
  },
  async (error: AxiosError) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url ?? ''
    const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/refresh')

    if (status === 401 && original && !original.headers?.['x-refresh-retry'] && !isAuthEndpoint) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        const headers = AxiosHeaders.from(original.headers)
        headers.set('Authorization', `Bearer ${newToken}`)
        headers.set('x-refresh-retry', '1')
        original.headers = headers
        return api(original)
      }
      tokenStore.clear()
      redirectToLogin('expired')
    }
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      tokenStore.clear()
      redirectToLogin('expired')
    }
    await ensureMinDelay(original?.headers as Record<string, string>)
    return Promise.reject(error)
  },
)

export default api
