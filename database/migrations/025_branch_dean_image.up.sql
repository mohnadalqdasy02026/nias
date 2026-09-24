-- ============================================================
-- NIAS Academy - 025: branch dean photo replaces branch cover image
--  - Removes cover_image (branch photo) from institute_branches.
--  - Adds dean_image: photo of the branch dean.
-- ============================================================

ALTER TABLE institute_branches
    ADD COLUMN IF NOT EXISTS dean_image VARCHAR(500);

ALTER TABLE institute_branches
    DROP COLUMN IF EXISTS cover_image;