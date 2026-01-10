import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table } from '../../../shared/components/Table'
import {
  fetchDashboardOverview,
  type DashboardTimeSeriesPoint,
  type DashboardTopStory,
} from '../api/dashboardApi'

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

const barMax = (data: DashboardTimeSeriesPoint[]) =>
  data.reduce((max, point) => Math.max(max, point.total), 1)

function BarChart({ data }: { data: DashboardTimeSeriesPoint[] }) {
  const maxValue = barMax(data)
  return (
    <div className="chart-bars">
      {data.map((point) => (
        <div key={point.bucket} className="chart-bar">
          <div
            className="chart-bar__fill"
            style={{ height: `${Math.max((point.total / maxValue) * 100, 6)}%` }}
          />
          <span className="chart-bar__label">{point.bucket}</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ active, total }: { active: number; total: number }) {
  const inactive = Math.max(total - active, 0)
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0
  const inactivePercent = total > 0 ? 100 - activePercent : 0
  return (
    <div className="pie-chart">
      <div
        className="pie-chart__circle"
        style={{
          background: `conic-gradient(#c96b32 0 ${activePercent}%, #ead4be ${activePercent}% 100%)`,
        }}
      />
      <div className="pie-legend">
        <div>
          <span className="pie-legend__dot pie-legend__dot--active" />
          Online: {formatNumber(active)}
        </div>
        <div>
          <span className="pie-legend__dot pie-legend__dot--inactive" />
          Offline: {formatNumber(inactive)}
        </div>
        <div className="muted">
          {activePercent}% online / {inactivePercent}% offline
        </div>
      </div>
    </div>
  )
}

type ChartConfig =
  | { title: string; type: 'bar'; data: DashboardTimeSeriesPoint[] }
  | { title: string; type: 'top'; data: DashboardTopStory[] }
  | { title: string; type: 'pie' }
  | null

export function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardOverview,
  })

  const data = overviewQuery.data
  const [metric, setMetric] = useState('views-day')

  const chartConfig = useMemo<ChartConfig>(() => {
    if (!data) return null
    switch (metric) {
      case 'views-week':
        return { title: 'Xem theo tuần (12 tuần gần đây)', type: 'bar', data: data.viewsByWeek }
      case 'views-month':
        return { title: 'Xem theo tháng (12 tháng gần đây)', type: 'bar', data: data.viewsByMonth }
      case 'top-stories':
        return { title: 'Top truyện (theo views)', type: 'top', data: data.topStories }
      case 'user-activity':
        return { title: 'Hoạt động của người dùng', type: 'pie' }
      default:
        return { title: 'Xem theo ngày (14 ngày gần đây)', type: 'bar', data: data.viewsByDay }
    }
  }, [data, metric])

  return (
    <section className="stack">
      <h2>Thống kê</h2>
      {overviewQuery.isLoading ? (
        <div className="card">
          <p className="muted">Đang tải thống kê...</p>
        </div>
      ) : data ? (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-card__label">Tống số lượt xem</div>
              <div className="stat-card__value">{formatNumber(data.totalViews)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Số người dùng đang hoạt động (30m)</div>
              <div className="stat-card__value">{formatNumber(data.activeUsers)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Tổng số người dùng</div>
              <div className="stat-card__value">{formatNumber(data.totalUsers)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Tổng số truyện</div>
              <div className="stat-card__value">{formatNumber(data.totalStories)}</div>
            </div>
          </div>

          <div className="card chart-panel">
            <div className="panel-header">
              <h3>{chartConfig?.title}</h3>
              <select value={metric} onChange={(event) => setMetric(event.target.value)}>
                <option value="views-day">Xem theo ngày</option>
                <option value="views-week">Xem theo tuần</option>
                <option value="views-month">Xem theo tháng</option>
                <option value="top-stories">Top truyện</option>
                <option value="user-activity">Hoạt động của người dùng</option>
              </select>
            </div>
            {chartConfig?.type === 'bar' && chartConfig.data ? (
              <>
                <BarChart data={chartConfig.data} />
                <Table
                  header={
                    <tr>
                      <th>Bucket</th>
                      <th>Số lượt xem</th>
                    </tr>
                  }
                  body={chartConfig.data.map((point) => (
                    <tr key={point.bucket}>
                      <td>{point.bucket}</td>
                      <td>{formatNumber(point.total)}</td>
                    </tr>
                  ))}
                />
              </>
            ) : null}
            {chartConfig?.type === 'top' ? (
              <Table
                header={
                  <tr>
                    <th>Truyện</th>
                    <th>Thẻ slug</th>
                    <th>Số lượt xem</th>
                  </tr>
                }
                body={chartConfig.data.map((story) => (
                  <tr key={story.storyId}>
                    <td>{story.title}</td>
                    <td className="muted">{story.slug}</td>
                    <td>{formatNumber(story.views)}</td>
                  </tr>
                ))}
              />
            ) : null}
            {chartConfig?.type === 'pie' ? (
              <PieChart active={data.activeUsers} total={data.totalUsers} />
            ) : null}
          </div>
        </>
      ) : (
        <div className="card">
          <p className="muted">Chưa có phân tích dữ liệu.</p>
        </div>
      )}
    </section>
  )
}
