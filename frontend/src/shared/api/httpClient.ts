import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { tokenStore } from './tokenStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let refreshPromise: Promise<string> | null = null

const httpClient = axios.create({
  baseURL: API_URL,
})

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = tokenStore.get()
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config
    if (!original || status !== 401) {
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      const tokens = tokenStore.get()
      if (!tokens?.refreshToken) {
        tokenStore.clear()
        return Promise.reject(error)
      }

      refreshPromise = httpClient
        .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
          refreshToken: tokens.refreshToken,
        })
        .then((res) => {
          tokenStore.set({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          })
          return res.data.accessToken
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const newAccessToken = await refreshPromise
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newAccessToken}`
      return httpClient(original)
    } catch (refreshError) {
      tokenStore.clear()
      return Promise.reject(refreshError)
    }
  },
)

export default httpClient