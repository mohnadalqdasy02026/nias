-- ============================================================
-- NIAS Academy rebuild - 007: media catalog (down)
-- ============================================================

ALTER TABLE training_courses DROP COLUMN IF EXISTS category;
DROP TABLE IF EXISTS media_library;