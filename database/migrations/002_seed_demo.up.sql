-- ============================================================
-- NIAS Academy rebuild - 002: demo seed
-- DBMS: PostgreSQL (12+)
-- Migration 002 (up): basic/seed data only.
--   - Demo roles & permissions (RBAC)
--   - Demo admin/editor accounts (password hashes are PLACEHOLDERS)
--   - Confirmed public branches (6)
--   - Clearly-marked placeholder content (never real/assumed data)
-- NOTE: straight-line content (real news, colleges, programs) is NOT
--       included here; it must be entered via CMS/admin later.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Demo roles
-- ------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
    ('Guest',          'زائر الموقع: تصفح المحتوى العام'),
    ('Student',        'طالب مسجل في البوابة الأكاديمية'),
    ('Trainee',        'متدرب في الدورات التدريبية'),
    ('Faculty',        'عضو هيئة التدريس'),
    ('Employee',       'موظف إداري داخلي'),
    ('Admission Officer', 'مسؤول القبول والتسجيل'),
    ('Training Officer',  'مسؤول التدريب'),
    ('Content Editor', 'محرر محتوى الموقع'),
    ('Journal Editor', 'محرر المجلة العلمية'),
    ('Administrator',  'مدير النظام: صلاحيات كاملة');

-- ------------------------------------------------------------
-- 2) Demo permissions
-- ------------------------------------------------------------
INSERT INTO permissions (code, description) VALUES
    ('dashboard.access', 'دخول لوحة التحكم'),

    ('users.view', 'عرض المستخدمين'),
    ('users.update', 'تعديل المستخدمين'),
    ('users.delete', 'حذف المستخدمين'),
    ('users.manage', 'إدارة كاملة للمستخدمين'),
    ('roles.manage', 'إدارة الأدوار والأذونات'),

    ('site_pages.read', 'قراءة الصفحات الثابتة'),
    ('site_pages.create', 'إنشاء صفحات'),
    ('site_pages.update', 'تعديل صفحات'),
    ('site_pages.delete', 'حذف صفحات'),
    ('site_pages.publish', 'نشر صفحات'),

    ('news.read', 'قراءة الأخبار'),
    ('news.create', 'إنشاء أخبار'),
    ('news.update', 'تعديل أخبار'),
    ('news.delete', 'حذف أخبار'),
    ('news.publish', 'نشر أخبار'),
    ('news_categories.read', 'قراءة تصنيفات الأخبار'),
    ('news_categories.create', 'إنشاء تصنيفات'),
    ('news_categories.update', 'تعديل تصنيفات'),
    ('news_categories.delete', 'حذف تصنيفات'),

    ('gallery.read', 'قراءة المعرض'),
    ('gallery.create', 'إضافة معرض'),
    ('gallery.update', 'تعديل معرض'),
    ('gallery.delete', 'حذف معرض'),
    ('downloads.read', 'قراءة ملفات التحميل'),
    ('downloads.create', 'إضافة ملفات'),
    ('downloads.update', 'تعديل ملفات'),
    ('downloads.delete', 'حذف ملفات'),
    ('conferences.read', 'قراءة المؤتمرات'),
    ('conferences.create', 'إنشاء مؤتمرات'),
    ('conferences.update', 'تعديل مؤتمرات'),
    ('conferences.delete', 'حذف مؤتمرات'),
    ('trustees.read', 'قراءة أعضاء مجلس الأمناء'),
    ('trustees.create', 'إضافة أعضاء'),
    ('trustees.update', 'تعديل أعضاء'),
    ('trustees.delete', 'حذف أعضاء'),
    ('contact_messages.read', 'قراءة رسائل التواصل'),
    ('contact_messages.update', 'تحديث حالة الرسائل'),
    ('contact_messages.delete', 'حذف الرسائل'),

    ('institute_branches.read', 'قراءة الفروع'),
    ('institute_branches.create', 'إضافة فروع'),
    ('institute_branches.update', 'تعديل فروع'),
    ('institute_branches.delete', 'حذف فروع'),
    ('colleges.read', 'قراءة الكليات'),
    ('colleges.create', 'إضافة كليات'),
    ('colleges.update', 'تعديل كليات'),
    ('colleges.delete', 'حذف كليات'),
    ('departments.read', 'قراءة الأقسام'),
    ('departments.create', 'إضافة أقسام'),
    ('departments.update', 'تعديل أقسام'),
    ('departments.delete', 'حذف أقسام'),
    ('faculty_members.read', 'قراءة أعضاء هيئة التدريس'),
    ('faculty_members.create', 'إضافة أعضاء'),
    ('faculty_members.update', 'تعديل أعضاء'),
    ('faculty_members.delete', 'حذف أعضاء'),

    ('academic_programs.read', 'قراءة البرامج الأكاديمية'),
    ('academic_programs.create', 'إنشاء برامج'),
    ('academic_programs.update', 'تعديل برامج'),
    ('academic_programs.delete', 'حذف برامج'),
    ('program_plans.read', 'قراءة خطط البرامج'),
    ('program_plans.create', 'رفع خطط'),
    ('program_plans.update', 'تعديل خطط'),
    ('program_plans.delete', 'حذف خطط'),

    ('applicants.read', 'قراءة المتقدمين'),
    ('applications.read', 'قراءة الطلبات'),
    ('applications.update', 'تعديل الطلبات'),
    ('applications.review', 'مراجعة الطلبات (قبول/رفض)'),

    ('students.read', 'قراءة بيانات الطلاب'),
    ('students.update', 'تعديل بيانات الطلاب'),
    ('student_results.read', 'قراءة النتائج'),
    ('student_documents.read', 'قراءة وثائق الطالب'),

    ('elearning_courses.read', 'قراءة مقررات التعليم الإلكتروني'),
    ('elearning_courses.create', 'إنشاء مقررات'),
    ('elearning_courses.update', 'تعديل مقررات'),
    ('elearning_courses.delete', 'حذف مقررات'),
    ('elearning_lessons.read', 'قراءة الدروس'),
    ('elearning_lessons.create', 'إضافة دروس'),
    ('elearning_lessons.update', 'تعديل دروس'),
    ('elearning_lessons.delete', 'حذف دروس'),
    ('elearning_enrollments.read', 'قراءة تسجيلات المقررات'),
    ('elearning_enrollments.update', 'تحديث تسجيلات المقررات'),

    ('training_courses.read', 'قراءة الدورات التدريبية'),
    ('training_courses.create', 'إنشاء دورات'),
    ('training_courses.update', 'تعديل دورات'),
    ('training_courses.delete', 'حذف دورات'),
    ('training_users.read', 'قراءة المتدربين'),
    ('training_users.update', 'تعديل المتدربين'),
    ('training_enrollments.read', 'قراءة تسجيلات التدريب'),
    ('training_enrollments.review', 'مراجعة تسجيلات التدريب'),
    ('training_enrollments.update', 'تحديث تسجيلات التدريب'),

    ('journal_categories.read', 'قراءة تصنيفات المجلة'),
    ('journal_categories.create', 'إنشاء تصنيفات'),
    ('journal_categories.update', 'تعديل تصنيفات'),
    ('journal_categories.delete', 'حذف تصنيفات'),
    ('journal_issues.read', 'قراءة أعداد المجلة'),
    ('journal_issues.create', 'إنشاء أعداد'),
    ('journal_issues.update', 'تعديل أعداد'),
    ('journal_issues.delete', 'حذف أعداد'),
    ('journal_issues.publish', 'نشر أعداد'),
    ('journal_articles.read', 'قراءة المقالات'),
    ('journal_articles.create', 'إنشاء مقالات'),
    ('journal_articles.update', 'تعديل مقالات'),
    ('journal_articles.delete', 'حذف مقالات'),
    ('journal_articles.publish', 'نشر مقالات'),
    ('journal_editorial_board.read', 'قراءة هيئة التحرير'),
    ('journal_editorial_board.create', 'إضافة أعضاء'),
    ('journal_editorial_board.update', 'تعديل أعضاء'),
    ('journal_editorial_board.delete', 'حذف أعضاء'),

    ('gallery.publish', 'نشر محتوى المعرض'),
    ('downloads.publish', 'نشر ملفات التحميل'),
    ('conferences.publish', 'نشر المؤتمرات'),
    ('trustees.publish', 'نشر أعضاء مجلس الأمناء'),

    ('media_library.read', 'قراءة مكتبة الوسائط'),
    ('media_library.create', 'رفع وسائط'),
    ('media_library.update', 'تعديل وسائط'),
    ('media_library.delete', 'حذف وسائط'),

    ('settings.read', 'قراءة إعدادات الموقع'),
    ('settings.update', 'تعديل إعدادات الموقع'),
    ('audit_logs.read', 'قراءة سجلات التدقيق'),

    ('admission_periods.read', 'قراءة فترات القبول'),
    ('admission_periods.create', 'إنشاء فترات قبول'),
    ('admission_periods.update', 'تعديل فترات قبول'),
    ('admission_periods.delete', 'حذف فترات قبول'),

    ('training_attendance.read', 'قراءة حضور المتدربين'),
    ('training_attendance.create', 'تسجيل حضور'),
    ('training_attendance.update', 'تعديل حضور'),
    ('training_certificates.read', 'قراءة شهادات التدريب'),
    ('training_certificates.create', 'إصدار شهادات'),
    ('training_certificates.update', 'تعديل شهادات'),
    ('training_reports.read', 'قراءة تقارير التدريب'),

    ('trainers.read', 'قراءة المدربين'),
    ('trainers.create', 'إضافة مدربين'),
    ('trainers.update', 'تعديل مدربين'),
    ('trainers.delete', 'حذف مدربين'),

    ('conference_submissions.read', 'قراءة ملفات المؤتمرات'),
    ('conference_submissions.create', 'إرسال ملفات المؤتمرات'),
    ('conference_submissions.update', 'تعديل ملفات المؤتمرات'),
    ('conference_submissions.delete', 'حذف ملفات المؤتمرات');

