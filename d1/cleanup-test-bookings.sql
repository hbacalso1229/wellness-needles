-- Delete test bookings, test reviews, and Change History. Preview first with d1/list-test-bookings.sql.
-- npx wrangler d1 execute wellness-needles --remote --file=d1/cleanup-test-bookings.sql
--
-- Does not touch site_settings (overlay / SMS / maintenance stay as published) or seeded Google reviews.
-- Do not re-run d1/schema.sql.

DELETE FROM bookings
WHERE
  (lower(trim(first_name)) = 'test' AND lower(trim(last_name)) = 'patient')
  OR (lower(trim(first_name)) = 'hendrix' AND lower(trim(last_name)) = 'axl')
  OR lower(email) LIKE '%@example.com';

DELETE FROM reviews
WHERE
  lower(trim(name)) = 'test'
  OR lower(trim(name)) LIKE 'test %'
  OR lower(trim(name)) LIKE 'test-%';

DELETE FROM site_change_history;
