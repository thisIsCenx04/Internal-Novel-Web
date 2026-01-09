import api from '../../../shared/api/httpClient'

export type StorySummary = {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  isVisible: boolean
}

export type StoryDetail = StorySummary

export async function fetchNewestStories(): Promise<StorySummary[]> {
  const res = await api.get('/api/member/stories')
  return res.data?.data as StorySummary[]
}

export async function fetchStoryDetail(slug: string): Promise<StoryDetail> {
  const res = await api.get(`/api/member/stories/${slug}`)
  return res.data?.data as StoryDetail
}
