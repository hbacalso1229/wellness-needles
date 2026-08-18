-- Run once in Cloudflare D1 Console (same database). Do not re-run d1/schema.sql.
-- Copies existing reviews (integer 5 stays 5.0), then restores the status index.

CREATE TABLE reviews_new (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  condition TEXT,
  reviewed_at TEXT NOT NULL,
  rating REAL NOT NULL,
  source TEXT,
  emphasis TEXT,
  excerpt TEXT,
  body TEXT,
  created_at TEXT NOT NULL
);

INSERT INTO reviews_new (
  id, status, name, condition, reviewed_at, rating, source, emphasis, excerpt, body, created_at
)
SELECT id, status, name, condition, reviewed_at, rating, source, emphasis, excerpt, body, created_at
FROM reviews;

DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status, reviewed_at);
