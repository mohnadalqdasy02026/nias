DELETE FROM role_permissions rp
USING permissions p
WHERE rp.permission_id = p.id
  AND p.code IN ('downloads.read', 'downloads.create', 'downloads.update', 'downloads.delete');

DELETE FROM permissions
WHERE code IN ('downloads.read', 'downloads.create', 'downloads.update', 'downloads.delete');