-- ------------------------------------------------------------
-- 3) Role <-> permission mapping
-- ------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Guest' AND p.code IN (
    'site_pages.read', 'news.read', 'conferences.read',
    'academic_programs.read', 'program_plans.read',
    'faculty_members.read', 'institute_branches.read', 'colleges.read', 'departments.read',
    'trustees.read', 'gallery.read', 'downloads.read',
    'journal_issues.read', 'journal_articles.read',
    'training_courses.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Student' AND p.code IN (
    'site_pages.read', 'news.read', 'conferences.read',
    'academic_programs.read', 'program_plans.read',
    'gallery.read', 'downloads.read', 'journal_issues.read', 'journal_articles.read',
    'journal_editorial_board.read',
    'students.read',
    'elearning_courses.read', 'elearning_lessons.read',
    'elearning_enrollments.read', 'elearning_enrollments.update',
    'student_results.read', 'student_documents.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Trainee' AND p.code IN (
    'site_pages.read', 'news.read', 'conferences.read',
    'academic_programs.read', 'gallery.read', 'downloads.read',
    'training_courses.read',
    'training_enrollments.read', 'training_enrollments.update'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Faculty' AND p.code IN (
    'site_pages.read', 'news.read', 'conferences.read',
    'academic_programs.read', 'journal_issues.read', 'journal_articles.read',
    'faculty_members.read', 'faculty_members.update',
    'elearning_courses.read', 'elearning_courses.create', 'elearning_courses.update',
    'elearning_lessons.read', 'elearning_lessons.create', 'elearning_lessons.update',
    'elearning_enrollments.read',
    'journal_articles.create', 'journal_articles.update'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Employee' AND p.code IN (
    'dashboard.access',
    'students.read', 'applications.read',
    'training_users.read', 'training_enrollments.read',
    'contact_messages.read', 'contact_messages.update',
    'downloads.read', 'trustees.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Admission Officer' AND p.code IN (
    'dashboard.access',
    'applicants.read',
    'applications.read', 'applications.update', 'applications.review',
    'academic_programs.read', 'program_plans.read',
    'colleges.read', 'departments.read',
    'students.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Training Officer' AND p.code IN (
    'dashboard.access',
    'training_users.read', 'training_users.update',
    'training_courses.read', 'training_courses.create', 'training_courses.update', 'training_courses.delete',
    'training_enrollments.read', 'training_enrollments.review', 'training_enrollments.update',
    'conferences.read', 'gallery.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Content Editor' AND p.code IN (
    'dashboard.access',
    'site_pages.read', 'site_pages.create', 'site_pages.update', 'site_pages.delete', 'site_pages.publish',
    'news.read', 'news.create', 'news.update', 'news.delete', 'news.publish',
    'news_categories.read', 'news_categories.create', 'news_categories.update', 'news_categories.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete', 'gallery.publish',
    'downloads.read', 'downloads.create', 'downloads.update', 'downloads.delete', 'downloads.publish',
    'conferences.read', 'conferences.create', 'conferences.update', 'conferences.delete', 'conferences.publish',
    'trustees.read', 'trustees.create', 'trustees.update', 'trustees.delete', 'trustees.publish',
    'media_library.read', 'media_library.create', 'media_library.update', 'media_library.delete',
    'settings.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Training Officer' AND p.code IN (
    'trainers.read', 'trainers.create', 'trainers.update', 'trainers.delete',
    'training_attendance.read', 'training_attendance.create', 'training_attendance.update',
    'training_certificates.read', 'training_certificates.create', 'training_certificates.update',
    'training_reports.read'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON TRUE
WHERE r.name = 'Journal Editor' AND p.code IN (
    'dashboard.access',
    'journal_categories.read', 'journal_categories.create', 'journal_categories.update', 'journal_categories.delete',
    'journal_issues.read', 'journal_issues.create', 'journal_issues.update', 'journal_issues.delete', 'journal_issues.publish',
    'journal_articles.read', 'journal_articles.create', 'journal_articles.update', 'journal_articles.delete', 'journal_articles.publish',
    'journal_editorial_board.read', 'journal_editorial_board.create', 'journal_editorial_board.update', 'journal_editorial_board.delete'
);

-- ------------------------------------------------------------
-- 4) Demo accounts
-- NOTE: password_hash below are PLACEHOLDERS. Before first deploy,
--       regenerate real bcrypt hashes (e.g. via the app seed script).
-- ------------------------------------------------------------
INSERT INTO users (full_name_ar, full_name_en, email, password_hash, status) VALUES
    ('مدير النظام (تجريبي)', 'Demo Administrator', 'admin@nias-academy.demo', 'REPLACE_WITH_BCRYPT_HASH', 'active'),
    ('محرر المحتوى (تجريبي)', 'Demo Content Editor', 'editor@nias-academy.demo', 'REPLACE_WITH_BCRYPT_HASH', 'active');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'admin@nias-academy.demo' AND r.name = 'Administrator';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'editor@nias-academy.demo' AND r.name IN ('Content Editor', 'Journal Editor');

-- ------------------------------------------------------------
-- 5) Branches (confirmed public data from the live site)
-- ------------------------------------------------------------
INSERT INTO institute_branches (name_ar, name_en, slug, is_headquarters, status) VALUES
    ('صنعاء',   'Sana''a',   'sanaa',    TRUE,  'active'),
    ('عدن',     'Aden',      'aden',     FALSE, 'active'),
    ('تعز',     'Taiz',      'taiz',     FALSE, 'active'),
    ('الحديدة', 'Hodeidah',  'hodeidah', FALSE, 'active'),
    ('إب',      'Ibb',       'ibb',      FALSE, 'active'),
    ('المكلا',  'Mukalla',   'mukalla',  FALSE, 'active');

-- ------------------------------------------------------------
-- 6) Placeholder content (clearly marked, kept non-public)
-- ------------------------------------------------------------
INSERT INTO news_categories (name_ar, name_en, slug) VALUES
    ('أخبار',              'News',              'news'),
    ('فعاليات وأنشطة',     'Events & Activities', 'events-and-activities'),
    ('دورات وتدريب',       'Courses & Training',  'courses-training');

INSERT INTO news (category_id, content_type, title_ar, body_ar, status)
SELECT c.id, 'news',
       'خبر تجريبي (Placeholder) — يُستبدل قبل الإطلاق',
       'نص تجريبي تمهيدي، يجب استبداله بمحتوى حقيقي من إدارة الموقع.',
       'draft'
FROM news_categories c WHERE c.slug = 'news';

INSERT INTO training_courses (title, description, capacity, status) VALUES
    ('دورة تجريبية (Placeholder) — تُستبدل قبل الإطلاق', 'وصف تجريبي لدورة تدريبية، يُستبدل ببيانات حقيقية.', 25, 'draft');

INSERT INTO academic_programs
    (name_ar, program_type, duration_months, admission_open, status)
VALUES
    ('برنامج تجريبي (Placeholder) — يُستبدل قبل الإطلاق', 'bachelor', 48, FALSE, 'inactive');