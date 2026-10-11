-- ============================================================
-- NIAS Academy - 038: gallery albums
--  - Groups gallery images into event albums so the public gallery
--    lists events first and reveals each event's photos on selection.
--  - gallery_items.album_id links an image to its album (NULL = a
--    standalone photo, preserved for the existing seed data).
--  - Grants gallery.read/manage to the Administrator role.
-- ============================================================

CREATE TABLE gallery_albums (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    cover_image  VARCHAR(500),
    event_date   DATE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_gallery_albums_updated_at BEFORE UPDATE ON gallery_albums FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE gallery_items
  ADD COLUMN album_id BIGINT REFERENCES gallery_albums(id) ON DELETE CASCADE;

CREATE INDEX idx_gallery_items_album ON gallery_items (album_id, sort_order, id);

INSERT INTO permissions (code, description) VALUES
    ('gallery.read', 'قراءة ألبومات المعرض وصورها'),
    ('gallery.manage', 'إدارة ألبومات المعرض وصورها')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('gallery.read', 'gallery.manage')
ON CONFLICT DO NOTHING;
