import api from '../../../shared/api/httpClient'

export type MemberProfile = {
  id: string
  username: string
  role: 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'BANNED'
  vipExpiresAt: string | null
  vipWarningDays: number | null
  vipExpired: boolean
}

export async function fetchMemberProfile(): Promise<MemberProfile> {
  const res = await api.get('/api/member/profile')
  return res.data?.data as MemberProfile
}
