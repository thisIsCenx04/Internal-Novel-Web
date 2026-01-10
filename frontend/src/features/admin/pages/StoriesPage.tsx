import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Table } from '../../../shared/components/Table'
import { deleteStory, fetchStories, type StoryPayload } from '../api/storyApi'
import { fetchCategories } from '../api/categoryApi'

export function StoriesPage() {
  const navigate = useNavigate()
  const PAGE_SIZE = 10
  const storiesQuery = useQuery({
    queryKey: ['admin-stories'],
    queryFn: fetchStories,
  })
  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  })
  const [viewing, setViewing] = useState<StoryPayload | null>(null)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [page, setPage] = useState(0)

  const filteredStories = useMemo(() => {
    const list = storiesQuery.data ?? []
    const query = search.trim().toLowerCase()
    return list.filter((story) => {
      const matchesSearch =
        !query ||
        story.title.toLowerCase().includes(query) ||
        story.slug.toLowerCase().includes(query)
      const matchesCategory =
        categoryId === 'all' || story.categories.some((category) => category.id === categoryId)
      return matchesSearch && matchesCategory
    })
  }, [storiesQuery.data, search, categoryId])

  const totalPages = Math.max(Math.ceil(filteredStories.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const pagedStories = filteredStories.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hasStories = Boolean(pagedStories.length)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const deleteMutation = useMutation({ mutationFn: deleteStory })

  const handleDelete = async (story: StoryPayload) => {
    const confirmed = window.confirm(`Delete "${story.title}"?`)
    if (!confirmed) return
    await deleteMutation.mutateAsync(story.id)
    await storiesQuery.refetch()
  }

  return (
    <section className="stack">
      <h2>Quản lí truyện</h2>
      <div className="card">
        <div className="story-list__header">
          <h3>Tất cả truyện</h3>
          <Button type="button" onClick={() => navigate('/admin/stories/new')}>
            Tạo truyện mới
          </Button>
        </div>
        <div className="filter-bar">
          <input
            placeholder="Nhập tên hoặc thẻ slug"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
          />
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setPage(0)
            }}
          >
            <option value="all">Tất cả thể loại</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {storiesQuery.isLoading ? (
          <p className="muted">Đang tải...</p>
        ) : hasStories ? (
          <Table
            header={
              <tr>
                <th>Tên</th>
                <th>Thẻ slug</th>
                <th>Thể loại</th>
                <th>Hiển thị</th>
                <th>Hành động</th>
              </tr>
            }
            body={pagedStories.map((story) => (
              <tr key={story.id}>
                <td>
                  <strong>{story.title}</strong>
                </td>
                <td className="muted">{story.slug}</td>
                <td>
                  {story.categories.length ? (
                    <div className="tag-select">
                      {story.categories.map((category) => (
                        <span key={category.id} className="tag-chip tag-chip--active">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">Chưa có thể loại</span>
                  )}
                </td>
                <td>
                  <span>{story.isVisible ? 'Yes' : 'No'}</span>
                </td>
                <td>
                  <div className="actions">
                    <Button type="button" variant="secondary" onClick={() => setViewing(story)}>
                      Xem
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/admin/stories/${story.id}/chapters`)}
                    >
                      Quản lí chương
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/admin/stories/${story.id}/edit`)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDelete(story)}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">Chưa có truyện.</p>
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
      <Modal
        open={Boolean(viewing)}
        title={viewing?.title || 'Story'}
        onClose={() => setViewing(null)}
      >
        {viewing ? (
          <div className="story-view">
            <div className="story-view__meta">
              <span className="story-view__label">Thẻ slug</span>
              <span className="story-view__value">{viewing.slug}</span>
            </div>
            <div className="story-view__meta">
              <span className="story-view__label">Hiển thị</span>
              <span className={`story-view__status ${viewing.isVisible ? 'is-on' : 'is-off'}`}>
                {viewing.isVisible ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="story-view__meta story-view__block">
              <span className="story-view__label">Thể loại</span>
              {viewing.categories.length ? (
                <div className="tag-select">
                  {viewing.categories.map((category) => (
                    <span key={category.id} className="tag-chip tag-chip--active">
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="muted">Chưa có thể loại</span>
              )}
            </div>
            <div className="story-view__meta story-view__block">
              <span className="story-view__label">Mô tả</span>
              <p className="story-view__description">
                {viewing.description || 'No description yet.'}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
