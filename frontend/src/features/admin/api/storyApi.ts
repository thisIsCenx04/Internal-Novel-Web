import api from '../../../shared/api/httpClient'

export type StoryPayload = {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  isVisible: boolean
}

export type StoryUpsert = {
  title: string
  description: string
  coverUrl: string
  isVisible: boolean
}

export async function fetchStories(): Promise<StoryPayload[]> {
  const res = await api.get('/api/admin/stories')
  return res.data?.data as StoryPayload[]
}

export async function createStory(payload: StoryUpsert): Promise<StoryPayload> {
  const res = await api.post('/api/admin/stories', payload)
  return res.data?.data as StoryPayload
}

export async function fetchStoryById(id: string): Promise<StoryPayload> {
  const res = await api.get(`/api/admin/stories/${id}`)
  return res.data?.data as StoryPayload
}

export async function updateStory(id: string, payload: StoryUpsert): Promise<StoryPayload> {
  const res = await api.put(`/api/admin/stories/${id}`, payload)
  return res.data?.data as StoryPayload
}

export async function deleteStory(id: string): Promise<void> {
  await api.delete(`/api/admin/stories/${id}`)
}
