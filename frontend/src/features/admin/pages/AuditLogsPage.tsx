import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table } from '../../../shared/components/Table'
import { fetchAuditLogs, type AuditLogFilters } from '../api/auditApi'

const actions = [
  'LOGIN_SUCCESS',
  'LOGIN_FAIL',
  'LOGOUT',
  'SESSION_REVOKED',
  'OPEN_STORY',
  'OPEN_CHAPTER',
  'NEXT_CHAPTER',
  'NEXT_TOO_FAST',
  'COPY_ATTEMPT',
  'BAN_USER',
  'UNBAN_USER',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'UPDATE_VIP',
  'CREATE_STORY',
  'UPDATE_STORY',
  'DELETE_STORY',
  'CREATE_CHAPTER',
  'UPDATE_CHAPTER',
  'DELETE_CHAPTER',
  'UPDATE_SETTINGS',
]

const toIso = (value: string) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

const PAGE_SIZE = 10

export function AuditLogsPage() {
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)

  const filters = useMemo<AuditLogFilters>(() => {
    return {
      userId: userId.trim() || undefined,
      action: action === 'all' ? undefined : action,
      from: toIso(from),
      to: toIso(to),
      page,
      size: PAGE_SIZE,
    }
  }, [userId, action, from, to, page])

  const logsQuery = useQuery({
    queryKey: ['admin-audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    keepPreviousData: true,
  })

  const pageData = logsQuery.data
  const items = pageData?.items ?? []

  const hasLogs = items.length > 0
  const totalPages = Math.max(Math.ceil((pageData?.total ?? 0) / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  return (
    <section className="stack audit-logs-page">
      <h2>Audit logs</h2>
      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="User ID"
            value={userId}
            onChange={(event) => {
              setUserId(event.target.value)
              setPage(0)
            }}
          />
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value)
              setPage(0)
            }}
          >
            <option value="all">All actions</option>
            {actions.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(0)
            }}
          />
          <input
            type="datetime-local"
            value={to}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(0)
            }}
          />
        </div>

        {logsQuery.isLoading ? (
          <p className="muted">Đang tải logs...</p>
        ) : hasLogs ? (
          <>
            <div className="audit-table-scroll">
              <Table
                header={
                  <tr>
                    <th>Ngày tháng</th>
                    <th>Hoạt động</th>
                    <th>Người dùng</th>
                    <th>IP</th>
                    <th>Phiên đăng nhập</th>
                    <th>Dữ liệu</th>
                  </tr>
                }
                body={items.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.action}</td>
                    <td>{log.username || log.userId || '-'}</td>
                    <td className="muted">{log.ipAddress || '-'}</td>
                    <td className="muted">{log.sessionId || '-'}</td>
                    <td className="muted audit-metadata">{log.metadata}</td>
                  </tr>
                ))}
              />
            </div>
            <div className="pagination">
              <button
                type="button"
                className="ghost-button"
                disabled={safePage <= 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Prev
              </button>
              <label className="page-input">
                Page
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={safePage + 1}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (Number.isNaN(next)) return
                    const clamped = Math.min(Math.max(next, 1), totalPages)
                    setPage(clamped - 1)
                  }}
                />
                / {totalPages}
              </label>
              <button
                type="button"
                className="ghost-button"
                disabled={safePage + 1 >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="muted">Chưa có bản ghi log.</p>
        )}
      </div>
    </section>
  )
}
