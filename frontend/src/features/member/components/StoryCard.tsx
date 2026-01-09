import { Link } from 'react-router-dom'
import type { StorySummary } from '../api/storyApi'

type StoryCardProps = {
  story: StorySummary
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="story-card">
      <Link to={`/home/read/${story.slug}`} className="story-card__link-cover">
      <div className="story-card__media">
        {story.coverUrl ? (
          <img src={story.coverUrl} alt={story.title} />
        ) : (
          <div className="story-card__placeholder">No cover</div>
        )}
      </div>
      </Link>
      <div className="story-card__content">
        <Link to={`/home/read/${story.slug}`} className="story-card__title">
          <h3>{story.title}</h3>
        </Link>
        <Link to={`/home/read/${story.slug}`} className="story-card__description">
          <p className="muted">{story.description || 'Mo ta dang cap nhat.'}</p>
        </Link>
        <Link to={`/home/read/${story.slug}`} className="story-card__meta">
          <span>3 tuan truoc</span>
          <span>1.2k</span>
        </Link>
      </div>
    </article>
  )
}
