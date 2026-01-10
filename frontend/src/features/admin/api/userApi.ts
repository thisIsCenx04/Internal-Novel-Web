import api from '../../../shared/api/httpClient'

export type UserPayload = {
  id: string
  username: string
  role: 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'BANNED'
  vipExpiresAt: string | null
  vipNote: string | null
  createdAt: string | null
  lastLoginAt: string | null
}

export type UserCreatePayload = {
  username: string
  password: string
}

export type UserUpdatePayload = {
  username?: string
  password?: string
  role?: 'ADMIN' | 'MEMBER'
  status?: 'ACTIVE' | 'BANNED'
}

export type VipUpdatePayload = {
  expiresAt?: string | null
  addDays?: number | null
  note?: string | null
}

export async function fetchUsers(): Promise<UserPayload[]> {
  const res = await api.get('/api/admin/users')
  return res.data?.data as UserPayload[]
}

export async function createUser(payload: UserCreatePayload): Promise<UserPayload> {
  const res = await api.post('/api/admin/users', payload)
  return res.data?.data as UserPayload
}

export async function updateUser(id: string, payload: UserUpdatePayload): Promise<UserPayload> {
  const res = await api.put(`/api/admin/users/${id}`, payload)
  return res.data?.data as UserPayload
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/admin/users/${id}`)
}

export async function banUser(id: string): Promise<UserPayload> {
  const res = await api.post(`/api/admin/users/${id}/ban`)
  return res.data?.data as UserPayload
}

export async function unbanUser(id: string): Promise<UserPayload> {
  const res = await api.post(`/api/admin/users/${id}/unban`)
  return res.data?.data as UserPayload
}

export async function updateVip(id: string, payload: VipUpdatePayload): Promise<UserPayload> {
  const res = await api.post(`/api/admin/users/${id}/vip`, payload)
  return res.data?.data as UserPayload
}
