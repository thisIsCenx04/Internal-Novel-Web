import { useMemo, useState } from 'react'
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
  const [name, setName] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  })

  const filteredCategories = useMemo(() => {
    const list = categoriesQuery.data ?? []
    const query = search.trim().toLowerCase()
    return list.filter((category) => !query || category.name.toLowerCase().includes(query))
  }, [categoriesQuery.data, search])

  const hasCategories = Boolean(filteredCategories.length)

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
        <h2>Categories</h2>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Create category
        </Button>
      </div>

      <div className="card">
        <h3>All categories</h3>
        <div className="filter-bar">
          <input
            placeholder="Search category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {categoriesQuery.isLoading ? (
          <p className="muted">Loading...</p>
        ) : hasCategories ? (
          <Table
            header={
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            }
            body={filteredCategories.map((category) => (
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
          <p className="muted">No categories yet.</p>
        )}
      </div>

      <Modal open={isCreateOpen} title="Create category" onClose={reset}>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="actions">
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
