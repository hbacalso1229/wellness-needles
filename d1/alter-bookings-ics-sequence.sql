-- Additive. Run once on existing D1. Do not re-run d1/schema.sql for this column.
ALTER TABLE bookings ADD COLUMN ics_sequence INTEGER NOT NULL DEFAULT 0;
