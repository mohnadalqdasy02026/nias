-- ============================================================
-- NIAS Academy - 015: prune permissions not enforced by any route
-- Keeps only the permission codes actually checked by server routes,
-- so dead permissions (for features that do not exist in the site)
-- disappear from counts, matrices and role assignments (cascade).
-- ============================================================

DELETE FROM permissions
WHERE code NOT IN (
    'dashboard.access',

    'users.view', 'users.manage',
    'roles.manage',

    'site_pages.read', 'site_pages.create', 'site_pages.update', 'site_pages.delete',
    'news.read', 'news.create', 'news.update', 'news.delete',

    'news_categories.read', 'news_categories.create', 'news_categories.update', 'news_categories.delete',

    'contact_messages.read', 'contact_messages.update', 'contact_messages.delete',

    'training_courses.read', 'training_courses.create', 'training_courses.update', 'training_courses.delete',
    'training_enrollments.read', 'training_enrollments.review',
    'training_users.read',

    'media_library.read', 'media_library.create', 'media_library.update', 'media_library.delete',

    'academic_programs.read', 'academic_programs.create', 'academic_programs.update', 'academic_programs.delete'
);