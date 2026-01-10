import api from '../../../shared/api/httpClient'

export type StorySummary = {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  isVisible: boolean
  categories: CategorySummary[]
  createdAt: string | null
  viewCount: number
}

export type CategorySummary = {
  id: string
  name: string
  slug: string
}

export type ChapterSummary = {
  id: string
  chapterNo: number
  title: string | null
  isVisible: boolean
  publishedAt: string
}

export type StoryDetail = {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  categories: CategorySummary[]
  chapters: ChapterSummary[]
}

export type ChapterContent = {
  id: string
  storyId: string
  chapterNo: number
  title: string | null
  content: string
  publishedAt: string
}

export type ReadingSession = {
  sessionReadingId: string
  allowNextAt: string
}

export type NextChapterResult = {
  allowed: boolean
  remainingSeconds: number
  allowNextAt: string
}

export async function fetchNewestStories(): Promise<StorySummary[]> {
  const res = await api.get('/api/member/stories')
  return res.data?.data as StorySummary[]
}

export async function fetchStoryDetail(slug: string): Promise<StoryDetail> {
  const res = await api.get(`/api/member/stories/${slug}`)
  return res.data?.data as StoryDetail
}

export async function fetchChapterContent(chapterId: string): Promise<ChapterContent> {
  const res = await api.get(`/api/member/chapters/${chapterId}`)
  return res.data?.data as ChapterContent
}

export async function openReadingSession(chapterId: string): Promise<ReadingSession> {
  const res = await api.post('/api/member/reader/open', { chapterId })
  return res.data?.data as ReadingSession
}

export async function requestNextChapter(sessionReadingId: string): Promise<NextChapterResult> {
  const res = await api.post('/api/member/reader/next', { sessionReadingId })
  return res.data?.data as NextChapterResult
}

export async function reportCopyAttempt(payload: {
  storyId?: string
  chapterId?: string
}): Promise<void> {
  await api.post('/api/member/audit/copy-attempt', payload)
}
