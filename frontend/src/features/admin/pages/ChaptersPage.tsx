import { useEffect, useMemo, useState } from 'react'
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
const PAGE_SIZE = 10

export function ChaptersPage() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<ChapterUpsert>(emptyForm)
  const [editing, setEditing] = useState<ChapterPayload | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const chaptersQuery = useQuery({
    queryKey: ['admin-chapters', storyId],
    queryFn: () => fetchChapters(storyId || ''),
    enabled: Boolean(storyId),
  })

  const filteredChapters = useMemo(() => {
    const list = chaptersQuery.data ?? []
    const query = search.trim().toLowerCase()
    return list.filter((chapter) => {
      if (!query) return true
      const titleMatch = (chapter.title || '').toLowerCase().includes(query)
      const noMatch = `#${chapter.chapterNo}`.includes(query)
      return titleMatch || noMatch
    })
  }, [chaptersQuery.data, search])

  const totalPages = Math.max(Math.ceil(filteredChapters.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const pagedChapters = filteredChapters.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  )
  const hasChapters = Boolean(pagedChapters.length)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

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

  const getNextChapterNo = () => {
    const list = chaptersQuery.data ?? []
    if (!list.length) return 1
    const maxNo = Math.max(...list.map((chapter) => chapter.chapterNo))
    return maxNo + 1
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
        <h2>Quản lí chương</h2>
        <div className="actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/stories')}
          >
            Trở về danh sách truyện
          </Button>
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm({ ...emptyForm, chapterNo: getNextChapterNo() })
              setIsModalOpen(true)
            }}
          >
            Tạo chương mới
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="story-list__header">
          <h3>Tất cả chương</h3>
        </div>
        <div className="filter-bar">
          <input
            placeholder="Search chapter"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
          />
        </div>
        {chaptersQuery.isLoading ? (
          <p className="muted">Đang tải...</p>
        ) : hasChapters ? (
          <Table
            header={
              <tr>
                <th>Stt</th>
                <th>Tên</th>
                <th>Hiển thị</th>
                <th>Ngày đăng</th>
                <th>Hành động</th>
              </tr>
            }
            body={pagedChapters.map((chapter) => (
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
                      Sửa
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleDelete(chapter)}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : (
          <p className="muted">Chưa có chương.</p>
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
        open={isModalOpen}
        title={editing ? `Edit chapter ${editing.chapterNo}` : 'Create chapter'}
        onClose={resetForm}
      >
        {isDetailLoading ? (
          <p className="muted">Đang tải...</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              Chương số
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
              Tên
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="field">
              Nội dung
              <textarea
                rows={6}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </label>
            <label className="field">
              Hiển thị
              <select
                value={form.isVisible ? 'true' : 'false'}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isVisible: event.target.value === 'true' }))
                }
              >
                <option value="true">Hiện</option>
                <option value="false">Ẩn</option>
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
