import api from '../../../shared/api/httpClient'

export type SettingsPayload = {
  rulesBannerText: string
  footerContactText: string
  singleSessionPolicy: 'KICK_OLD' | 'DENY_NEW'
}

export async function fetchSettings(): Promise<SettingsPayload> {
  const res = await api.get('/api/admin/settings')
  return res.data?.data as SettingsPayload
}

export async function updateSettings(payload: SettingsPayload): Promise<SettingsPayload> {
  const res = await api.put('/api/admin/settings', payload)
  return res.data?.data as SettingsPayload
}
