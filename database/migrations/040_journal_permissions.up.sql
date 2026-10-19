-- ============================================================
-- NIAS Academy - 040: journal permissions
--  - The journal tables (journal_categories/issues/articles/
--    editorial_board) and public API already exist from 001_init,
--    but no admin CRUD routes existed and no permission codes were
--    ever defined for the journal. Add journal.* codes so the admin
--    can manage issues/articles, and grant them to Administrator.
-- ============================================================

INSERT INTO permissions (code, description) VALUES
    ('journal.read', 'قراءة إصدارات المجلة العلمية'),
    ('journal.create', 'إضافة إصدارات المجلة العلمية'),
    ('journal.update', 'تعديل إصدارات المجلة العلمية'),
    ('journal.delete', 'حذف إصدارات المجلة العلمية')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('journal.read', 'journal.create', 'journal.update', 'journal.delete')
ON CONFLICT DO NOTHING;
