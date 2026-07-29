-- The "Sir Information" module was removed: it drove nothing on the public site,
-- duplicated the admins table, and exposed personal contact details through an
-- unauthenticated GET endpoint. IF EXISTS keeps this idempotent, since the custom
-- migration runner replays every .sql file on each startup.
DROP TABLE IF EXISTS `sir_profile`;
