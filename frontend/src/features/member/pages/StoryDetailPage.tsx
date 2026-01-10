import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { tokenStore } from '../../../shared/api/tokenStore'
import { parseJwt } from '../../../shared/utils/jwt'
import { fetchMemberSettings } from '../api/settingsApi'
import {
  fetchChapterContent,
  fetchStoryDetail,
  openReadingSession,
  reportCopyAttempt,
  requestNextChapter,
  type ChapterSummary,
  type ReadingSession,
} from '../api/storyApi'
import type { AxiosError } from 'axios'

export function StoryDetailPage() {
  const { slug } = useParams()
  const storyQuery = useQuery({
    queryKey: ['story-detail', slug],
    queryFn: () => fetchStoryDetail(slug || ''),
    enabled: Boolean(slug),
  })
  const settingsQuery = useQuery({
    queryKey: ['member-settings'],
    queryFn: fetchMemberSettings,
  })
  const [activeChapter, setActiveChapter] = useState<ChapterSummary | null>(null)
  const [readingSession, setReadingSession] = useState<ReadingSession | null>(null)
  const [nextCooldown, setNextCooldown] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  const watermarkText = useMemo(() => {
    const token = tokenStore.getAccessToken()
    if (!token) return 'Reader'
    const payload = parseJwt(token)
    return payload?.sub ? `User ${payload.sub.slice(0, 8)}` : 'Reader'
  }, [])
  const showWatermark = settingsQuery.data?.watermarkEnabled ?? true

  const openChapter = async (chapter: ChapterSummary) => {
    setActiveChapter(chapter)
    setNotice(null)
    try {
      const session = await openReadingSession(chapter.id)
      setReadingSession(session)
      setNextCooldown(0)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      const message = axiosError.response?.data?.message
      if (message === 'VIP expired') {
        setNotice('VIP het han. Vui long gia han de doc.')
      } else {
        setNotice('Khong the mo chuong. Vui long thu lai.')
      }
    }
  }

  useEffect(() => {
    if (storyQuery.data?.chapters?.length && !activeChapter) {
      openChapter(storyQuery.data.chapters[0])
    }
  }, [storyQuery.data?.chapters, activeChapter])

  const chapterQuery = useQuery({
    queryKey: ['chapter-content', activeChapter?.id],
    queryFn: () => fetchChapterContent(activeChapter?.id || ''),
    enabled: Boolean(activeChapter?.id),
  })

  useEffect(() => {
    if (!readingSession?.allowNextAt) return
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(readingSession.allowNextAt).getTime() - Date.now()) / 1000),
      )
      setNextCooldown(remaining)
    }, 500)
    return () => clearInterval(timer)
  }, [readingSession?.allowNextAt])

  useEffect(() => {
    const handleCopy = (event: Event) => {
      event.preventDefault()
      if (storyQuery.data) {
        reportCopyAttempt({
          storyId: storyQuery.data.id,
          chapterId: activeChapter?.id,
        }).catch(() => undefined)
      }
      setNotice('Khong the sao chep noi dung.')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && ['c', 'x', 's', 'p'].includes(key)) {
        event.preventDefault()
        handleCopy(event)
      }
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      handleCopy(event)
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCopy)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCopy)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeChapter?.id, storyQuery.data?.id])

  if (storyQuery.isLoading) {
    return <p className="muted">Loading...</p>
  }

  if (!storyQuery.data) {
    return <p className="muted">Story not found.</p>
  }

  const story = storyQuery.data
  const chapters = story.chapters
  const currentIndex = chapters.findIndex((chapter) => chapter.id === activeChapter?.id)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1
    ? chapters[currentIndex + 1]
    : null

  const handleNext = async () => {
    if (!readingSession?.sessionReadingId) return
    if (!nextChapter) {
      setNotice('Da la chuong cuoi.')
      return
    }
    try {
      const result = await requestNextChapter(readingSession.sessionReadingId)
      if (!result.allowed) {
        setNextCooldown(result.remainingSeconds)
        return
      }
      await openChapter(nextChapter)
    } catch (error) {
      const axiosError = error as AxiosError<{ data?: { remainingSeconds?: number } }>
      const message = (axiosError.response?.data as { message?: string } | undefined)?.message
      const remaining = axiosError.response?.data?.data?.remainingSeconds
      if (remaining) {
        setNextCooldown(remaining)
        setNotice(`Ban doc qua nhanh. Hay doi ${remaining}s.`)
      } else if (message === 'VIP expired') {
        setNotice('VIP het han. Vui long gia han de doc.')
      } else {
        setNotice('Khong the sang chuong. Vui long thu lai.')
      }
    }
  }

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
                    onClick={() => openChapter(chapter)}
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
              {notice ? <p className="reader-notice">{notice}</p> : null}
              <div className="reader-actions">
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!prevChapter}
                  onClick={() => prevChapter && openChapter(prevChapter)}
                >
                  Chuong truoc
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!nextChapter || nextCooldown > 0}
                  onClick={handleNext}
                >
                  {nextCooldown > 0 ? `Cho ${nextCooldown}s` : 'Chuong tiep'}
                </button>
              </div>
              <div className="reader-content__body">{chapterQuery.data.content}</div>
            </>
          ) : (
            <p className="muted">Chon chuong de doc.</p>
          )}
          {showWatermark ? (
            <div className="reader-watermark">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index}>{watermarkText}</span>
              ))}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  )
}
