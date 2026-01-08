-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- ENUM TYPES
-- =========================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'BANNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE setting_single_session_policy AS ENUM ('KICK_OLD', 'DENY_NEW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('VIP_EXPIRING', 'VIP_EXPIRED', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'LOGIN_SUCCESS',
    'LOGIN_FAIL',
    'LOGOUT',
    'SESSION_REVOKED',
    'OPEN_STORY',
    'OPEN_CHAPTER',
    'NEXT_CHAPTER',
    'NEXT_TOO_FAST',
    'COPY_ATTEMPT',
    'BAN_USER',
    'UNBAN_USER',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'UPDATE_VIP',
    'CREATE_STORY',
    'UPDATE_STORY',
    'DELETE_STORY',
    'CREATE_CHAPTER',
    'UPDATE_CHAPTER',
    'DELETE_CHAPTER',
    'UPDATE_SETTINGS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username           VARCHAR(64) NOT NULL UNIQUE,
  password_hash      TEXT NOT NULL,
  role               user_role NOT NULL DEFAULT 'MEMBER',
  status             user_status NOT NULL DEFAULT 'ACTIVE',

  -- VIP
  vip_expires_at     TIMESTAMPTZ NULL,
  vip_note           TEXT NULL,

  -- Audit
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_vip_expires ON users(vip_expires_at);

-- =========================
-- USER SESSIONS (enforce 1 active session per user)
-- =========================
CREATE TABLE IF NOT EXISTS user_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- store HASHED token (recommended), not raw token
  session_token_hash TEXT NOT NULL UNIQUE,

  device_id          TEXT NOT NULL,          -- fingerprint/id from client
  user_agent         TEXT NULL,
  ip_address         INET NULL,

  status             session_status NOT NULL DEFAULT 'ACTIVE',
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at         TIMESTAMPTZ NULL,
  revoke_reason      TEXT NULL
);

-- One ACTIVE session per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_sessions_one_active_per_user
ON user_sessions(user_id)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_seen ON user_sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);

-- =========================
-- SITE SETTINGS (single row)
-- =========================
CREATE TABLE IF NOT EXISTS site_settings (
  id                         SMALLINT PRIMARY KEY DEFAULT 1,
  rules_banner_text          TEXT NOT NULL DEFAULT '',
  footer_contact_text        TEXT NOT NULL DEFAULT '',
  single_session_policy      setting_single_session_policy NOT NULL DEFAULT 'KICK_OLD',
  updated_by                 UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ck_site_settings_singleton CHECK (id = 1)
);

INSERT INTO site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =========================
-- STORIES & CHAPTERS
-- =========================
CREATE TABLE IF NOT EXISTS stories (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  slug               VARCHAR(180) NOT NULL UNIQUE,
  description        TEXT NULL,
  cover_url          TEXT NULL,

  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,

  created_by         UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- for fast "15 newest updated" queries (optional)
  latest_chapter_published_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_visible ON stories(is_visible);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_latest_chapter ON stories(latest_chapter_published_at DESC);

CREATE TABLE IF NOT EXISTS chapters (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id           UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  chapter_no         INTEGER NOT NULL,
  title              TEXT NULL,
  content            TEXT NOT NULL,

  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,
  published_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_by         UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_chapter_story_no UNIQUE(story_id, chapter_no),
  CONSTRAINT ck_chapter_no_positive CHECK (chapter_no > 0)
);

CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_visible ON chapters(is_visible);
CREATE INDEX IF NOT EXISTS idx_chapters_published_at ON chapters(published_at DESC);

-- =========================
-- VIEWS / READING CONTROL (10s rule)
-- =========================

-- Every time a user opens a chapter => create a view record (can aggregate later)
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

CREATE INDEX IF NOT EXISTS idx_chapter_views_chapter_opened ON chapter_views(chapter_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_views_story_opened ON chapter_views(story_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_views_user_opened ON chapter_views(user_id, opened_at DESC);

-- Reading session per chapter to enforce "must stay >= 10s before next"
CREATE TABLE IF NOT EXISTS reading_chapter_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id         UUID NULL REFERENCES user_sessions(id) ON DELETE SET NULL,

  chapter_id         UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  story_id           UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  opened_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  allow_next_at      TIMESTAMPTZ NOT NULL, -- opened_at + interval '10 seconds'
  next_attempts_before_allowed INTEGER NOT NULL DEFAULT 0,

  completed_at       TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_opened ON reading_chapter_sessions(user_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_chapter_opened ON reading_chapter_sessions(chapter_id, opened_at DESC);

-- Optional: prevent spam multiple reading sessions for same (user, chapter) within very short time
-- (comment out if you want allow multi-open)
-- CREATE UNIQUE INDEX uq_reading_one_open_per_chapter
-- ON reading_chapter_sessions(user_id, chapter_id)
-- WHERE completed_at IS NULL;

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NULL REFERENCES users(id) ON DELETE CASCADE, -- null => global
  type               notification_type NOT NULL,

  title              TEXT NOT NULL,
  message            TEXT NOT NULL,

  is_read            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- =========================
-- AUDIT LOGS (system behavior logging)
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  session_id         UUID NULL REFERENCES user_sessions(id) ON DELETE SET NULL,

  action             audit_action NOT NULL,
  metadata           JSONB NOT NULL DEFAULT '{}'::jsonb,

  ip_address         INET NULL,
  user_agent         TEXT NULL,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata);

-- =========================
-- USER ACTIVITY HEARTBEATS (for continuous activity time)
-- =========================
CREATE TABLE IF NOT EXISTS user_activity_heartbeats (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id         UUID NULL REFERENCES user_sessions(id) ON DELETE SET NULL,
  ping_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_user_ping ON user_activity_heartbeats(user_id, ping_at DESC);
CREATE INDEX IF NOT EXISTS idx_heartbeats_session_ping ON user_activity_heartbeats(session_id, ping_at DESC);

-- =========================
-- HELPERS: updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- OPTIONAL: auto update stories.latest_chapter_published_at on chapter insert/update
-- =========================
CREATE OR REPLACE FUNCTION refresh_story_latest_chapter()
RETURNS trigger AS $$
BEGIN
  UPDATE stories s
  SET latest_chapter_published_at = (
    SELECT MAX(c.published_at)
    FROM chapters c
    WHERE c.story_id = s.id AND c.is_visible = TRUE
  )
  WHERE s.id = NEW.story_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_chapters_refresh_story_latest
  AFTER INSERT OR UPDATE OF published_at, is_visible OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION refresh_story_latest_chapter();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- OPTIONAL: compute duration_seconds when closing a chapter view
-- (You can do in application layer instead; this is just a helper example.)
-- =========================
CREATE OR REPLACE FUNCTION compute_chapter_view_duration()
RETURNS trigger AS $$
BEGIN
  IF NEW.closed_at IS NOT NULL AND NEW.duration_seconds IS NULL THEN
    NEW.duration_seconds = GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NEW.closed_at - NEW.opened_at)))::INT);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_chapter_views_duration
  BEFORE UPDATE ON chapter_views
  FOR EACH ROW EXECUTE FUNCTION compute_chapter_view_duration();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
