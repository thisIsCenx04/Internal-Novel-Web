import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fetchChapterContent, fetchStoryDetail, type ChapterSummary } from '../api/storyApi'

export function StoryDetailPage() {
  const { slug } = useParams()
  const storyQuery = useQuery({
    queryKey: ['story-detail', slug],
    queryFn: () => fetchStoryDetail(slug || ''),
    enabled: Boolean(slug),
  })
  const [activeChapter, setActiveChapter] = useState<ChapterSummary | null>(null)

  useEffect(() => {
    if (storyQuery.data?.chapters?.length) {
      setActiveChapter(storyQuery.data.chapters[0])
    }
  }, [storyQuery.data?.chapters])

  const chapterQuery = useQuery({
    queryKey: ['chapter-content', activeChapter?.id],
    queryFn: () => fetchChapterContent(activeChapter?.id || ''),
    enabled: Boolean(activeChapter?.id),
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
          {story.categories.length ? (
            <div className="reader-tags">
              {story.categories.map((category) => (
                <span key={category.id} className="story-tag">
                  {category.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="reader-body">
        <aside className="chapter-card">
          <div className="chapter-card__header">
            <h3>Danh sach chuong</h3>
            <input type="search" placeholder="Ten chuong..." />
          </div>
          <div className="chapter-list">
            {story.chapters.length ? (
              story.chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-item">
                  <span>
                    Chuong {chapter.chapterNo}: {chapter.title || 'Chuong'}
                  </span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setActiveChapter(chapter)}
                  >
                    Doc
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">Chua co chuong.</p>
            )}
          </div>
        </aside>
        <article className="reader-content">
          {chapterQuery.isLoading ? (
            <p className="muted">Dang tai chuong...</p>
          ) : chapterQuery.data ? (
            <>
              <h3>
                Chuong {chapterQuery.data.chapterNo}:{' '}
                {chapterQuery.data.title || 'Chuong'}
              </h3>
              <div className="reader-content__body">{chapterQuery.data.content}</div>
            </>
          ) : (
            <p className="muted">Chon chuong de doc.</p>
          )}
        </article>
      </div>
    </section>
  )
}
