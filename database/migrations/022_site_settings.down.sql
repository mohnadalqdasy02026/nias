-- ============================================================
-- NIAS Academy - 022 down: drop settings defaults + permissions
-- ============================================================

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE code IN ('branches.read', 'branches.manage', 'site_settings.read', 'site_settings.update')
);

DELETE FROM permissions
WHERE code IN ('branches.read', 'branches.manage', 'site_settings.read', 'site_settings.update');

DELETE FROM site_settings WHERE setting_key IN ('general', 'home');