import { useQuery } from '@tanstack/react-query'
import { fetchNewestStories } from '../api/storyApi'
import { StoryCard } from '../components/StoryCard'

export function HomePage() {
  const storiesQuery = useQuery({
    queryKey: ['newest-stories'],
    queryFn: fetchNewestStories,
  })

  return (
    <section className="member-home">
      <div className="section-header">
        <div>
          <h2>Top 15 truyện mới nhất</h2>
          <p className="muted">Cập nhật liên tục từ hệ thống.</p>
        </div>
      </div>
      {storiesQuery.isLoading ? (
        <p className="muted">Đang tải...</p>
      ) : storiesQuery.data && storiesQuery.data.length ? (
        <div className="story-grid story-grid--wide">
          {storiesQuery.data.slice(0, 15).map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <p className="muted">Chưa có truyện.</p>
      )}
    </section>
  )
}
