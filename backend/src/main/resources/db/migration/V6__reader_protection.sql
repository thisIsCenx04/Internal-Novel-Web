CREATE TABLE IF NOT EXISTS chapter_views (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id          UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  story_id            UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id             UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  session_id          UUID NULL REFERENCES user_sessions(id) ON DELETE SET NULL,
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at           TIMESTAMPTZ NULL,
  duration_seconds    INTEGER NULL,
  ip_address          INET NULL,
  user_agent          TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_chapter_views_chapter_opened
  ON chapter_views(chapter_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_views_story_opened
  ON chapter_views(story_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_views_user_opened
  ON chapter_views(user_id, opened_at DESC);

CREATE TABLE IF NOT EXISTS reading_chapter_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id         UUID NULL REFERENCES user_sessions(id) ON DELETE SET NULL,
  chapter_id         UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  story_id           UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  allow_next_at      TIMESTAMPTZ NOT NULL,
  next_attempts_before_allowed INTEGER NOT NULL DEFAULT 0,
  completed_at       TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_opened
  ON reading_chapter_sessions(user_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_chapter_opened
  ON reading_chapter_sessions(chapter_id, opened_at DESC);
