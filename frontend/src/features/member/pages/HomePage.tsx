import { useQuery } from '@tanstack/react-query'

import httpClient from '../../../shared/api/httpClient'

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ping'],
    queryFn: async () => {
      const response = await httpClient.get<{ data: { status: string } }>('/api/public/ping')
      return response.data
    },
  })

  return (
    <section className="card">
      <h1>Foundation ready</h1>
      <p>Backend ping status:</p>
      {isLoading && <div className="status">Loading...</div>}
      {isError && <div className="alert">Ping failed</div>}
      {data && <div className="status">{data.data.status}</div>}
    </section>
  )
}