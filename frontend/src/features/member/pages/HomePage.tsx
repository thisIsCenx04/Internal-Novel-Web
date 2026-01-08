import { useQuery } from '@tanstack/react-query'
import api from '../../../shared/api/httpClient'

type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string | null
}

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/api/health')
      return res.data as ApiResponse<string>
    },
  })

  return (
    <section className="stack">
      <h2>Home</h2>
      <p className="muted">
        Backend health:{' '}
        {isLoading ? '...' : isError ? 'failed' : data?.data ?? 'unknown'}
      </p>
      <div className="card">
        <h3>Newest stories</h3>
        <p className="muted">Module0 placeholder.</p>
      </div>
    </section>
  )
}
