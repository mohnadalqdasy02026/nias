-- Owner / master accounts: full permissions and hidden from the users list.
-- The flag only hides the row from the admin "users" screen; login and the
-- permission system are unaffected.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_is_hidden ON users (is_hidden);
