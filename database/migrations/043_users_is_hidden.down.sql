DROP INDEX IF EXISTS idx_users_is_hidden;

ALTER TABLE users
  DROP COLUMN IF EXISTS is_hidden;
