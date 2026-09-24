-- ============================================================
-- NIAS Academy - 024 down: drop college dean photo + permissions
-- ============================================================

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE code IN ('colleges.read', 'colleges.manage')
);

DELETE FROM permissions
WHERE code IN ('colleges.read', 'colleges.manage');

ALTER TABLE colleges
    DROP COLUMN IF EXISTS dean_image;