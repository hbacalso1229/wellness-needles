-- Preview test booking and review rows, and all Change History rows. Does not delete.
-- npx wrangler d1 execute wellness-needles --remote --file=d1/list-test-bookings.sql
--
-- Bookings: Test Patient, HENDRIX AXL, @example.com
-- Reviews: names like "Test Exp" (rejected QA). Does not match seeded Google reviews.
-- History: entire site_change_history (portal Change History). Overlay in site_settings is kept.
-- Do not re-run d1/schema.sql.

SELECT
  id,
  status,
  first_name,
  last_name,
  email,
  starts_at,
  preferred_date,
  created_at
FROM bookings
WHERE
  (lower(trim(first_name)) = 'test' AND lower(trim(last_name)) = 'patient')
  OR (lower(trim(first_name)) = 'hendrix' AND lower(trim(last_name)) = 'axl')
  OR lower(email) LIKE '%@example.com'
ORDER BY created_at DESC;

SELECT
  id,
  status,
  name,
  source,
  reviewed_at,
  created_at
FROM reviews
WHERE
  lower(trim(name)) = 'test'
  OR lower(trim(name)) LIKE 'test %'
  OR lower(trim(name)) LIKE 'test-%'
ORDER BY created_at DESC;

SELECT
  id,
  changed_at,
  changed_by,
  field_path,
  from_value,
  to_value
FROM site_change_history
ORDER BY changed_at DESC;
