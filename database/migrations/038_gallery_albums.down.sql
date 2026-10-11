DELETE FROM role_permissions
 WHERE permission_id IN (SELECT id FROM permissions WHERE code IN ('gallery.read', 'gallery.manage'));
DELETE FROM permissions WHERE code IN ('gallery.read', 'gallery.manage');

DROP INDEX IF EXISTS idx_gallery_items_album;
ALTER TABLE gallery_items DROP COLUMN IF EXISTS album_id;

DROP TRIGGER IF EXISTS trg_gallery_albums_updated_at ON gallery_albums;
DROP TABLE IF EXISTS gallery_albums;
