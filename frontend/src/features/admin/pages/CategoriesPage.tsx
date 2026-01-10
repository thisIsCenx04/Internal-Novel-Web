import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { Table } from '../../../shared/components/Table'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  type CategoryPayload,
} from '../api/categoryApi'
import { Modal } from '../../../shared/components/Modal'

export function CategoriesPage() {
  const PAGE_SIZE = 10
  const [name, setName] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  })

  const filteredCategories = useMemo(() => {
    const list = categoriesQuery.data ?? []
    const query = search.trim().toLowerCase()
    return list.filter((category) => !query || category.name.toLowerCase().includes(query))
  }, [categoriesQuery.data, search])

  const totalPages = Math.max(Math.ceil(filteredCategories.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const pagedCategories = filteredCategories.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  )
  const hasCategories = Boolean(pagedCategories.length)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const createMutation = useMutation({ mutationFn: (value: string) => createCategory(value) })
  const deleteMutation = useMutation({ mutationFn: deleteCategory })

  const reset = () => {
    setName('')
    setIsCreateOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    await createMutation.mutateAsync(name.trim())
    await categoriesQuery.refetch()
    reset()
  }

  const handleDelete = async (category: CategoryPayload) => {
    const ok = window.confirm(`Delete category "${category.name}"?`)
    if (!ok) return
    await deleteMutation.mutateAsync(category.id)
    await categoriesQuery.refetch()
  }

  return (
    <section className="stack">
      <div className="section-header">
        <h2>Quản lí thể loại</h2>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Tạo thể loại mới
        </Button>
      </div>

      <div className="card">
        <h3>Tất cả thể loại</h3>
        <div className="filter-bar">
          <input
            placeholder="Search category"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
          />
        </div>
        {categoriesQuery.isLoading ? (
          <p className="muted">Đang tải...</p>
        ) : hasCategories ? (
          <Table
            header={
              <tr>
                <th>Tên</th>
                <th>Thẻ slug</th>
                <th>Hành động</th>
              </tr>
            }
            body={pagedCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <strong>{category.name}</strong>
                </td>
                <td className="muted">{category.slug}</td>
                <td>
                  <div className="actions">
                    <Button type="button" variant="secondary" onClick={() => handleDelete(category)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">Chưa có thể loại.</p>
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

      <Modal open={isCreateOpen} title="Create category" onClose={reset}>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            Tên
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="actions">
            <Button type="submit" disabled={createMutation.isPending}>
              Tạo mới
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Hủy
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
