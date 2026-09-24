-- ============================================================
-- NIAS Academy rebuild - 007: media catalog
-- DBMS: PostgreSQL (12+)
-- Migration 007 (up): central media library + course category.
--   - media_library: single upload store for gallery, downloads,
--     news covers, etc. (media_library.* permissions used).
--   - training_courses.category: tag courses (conference/news dual
--     source resolved by keeping courses in training_courses only).
-- ============================================================

CREATE TABLE media_library (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_type   VARCHAR(50),
    file_size   BIGINT,
    alt_text    VARCHAR(255),
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_media_library_updated_at BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_media_library_uploaded_by ON media_library (uploaded_by);
CREATE INDEX idx_media_library_file_type ON media_library (file_type);

ALTER TABLE training_courses ADD COLUMN category VARCHAR(100);