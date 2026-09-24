-- ============================================================
-- NIAS Academy rebuild - 006: admission extras
-- DBMS: PostgreSQL (12+)
-- Migration 006 (up): admission periods + application extensions.
--   - admission_periods: single source of truth for open windows.
--   - applications.ref_code: public tracking code.
--   - applications.student_id: converts application -> student on
--     final acceptance (added here, not 001, for FK ordering).
-- ============================================================

CREATE TABLE admission_periods (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255),
    program_id  BIGINT REFERENCES academic_programs(id) ON DELETE CASCADE,
    open_from   DATE NOT NULL,
    open_until  DATE NOT NULL,
    status      entity_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_admission_periods_updated_at BEFORE UPDATE ON admission_periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_admission_periods_program_id ON admission_periods (program_id);

ALTER TABLE applications ADD COLUMN ref_code VARCHAR(20);
ALTER TABLE applications ADD COLUMN student_id BIGINT REFERENCES students(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX uq_applications_ref_code ON applications (ref_code) WHERE ref_code IS NOT NULL;