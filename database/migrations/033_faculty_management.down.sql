-- ============================================================
-- NIAS Academy - 033 down: remove faculty permissions
-- ============================================================

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE code IN ('faculty_members.read', 'faculty_members.create', 'faculty_members.update', 'faculty_members.delete')
);

DELETE FROM permissions
WHERE code IN ('faculty_members.read', 'faculty_members.create', 'faculty_members.update', 'faculty_members.delete');