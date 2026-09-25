-- ============================================================
-- NIAS Academy - 030: prune unused roles
--  - Removes legacy/duplicate roles that have NO assigned users.
--  - Keeps only roles actually in use (Administrator, Content Editor,
--    Journal Editor, قسم التدريب). Administrator is protected in-app.
-- ============================================================

DELETE FROM roles
WHERE name IN (
    'Guest',
    'Student',
    'Trainee',
    'Faculty',
    'Employee',
    'Training Officer',
    'مدير التدريب'
)
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.role_id = roles.id
);