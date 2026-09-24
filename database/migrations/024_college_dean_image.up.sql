-- ============================================================
-- NIAS Academy - 024: college dean photo + admin permissions
--  - dean_image: photo of the college dean (site display).
--  - Adds colleges.read / colleges.manage, granted to Administrator.
-- ============================================================

ALTER TABLE colleges
    ADD COLUMN IF NOT EXISTS dean_image VARCHAR(500);

INSERT INTO permissions (code, description) VALUES
    ('colleges.read', 'قراءة الكليات وتعديلها'),
    ('colleges.manage', 'إدارة الكليات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('colleges.read', 'colleges.manage')
ON CONFLICT DO NOTHING;