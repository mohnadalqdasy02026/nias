-- ============================================================
-- NIAS Academy rebuild - 005b: conference submissions
-- DBMS: PostgreSQL (12+)
-- Migration 005b (up): paper submission channel for conferences.
-- The live site lists conferences but has no submission path;
-- this PROPOSED channel gives attendees a documented way to
-- submit papers. Needs user/datapoint approval before enabling.
-- ============================================================

CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'under_review', 'accepted', 'rejected');

CREATE TABLE conference_submissions (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conference_id BIGINT NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(190) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    abstract      TEXT,
    file_path     VARCHAR(500),
    status        submission_status NOT NULL DEFAULT 'submitted',
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_conference_submissions_updated_at BEFORE UPDATE ON conference_submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_conference_submissions_conference_id ON conference_submissions (conference_id);
CREATE INDEX idx_conference_submissions_status ON conference_submissions (status);