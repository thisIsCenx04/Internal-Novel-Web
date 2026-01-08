import axios, { AxiosError, type AxiosInstance } from 'axios'
import { tokenStore } from './tokenStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

let refreshPromise: Promise<string | null> | null = null

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
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && original && !original.headers?.['x-refresh-retry']) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${newToken}`,
          'x-refresh-retry': '1',
        }
        return api(original)
      }
      tokenStore.clear()
    }
    return Promise.reject(error)
  },
)

export default api
