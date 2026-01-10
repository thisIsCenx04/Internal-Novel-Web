import api from '../../../shared/api/httpClient'

export type DashboardTimeSeriesPoint = {
  bucket: string
  total: number
}

export type DashboardTopStory = {
  storyId: string
  title: string
  slug: string
  views: number
}

export type DashboardOverview = {
  totalViews: number
  activeUsers: number
  totalUsers: number
  totalStories: number
  viewsByDay: DashboardTimeSeriesPoint[]
  viewsByWeek: DashboardTimeSeriesPoint[]
  viewsByMonth: DashboardTimeSeriesPoint[]
  topStories: DashboardTopStory[]
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await api.get('/api/admin/dashboard/overview')
  return res.data?.data as DashboardOverview
}
