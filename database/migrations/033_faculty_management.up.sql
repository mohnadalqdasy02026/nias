-- ============================================================
-- NIAS Academy - 033: faculty member management
--  - Restores faculty_members.read/create/update/delete which were
--    pruned by migration 015 (no admin routes existed at that time).
--  - Grants the four codes to the Administrator role only.
-- ============================================================

INSERT INTO permissions (code, description) VALUES
    ('faculty_members.read', 'قراءة أعضاء هيئة التدريس'),
    ('faculty_members.create', 'إضافة أعضاء هيئة التدريس'),
    ('faculty_members.update', 'تعديل أعضاء هيئة التدريس'),
    ('faculty_members.delete', 'حذف أعضاء هيئة التدريس')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('faculty_members.read', 'faculty_members.create', 'faculty_members.update', 'faculty_members.delete')
ON CONFLICT DO NOTHING;