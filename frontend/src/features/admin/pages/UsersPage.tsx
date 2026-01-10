import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Table } from '../../../shared/components/Table'
import {
  banUser,
  createUser,
  deleteUser,
  fetchUsers,
  unbanUser,
  updateUser,
  updateVip,
  type UserPayload,
  type UserUpdatePayload,
  type VipUpdatePayload,
} from '../api/userApi'

const emptyCreate = { username: '', password: '' }
const emptyEdit: UserUpdatePayload = {}
const emptyVip: VipUpdatePayload = {}
const PAGE_SIZE = 10

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  })

  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editForm, setEditForm] = useState<UserUpdatePayload>(emptyEdit)
  const [vipForm, setVipForm] = useState<VipUpdatePayload>(emptyVip)
  const [selected, setSelected] = useState<UserPayload | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isVipOpen, setIsVipOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [lastLoginFilter, setLastLoginFilter] = useState('any')
  const [vipFilterDays, setVipFilterDays] = useState('')
  const [page, setPage] = useState(0)

  const filteredUsers = useMemo(() => {
    const list = usersQuery.data ?? []
    const query = search.trim().toLowerCase()
    const now = Date.now()

    return list.filter((user) => {
      const matchesSearch = !query || user.username.toLowerCase().includes(query)

      let matchesLastLogin = true
      if (lastLoginFilter !== 'any') {
        if (!user.lastLoginAt) {
          matchesLastLogin = lastLoginFilter === 'never'
        } else {
          const lastLoginMs = new Date(user.lastLoginAt).getTime()
          if (lastLoginFilter === '24h') {
            matchesLastLogin = now - lastLoginMs <= 24 * 60 * 60 * 1000
          } else if (lastLoginFilter === '7d') {
            matchesLastLogin = now - lastLoginMs <= 7 * 24 * 60 * 60 * 1000
          } else if (lastLoginFilter === '30d') {
            matchesLastLogin = now - lastLoginMs <= 30 * 24 * 60 * 60 * 1000
          }
        }
      }

      let matchesVip = true
      if (vipFilterDays.trim()) {
        const limitDays = Number(vipFilterDays)
        if (Number.isFinite(limitDays)) {
          const vipMs = user.vipExpiresAt ? new Date(user.vipExpiresAt).getTime() : 0
          const diffDays = Math.floor((vipMs - now) / (24 * 60 * 60 * 1000))
          matchesVip = diffDays <= limitDays
        }
      }

      return matchesSearch && matchesLastLogin && matchesVip
    })
  }, [usersQuery.data, search, lastLoginFilter, vipFilterDays])

  const totalPages = Math.max(Math.ceil(filteredUsers.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const pagedUsers = filteredUsers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hasUsers = Boolean(pagedUsers.length)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const createMutation = useMutation({ mutationFn: createUser })
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: UserUpdatePayload }) =>
      updateUser(payload.id, payload.data),
  })
  const deleteMutation = useMutation({ mutationFn: deleteUser })
  const banMutation = useMutation({ mutationFn: banUser })
  const unbanMutation = useMutation({ mutationFn: unbanUser })
  const vipMutation = useMutation({
    mutationFn: (payload: { id: string; data: VipUpdatePayload }) =>
      updateVip(payload.id, payload.data),
  })

  const refresh = async () => {
    await usersQuery.refetch()
  }

  const resetCreate = () => {
    setCreateForm(emptyCreate)
    setIsCreateOpen(false)
  }

  const resetEdit = () => {
    setEditForm(emptyEdit)
    setSelected(null)
    setIsEditOpen(false)
  }

  const resetVip = () => {
    setVipForm(emptyVip)
    setSelected(null)
    setIsVipOpen(false)
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!createForm.username.trim() || !createForm.password.trim()) return
    await createMutation.mutateAsync({
      username: createForm.username.trim(),
      password: createForm.password,
    })
    await refresh()
    resetCreate()
  }

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    await updateMutation.mutateAsync({ id: selected.id, data: editForm })
    await refresh()
    resetEdit()
  }

  const handleVip = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const addDays = vipForm.addDays != null ? Math.trunc(vipForm.addDays) : null
    const expiresAt = addDays
      ? null
      : vipForm.expiresAt
        ? new Date(vipForm.expiresAt).toISOString()
        : null
    await vipMutation.mutateAsync({
      id: selected.id,
      data: {
        expiresAt,
        addDays,
        note: vipForm.note || null,
      },
    })
    await refresh()
    resetVip()
  }

  const handleDelete = async (user: UserPayload) => {
    const ok = window.confirm(`Delete user "${user.username}"?`)
    if (!ok) return
    await deleteMutation.mutateAsync(user.id)
    await refresh()
  }

  const handleBanToggle = async (user: UserPayload) => {
    if (user.status === 'BANNED') {
      await unbanMutation.mutateAsync(user.id)
    } else {
      await banMutation.mutateAsync(user.id)
    }
    await refresh()
  }

  const toLocalInput = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 16)
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString()
  }

  return (
    <section className="stack">
      <div className="section-header">
        <h2>Quản lí người dùng</h2>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Tạo người dùng mới
        </Button>
      </div>

      <div className="card">
        <h3>Tất cả người dùng</h3>
        <div className="filter-bar">
          <input
            placeholder="Search username"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
          />
          <select
            value={lastLoginFilter}
            onChange={(event) => {
              setLastLoginFilter(event.target.value)
              setPage(0)
            }}
          >
            <option value="any">Đăng nhập lần cuối: Tất cả</option>
            <option value="24h">Đăng nhập lần cuối: 24h</option>
            <option value="7d">Đăng nhập lần cuối: 7 ngày</option>
            <option value="30d">Đăng nhập lần cuối: 30 ngày</option>
            <option value="never">Đăng nhập lần cuối: Chưa đăng nhập</option>
          </select>
          <input
            type="number"
            min={0}
            placeholder="VIP expires in <= days"
            value={vipFilterDays}
            onChange={(event) => {
              setVipFilterDays(event.target.value)
              setPage(0)
            }}
          />
        </div>
        {usersQuery.isLoading ? (
          <p className="muted">Đang tải...</p>
        ) : hasUsers ? (
          <Table
            header={
              <tr>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày hết hạn VIP</th>
                <th>Đăng nhập lần cuối</th>
                <th>Hành động</th>
              </tr>
            }
            body={pagedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{formatDate(user.vipExpiresAt)}</td>
                <td>{formatDate(user.lastLoginAt)}</td>
                <td>
                  <div className="actions">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelected(user)
                        setEditForm({
                          username: user.username,
                          status: user.status,
                        })
                        setIsEditOpen(true)
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelected(user)
                        setVipForm({
                          expiresAt: toLocalInput(user.vipExpiresAt) || undefined,
                          note: user.vipNote ?? '',
                        })
                        setIsVipOpen(true)
                      }}
                    >
                      VIP
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleBanToggle(user)}>
                      {user.status === 'BANNED' ? 'Unban' : 'Ban'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDelete(user)}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">Chưa có người dùng.</p>
        )}
        {totalPages > 1 ? (
          <div className="pagination">
            <button
              type="button"
              className="ghost-button"
              disabled={safePage <= 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Trước
            </button>
            <label className="page-input">
              Trang
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
              Sau
            </button>
          </div>
        ) : null}
      </div>

      <Modal open={isCreateOpen} title="Create user" onClose={resetCreate}>
        <form className="form" onSubmit={handleCreate}>
          <label className="field">
            Tên đăng nhập
            <input
              value={createForm.username}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>
          <label className="field">
            Mật khẩu
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <div className="actions">
            <Button type="submit" disabled={createMutation.isPending}>
              Tạo mới
            </Button>
            <Button type="button" variant="secondary" onClick={resetCreate}>
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditOpen} title="Edit user" onClose={resetEdit}>
        <form className="form" onSubmit={handleEdit}>
          <label className="field">
            Tên đăng nhập
            <input
              value={editForm.username ?? ''}
              onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>
          <label className="field">
            Mật khẩu
            <input
              type="password"
              value={editForm.password ?? ''}
              onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <label className="field">
            Trạng thái
            <select
              value={editForm.status ?? 'ACTIVE'}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: event.target.value as UserUpdatePayload['status'],
                }))
              }
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="BANNED">Đã cấm</option>
            </select>
          </label>
          <div className="actions">
            <Button type="submit" disabled={updateMutation.isPending}>
              Lưu
            </Button>
            <Button type="button" variant="secondary" onClick={resetEdit}>
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isVipOpen} title="Update VIP" onClose={resetVip}>
        <form className="form" onSubmit={handleVip}>
          <label className="field">
            Hết hạn vào lúc
            <input
              type="datetime-local"
              value={vipForm.expiresAt ?? ''}
              onChange={(event) => setVipForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </label>
          <label className="field">
            Thêm ngày
            <input
              type="number"
              min={1}
              value={vipForm.addDays ?? ''}
              onChange={(event) =>
                setVipForm((prev) => ({
                  ...prev,
                  addDays: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
          </label>
          <label className="field">
            Ghi chú
            <input
              value={vipForm.note ?? ''}
              onChange={(event) => setVipForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </label>
          <div className="actions">
            <Button type="submit" disabled={vipMutation.isPending}>
              Lưu
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVipForm({ expiresAt: '', addDays: undefined, note: '' })}
            >
              Xóa VIP
            </Button>
            <Button type="button" variant="secondary" onClick={resetVip}>
              Hủy
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
