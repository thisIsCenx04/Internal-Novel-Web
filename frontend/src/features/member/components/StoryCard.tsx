import { Link } from 'react-router-dom'
import type { StorySummary } from '../api/storyApi'

type StoryCardProps = {
  story: StorySummary
}

const formatViews = (value: number) => {
  if (value < 1000) return value.toString()
  if (value < 1_000_000) {
    const formatted = (value / 1000).toFixed(1)
    return `${formatted.replace('.0', '')}k`
  }
  const formatted = (value / 1_000_000).toFixed(1)
  return `${formatted.replace('.0', '')}m`
}

const formatRelativeDate = (value: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'Vua xong'
  if (diffMinutes < 60) return `${diffMinutes} phut truoc`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} gio truoc`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngay truoc`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks} tuan truoc`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} thang truoc`
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
        {story.categories.length ? (
          <Link to={`/home/read/${story.slug}`} className="story-card__tags">
            {story.categories.map((category) => (
              <span key={category.id} className="story-tag">
                {category.name}
              </span>
            ))}
          </Link>
        ) : null}
        <Link to={`/home/read/${story.slug}`} className="story-card__description">
          <p className="muted">{story.description || 'Mo ta dang cap nhat.'}</p>
        </Link>
        <Link to={`/home/read/${story.slug}`} className="story-card__meta">
          <span>{formatRelativeDate(story.createdAt)}</span>
          <span>{formatViews(story.viewCount)}</span>
        </Link>
      </div>
    </article>
  )
}
