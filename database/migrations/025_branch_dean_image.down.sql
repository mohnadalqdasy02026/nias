-- ============================================================
-- NIAS Academy - 025 down: restore branch cover image, drop dean_image
-- ============================================================

ALTER TABLE institute_branches
    ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);

ALTER TABLE institute_branches
    DROP COLUMN IF EXISTS dean_image;