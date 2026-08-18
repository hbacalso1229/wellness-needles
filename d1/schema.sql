CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  published_json TEXT NOT NULL,
  draft_json TEXT NOT NULL,
  website_overlay_enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
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

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT,
  location_label TEXT,
  service_label TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  starts_at TEXT,
  remind_at TEXT,
  sms_opt_in INTEGER NOT NULL DEFAULT 0,
  confirm_email_sent INTEGER NOT NULL DEFAULT 0,
  confirm_sms_sent INTEGER NOT NULL DEFAULT 0,
  reminder_email_sent INTEGER NOT NULL DEFAULT 0,
  reminder_sms_sent INTEGER NOT NULL DEFAULT 0,
  cancel_email_sent INTEGER NOT NULL DEFAULT 0,
  cancel_sms_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_change_history (
  id TEXT PRIMARY KEY,
  publish_id TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  field_path TEXT NOT NULL,
  from_value TEXT NOT NULL DEFAULT '',
  to_value TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status, created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_remind ON bookings (status, remind_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_site_change_history_at ON site_change_history (changed_at DESC);
