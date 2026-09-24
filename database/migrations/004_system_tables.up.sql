-- ============================================================
-- NIAS Academy rebuild - 004: system tables
-- DBMS: PostgreSQL (12+)
-- Migration 004 (up): site settings + audit log.
--   - site_settings: key/value site configuration.
--   - audit_logs: immutable trail of admin/back-office actions.
-- ============================================================

CREATE TABLE site_settings (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) NOT NULL DEFAULT 'string',
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE audit_logs (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100),
    entity_id     BIGINT,
    details       JSONB,
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);