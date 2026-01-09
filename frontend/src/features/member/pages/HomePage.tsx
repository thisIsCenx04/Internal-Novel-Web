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
          <h2>Top 15 truyen moi nhat</h2>
          <p className="muted">Cap nhat lien tuc tu he thong.</p>
        </div>
      </div>
      {storiesQuery.isLoading ? (
        <p className="muted">Loading...</p>
      ) : storiesQuery.data && storiesQuery.data.length ? (
        <div className="story-grid story-grid--wide">
          {storiesQuery.data.slice(0, 15).map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <p className="muted">No stories yet.</p>
      )}
    </section>
  )
}
