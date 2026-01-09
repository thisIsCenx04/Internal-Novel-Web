import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchStoryDetail } from '../api/storyApi'

export function StoryDetailPage() {
  const { slug } = useParams()
  const storyQuery = useQuery({
    queryKey: ['story-detail', slug],
    queryFn: () => fetchStoryDetail(slug || ''),
    enabled: Boolean(slug),
  })

  if (storyQuery.isLoading) {
    return <p className="muted">Loading...</p>
  }

  if (!storyQuery.data) {
    return <p className="muted">Story not found.</p>
  }

  const story = storyQuery.data

  return (
    <section className="reader-page">
      <div className="reader-hero">
        <div className="reader-hero__cover">
          {story.coverUrl ? <img src={story.coverUrl} alt={story.title} /> : null}
        </div>
        <div>
          <h2>{story.title}</h2>
          <p className="muted">{story.description || 'Mo ta dang cap nhat.'}</p>
        </div>
      </div>

      <div className="reader-body">
        <aside className="chapter-card">
          <div className="chapter-card__header">
            <h3>Danh sach chuong</h3>
            <input type="search" placeholder="Ten chuong..." />
          </div>
          <div className="chapter-list">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={`chapter-${index}`} className="chapter-item">
                <span>Chuong {index + 1}: Chuong mau</span>
                <button type="button" className="ghost-button">
                  Doc
                </button>
              </div>
            ))}
          </div>
        </aside>
        <article className="reader-content">
          <h3>Chuong 1: Chuong mau</h3>
          <p>
            Noi dung chuong se hien thi tai day. Day la phan doc truc tiep sau khi bam
            vao truyen.
          </p>
        </article>
      </div>
    </section>
  )
}
