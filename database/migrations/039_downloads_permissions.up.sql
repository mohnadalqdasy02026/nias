-- ============================================================
-- NIAS Academy - 039: downloads permissions
--  - Migration 015 pruned every permission not enforced by a route,
--    which removed downloads.* even though download_files existed.
--    Admin CRUD routes for downloads now exist, so re-add the codes
--    and grant them to the Administrator role.
-- ============================================================

INSERT INTO permissions (code, description) VALUES
    ('downloads.read', 'قراءة ملفات التحميل'),
    ('downloads.create', 'إضافة ملفات التحميل'),
    ('downloads.update', 'تعديل ملفات التحميل'),
    ('downloads.delete', 'حذف ملفات التحميل')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('downloads.read', 'downloads.create', 'downloads.update', 'downloads.delete')
ON CONFLICT DO NOTHING;
