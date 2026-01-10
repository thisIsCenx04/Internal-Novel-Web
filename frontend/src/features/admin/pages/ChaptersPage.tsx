import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Table } from '../../../shared/components/Table'
import {
  createChapter,
  deleteChapter,
  fetchChapterContent,
  fetchChapters,
  updateChapter,
  type ChapterPayload,
  type ChapterUpsert,
} from '../api/chapterApi'

const emptyForm: ChapterUpsert = {
  chapterNo: 1,
  title: '',
  content: '',
  isVisible: true,
}

export function ChaptersPage() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<ChapterUpsert>(emptyForm)
  const [editing, setEditing] = useState<ChapterPayload | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const chaptersQuery = useQuery({
    queryKey: ['admin-chapters', storyId],
    queryFn: () => fetchChapters(storyId || ''),
    enabled: Boolean(storyId),
  })

  const hasChapters = useMemo(
    () => Boolean(chaptersQuery.data && chaptersQuery.data.length),
    [chaptersQuery.data],
  )

  const createMutation = useMutation({
    mutationFn: (payload: ChapterUpsert) => createChapter(storyId || '', payload),
  })
  const updateMutation = useMutation({
    mutationFn: (payload: ChapterUpsert) =>
      updateChapter(storyId || '', editing?.id || '', payload),
  })
  const deleteMutation = useMutation({
    mutationFn: (chapterId: string) => deleteChapter(storyId || '', chapterId),
  })

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm)
    setIsModalOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!storyId) return
    if (editing) {
      await updateMutation.mutateAsync(form)
    } else {
      await createMutation.mutateAsync(form)
    }
    await chaptersQuery.refetch()
    resetForm()
  }

  const handleEdit = async (chapter: ChapterPayload) => {
    if (!storyId) return
    setIsModalOpen(true)
    setIsDetailLoading(true)
    const detail = await fetchChapterContent(storyId, chapter.id)
    setEditing(chapter)
    setForm({
      chapterNo: detail.chapterNo,
      title: detail.title || '',
      content: detail.content || '',
      isVisible: detail.isVisible,
    })
    setIsDetailLoading(false)
  }

  const handleDelete = async (chapter: ChapterPayload) => {
    const ok = window.confirm(`Delete chapter ${chapter.chapterNo}?`)
    if (!ok) return
    await deleteMutation.mutateAsync(chapter.id)
    await chaptersQuery.refetch()
  }

  return (
    <section className="stack">
      <div className="story-list__header">
        <h2>Chapters</h2>
        <div className="actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/stories')}
          >
            Back to stories
          </Button>
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm(emptyForm)
              setIsModalOpen(true)
            }}
          >
            Create chapter
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="story-list__header">
          <h3>All chapters</h3>
        </div>
        {chaptersQuery.isLoading ? (
          <p className="muted">Loading...</p>
        ) : hasChapters ? (
          <Table
            header={
              <tr>
                <th>No</th>
                <th>Title</th>
                <th>Visible</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            }
            body={(chaptersQuery.data ?? []).map((chapter) => (
              <tr key={chapter.id}>
                <td>
                  <strong>#{chapter.chapterNo}</strong>
                </td>
                <td>{chapter.title || 'Untitled'}</td>
                <td>{chapter.isVisible ? 'Yes' : 'No'}</td>
                <td className="muted">
                  {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleString() : '-'}
                </td>
                <td>
                  <div className="actions">
                    <Button type="button" variant="secondary" onClick={() => handleEdit(chapter)}>
                      Edit
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDelete(chapter)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">No chapters yet.</p>
        )}
      </div>

      <Modal
        open={isModalOpen}
        title={editing ? `Edit chapter ${editing.chapterNo}` : 'Create chapter'}
        onClose={resetForm}
      >
        {isDetailLoading ? (
          <p className="muted">Loading...</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              Chapter no
              <input
                type="number"
                min={1}
                value={form.chapterNo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, chapterNo: Number(event.target.value) }))
                }
              />
            </label>
            <label className="field">
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="field">
              Content
              <textarea
                rows={6}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
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
                {editing ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  )
}
