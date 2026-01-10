import api from '../../../shared/api/httpClient'

export type ChapterPayload = {
  id: string
  chapterNo: number
  title: string | null
  isVisible: boolean
  publishedAt: string
}

export type ChapterUpsert = {
  chapterNo: number
  title: string
  content: string
  isVisible: boolean
  publishedAt?: string
}

export async function fetchChapters(storyId: string): Promise<ChapterPayload[]> {
  const res = await api.get(`/api/admin/stories/${storyId}/chapters`)
  return res.data?.data as ChapterPayload[]
}

export async function createChapter(
  storyId: string,
  payload: ChapterUpsert,
): Promise<ChapterPayload> {
  const res = await api.post(`/api/admin/stories/${storyId}/chapters`, payload)
  return res.data?.data as ChapterPayload
}

export async function updateChapter(
  storyId: string,
  chapterId: string,
  payload: ChapterUpsert,
): Promise<ChapterPayload> {
  const res = await api.put(
    `/api/admin/stories/${storyId}/chapters/${chapterId}`,
    payload,
  )
  return res.data?.data as ChapterPayload
}

export async function fetchChapterContent(
  storyId: string,
  chapterId: string,
): Promise<{ content: string; title: string | null; chapterNo: number; isVisible: boolean }> {
  const res = await api.get(`/api/admin/stories/${storyId}/chapters/${chapterId}`)
  return res.data?.data as {
    content: string
    title: string | null
    chapterNo: number
    isVisible: boolean
  }
}

export async function deleteChapter(storyId: string, chapterId: string): Promise<void> {
  await api.delete(`/api/admin/stories/${storyId}/chapters/${chapterId}`)
}
