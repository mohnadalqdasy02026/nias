-- ============================================================
-- NIAS Academy rebuild - 006: admission extras (down)
-- ============================================================

DROP INDEX IF EXISTS uq_applications_ref_code;
ALTER TABLE applications DROP COLUMN IF EXISTS ref_code;
ALTER TABLE applications DROP COLUMN IF EXISTS student_id;
DROP TABLE IF EXISTS admission_periods;