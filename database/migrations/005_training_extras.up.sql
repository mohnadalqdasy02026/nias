-- ============================================================
-- NIAS Academy rebuild - 005: training extras
-- DBMS: PostgreSQL (12+)
-- Migration 005 (up): trainers, attendance, certificates.
-- Earlier deferred as Recommended Feature; now part of the
-- training module to support the confirmed registration/login
-- flow and course completion lifecycle.
-- ============================================================

CREATE TABLE trainers (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    full_name    VARCHAR(255) NOT NULL,
    bio          TEXT,
    photo        VARCHAR(500),
    status       entity_status NOT NULL DEFAULT 'active',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE training_attendance (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
    session_date  DATE NOT NULL,
    attended      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (enrollment_id, session_date)
);
CREATE TRIGGER trg_training_attendance_updated_at BEFORE UPDATE ON training_attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_training_attendance_enrollment_id ON training_attendance (enrollment_id);

CREATE TABLE training_certificates (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    issued_at     TIMESTAMPTZ,
    file_path     VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_certificates_updated_at BEFORE UPDATE ON training_certificates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_training_certificates_enrollment_id ON training_certificates (enrollment_id);