import { useMemo, useState } from 'react'
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

  const hasUsers = Boolean(filteredUsers.length)

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
        <h2>Users</h2>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Create user
        </Button>
      </div>

      <div className="card">
        <h3>All users</h3>
        <div className="filter-bar">
          <input
            placeholder="Search username"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={lastLoginFilter}
            onChange={(event) => setLastLoginFilter(event.target.value)}
          >
            <option value="any">Last login: Any</option>
            <option value="24h">Last login: 24h</option>
            <option value="7d">Last login: 7 days</option>
            <option value="30d">Last login: 30 days</option>
            <option value="never">Last login: Never</option>
          </select>
          <input
            type="number"
            min={0}
            placeholder="VIP expires in <= days"
            value={vipFilterDays}
            onChange={(event) => setVipFilterDays(event.target.value)}
          />
        </div>
        {usersQuery.isLoading ? (
          <p className="muted">Loading...</p>
        ) : hasUsers ? (
          <Table
            header={
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>VIP expires</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            }
            body={filteredUsers.map((user) => (
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
                      Edit
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
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">No users yet.</p>
        )}
      </div>

      <Modal open={isCreateOpen} title="Create user" onClose={resetCreate}>
        <form className="form" onSubmit={handleCreate}>
          <label className="field">
            Username
            <input
              value={createForm.username}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <div className="actions">
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
            <Button type="button" variant="secondary" onClick={resetCreate}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditOpen} title="Edit user" onClose={resetEdit}>
        <form className="form" onSubmit={handleEdit}>
          <label className="field">
            Username
            <input
              value={editForm.username ?? ''}
              onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>
          <label className="field">
            Password (optional)
            <input
              type="password"
              value={editForm.password ?? ''}
              onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <label className="field">
            Status
            <select
              value={editForm.status ?? 'ACTIVE'}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: event.target.value as UserUpdatePayload['status'],
                }))
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="BANNED">BANNED</option>
            </select>
          </label>
          <div className="actions">
            <Button type="submit" disabled={updateMutation.isPending}>
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={resetEdit}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isVipOpen} title="Update VIP" onClose={resetVip}>
        <form className="form" onSubmit={handleVip}>
          <label className="field">
            Expires at
            <input
              type="datetime-local"
              value={vipForm.expiresAt ?? ''}
              onChange={(event) => setVipForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </label>
          <label className="field">
            Add days
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
            Note
            <input
              value={vipForm.note ?? ''}
              onChange={(event) => setVipForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </label>
          <div className="actions">
            <Button type="submit" disabled={vipMutation.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVipForm({ expiresAt: '', addDays: undefined, note: '' })}
            >
              Clear VIP
            </Button>
            <Button type="button" variant="secondary" onClick={resetVip}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
