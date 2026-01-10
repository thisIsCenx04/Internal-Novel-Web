import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Table } from '../../../shared/components/Table'
import { deleteStory, fetchStories, type StoryPayload } from '../api/storyApi'
import { fetchCategories } from '../api/categoryApi'

export function StoriesPage() {
  const navigate = useNavigate()
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

  const hasStories = Boolean(filteredStories.length)

  const deleteMutation = useMutation({ mutationFn: deleteStory })

  const handleDelete = async (story: StoryPayload) => {
    const confirmed = window.confirm(`Delete "${story.title}"?`)
    if (!confirmed) return
    await deleteMutation.mutateAsync(story.id)
    await storiesQuery.refetch()
  }

  return (
    <section className="stack">
      <h2>Stories</h2>
      <div className="card">
        <div className="story-list__header">
          <h3>All stories</h3>
          <Button type="button" onClick={() => navigate('/admin/stories/new')}>
            Create story
          </Button>
        </div>
        <div className="filter-bar">
          <input
            placeholder="Search title or slug"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="all">All categories</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {storiesQuery.isLoading ? (
          <p className="muted">Loading...</p>
        ) : hasStories ? (
          <Table
            header={
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Categories</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            }
            body={filteredStories.map((story) => (
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
                    <span className="muted">No categories</span>
                  )}
                </td>
                <td>
                  <span>{story.isVisible ? 'Yes' : 'No'}</span>
                </td>
                <td>
                  <div className="actions">
                    <Button type="button" variant="secondary" onClick={() => setViewing(story)}>
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/admin/stories/${story.id}/chapters`)}
                    >
                      Chapters
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/admin/stories/${story.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDelete(story)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">No stories yet.</p>
        )}
      </div>
      <Modal
        open={Boolean(viewing)}
        title={viewing?.title || 'Story'}
        onClose={() => setViewing(null)}
      >
        {viewing ? (
          <div className="stack">
            <p className="muted">Slug: {viewing.slug}</p>
            <p>{viewing.description || 'No description yet.'}</p>
            <p className="muted">Visible: {viewing.isVisible ? 'Yes' : 'No'}</p>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
