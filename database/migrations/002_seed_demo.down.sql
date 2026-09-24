-- ============================================================
-- NIAS Academy rebuild - 002: demo seed
-- DBMS: PostgreSQL (12+)
-- Migration 002 (down): removes everything created by 002 up.
-- ============================================================

DELETE FROM academic_programs WHERE name_ar LIKE '%Placeholder%';
DELETE FROM training_courses WHERE title LIKE '%Placeholder%';
DELETE FROM news WHERE title_ar LIKE '%Placeholder%';
DELETE FROM news_categories WHERE slug IN ('news', 'events-and-activities', 'courses-training');

DELETE FROM institute_branches WHERE slug IN ('sanaa', 'aden', 'taiz', 'hodeidah', 'ibb', 'mukalla');

DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@nias-academy.demo'
);
DELETE FROM users WHERE email LIKE '%@nias-academy.demo';

DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles);
DELETE FROM permissions;
DELETE FROM roles;