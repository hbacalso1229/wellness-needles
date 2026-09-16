-- Additive. Run once on existing D1:
--   npx wrangler d1 execute wellness-needles --file=d1/patient-charts.sql
-- New installs get the same tables from d1/schema.sql.
ALTER TABLE bookings ADD COLUMN patient_id TEXT;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone_mobile TEXT NOT NULL DEFAULT '',
  phone_work TEXT NOT NULL DEFAULT '',
  phone_home TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  marital_status TEXT NOT NULL DEFAULT '',
  dependants TEXT NOT NULL DEFAULT '',
  gp_permission TEXT NOT NULL DEFAULT '',
  gp_name TEXT NOT NULL DEFAULT '',
  gp_address TEXT NOT NULL DEFAULT '',
  gp_telephone TEXT NOT NULL DEFAULT '',
  last_seen_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS patient_consents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  form_version TEXT NOT NULL,
  signed_at TEXT NOT NULL,
  signed_by TEXT NOT NULL,
  practitioner_name TEXT NOT NULL DEFAULT '',
  practitioner_email TEXT NOT NULL DEFAULT '',
  answers_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_intakes (
  patient_id TEXT PRIMARY KEY,
  document_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS visit_notes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  booking_id TEXT,
  visit_at TEXT NOT NULL,
  document_json TEXT NOT NULL,
  next_follow_up_date TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS patient_files (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS patient_audit_log (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_patient ON bookings (patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients (status, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email);
CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON patient_consents (patient_id, signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_notes_patient ON visit_notes (patient_id, visit_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient ON patient_files (patient_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_audit_patient ON patient_audit_log (patient_id, created_at DESC);
