-- Up: study plan (الخطة الدراسية) — courses of each academic program
CREATE TABLE IF NOT EXISTS program_courses (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id    BIGINT NOT NULL REFERENCES academic_programs(id) ON DELETE CASCADE,
    level_no      SMALLINT NOT NULL DEFAULT 1,
    semester_no   SMALLINT NOT NULL DEFAULT 1,
    course_code   VARCHAR(30),
    name_ar       VARCHAR(255) NOT NULL,
    name_en       VARCHAR(255),
    credit_hours  NUMERIC(4,1) NOT NULL DEFAULT 3,
    is_optional   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (program_id, level_no, semester_no, course_code)
);

CREATE INDEX IF NOT EXISTS idx_program_courses_program ON program_courses (program_id);

DROP TRIGGER IF EXISTS trg_program_courses_updated_at ON program_courses;
CREATE TRIGGER trg_program_courses_updated_at
    BEFORE UPDATE ON program_courses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();