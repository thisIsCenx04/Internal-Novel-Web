import httpClient from '../../../shared/api/httpClient'

export type LoginRequest = {
  username: string
  password: string
  deviceId: string
  userAgent: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    role: 'ADMIN' | 'MEMBER'
  }
}

export async function login(request: LoginRequest) {
  const response = await httpClient.post<LoginResponse>('/api/auth/login', request)
  return response.data
}

export async function logout() {
  await httpClient.post('/api/auth/logout')
}