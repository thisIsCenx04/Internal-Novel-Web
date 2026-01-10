CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_categories (
  story_id     UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_story_categories_story ON story_categories(story_id);
CREATE INDEX IF NOT EXISTS idx_story_categories_category ON story_categories(category_id);
