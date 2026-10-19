-- Down: remove journal permissions granted in 040.
DELETE FROM role_permissions
WHERE permission_id IN (SELECT id FROM permissions WHERE code LIKE 'journal.%');
DELETE FROM permissions WHERE code LIKE 'journal.%';
