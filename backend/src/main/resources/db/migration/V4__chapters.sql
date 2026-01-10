CREATE TABLE IF NOT EXISTS chapters (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id           UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_no         INTEGER NOT NULL,
  title              TEXT NULL,
  content            TEXT NOT NULL,
  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,
  published_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_chapter_story_no UNIQUE(story_id, chapter_no),
  CONSTRAINT ck_chapter_no_positive CHECK (chapter_no > 0)
);

CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_visible ON chapters(is_visible);
CREATE INDEX IF NOT EXISTS idx_chapters_published_at ON chapters(published_at DESC);
