import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import {
  createStory,
  fetchStoryById,
  updateStory,
  type StoryUpsert,
} from '../api/storyApi'

const emptyForm: StoryUpsert = {
  title: '',
  description: '',
  coverUrl: '',
  isVisible: true,
}

export function StoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<StoryUpsert>(emptyForm)

  const storyQuery = useQuery({
    queryKey: ['admin-story', id],
    queryFn: () => fetchStoryById(id as string),
    enabled: isEdit,
  })

  useEffect(() => {
    if (storyQuery.data) {
      setForm({
        title: storyQuery.data.title,
        description: storyQuery.data.description || '',
        coverUrl: storyQuery.data.coverUrl || '',
        isVisible: storyQuery.data.isVisible,
      })
    }
  }, [storyQuery.data])

  const createMutation = useMutation({ mutationFn: createStory })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StoryUpsert }) =>
      updateStory(id, payload),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isEdit) {
      await updateMutation.mutateAsync({ id: id as string, payload: form })
    } else {
      await createMutation.mutateAsync(form)
    }
    navigate('/admin/stories')
  }

  return (
    <section className="stack">
      <h2>{isEdit ? 'Edit story' : 'Create story'}</h2>
      <div className="card form">
        {storyQuery.isLoading ? (
          <p className="muted">Loading...</p>
        ) : storyQuery.isError ? (
          <p className="muted">Story not found.</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="field">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <label className="field">
              Cover URL
              <input
                value={form.coverUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
              />
            </label>
            <label className="field">
              Visible
              <select
                value={form.isVisible ? 'true' : 'false'}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isVisible: event.target.value === 'true' }))
                }
              >
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </label>
            <div className="actions">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/stories')}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
