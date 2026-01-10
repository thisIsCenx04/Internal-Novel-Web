import api from '../../../shared/api/httpClient'

export type MemberSettings = {
  rulesBannerText: string
  footerContactText: string
  singleSessionPolicy: 'KICK_OLD' | 'DENY_NEW'
  watermarkEnabled: boolean
}

export async function fetchMemberSettings(): Promise<MemberSettings> {
  const res = await api.get('/api/member/settings')
  return res.data?.data as MemberSettings
}
