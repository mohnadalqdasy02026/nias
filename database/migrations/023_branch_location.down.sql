-- ============================================================
-- NIAS Academy - 023 down: drop branch location fields
-- ============================================================

ALTER TABLE institute_branches
    DROP COLUMN IF EXISTS cover_image,
    DROP COLUMN IF EXISTS latitude,
    DROP COLUMN IF EXISTS longitude;