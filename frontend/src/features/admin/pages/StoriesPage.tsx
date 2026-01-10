import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Table } from '../../../shared/components/Table'
import { deleteStory, fetchStories, type StoryPayload } from '../api/storyApi'

export function StoriesPage() {
  const navigate = useNavigate()
  const storiesQuery = useQuery({
    queryKey: ['admin-stories'],
    queryFn: fetchStories,
  })
  const [viewing, setViewing] = useState<StoryPayload | null>(null)

  const hasStories = useMemo(
    () => Boolean(storiesQuery.data && storiesQuery.data.length),
    [storiesQuery.data],
  )

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
            body={(storiesQuery.data ?? []).map((story) => (
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
