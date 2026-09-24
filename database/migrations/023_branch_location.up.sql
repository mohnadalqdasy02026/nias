-- ============================================================
-- NIAS Academy - 023: branch contact & location fields
--  - cover_image: uploadable branch photo (public card + page)
--  - latitude / longitude: geographic coordinates (map link)
-- ============================================================

ALTER TABLE institute_branches
    ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500),
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);