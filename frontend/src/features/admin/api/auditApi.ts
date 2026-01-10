import api from '../../../shared/api/httpClient'

export type AuditLogItem = {
  id: string
  userId: string | null
  username: string | null
  sessionId: string | null
  action: string
  metadata: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export type AuditLogPage = {
  items: AuditLogItem[]
  total: number
  page: number
  size: number
}

export type AuditLogFilters = {
  userId?: string
  action?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export async function fetchAuditLogs(filters: AuditLogFilters): Promise<AuditLogPage> {
  const res = await api.get('/api/admin/audit-logs', { params: filters })
  return res.data?.data as AuditLogPage
}
