-- ============================================================
-- NIAS Academy rebuild - 008: demo public content (dev only)
-- DBMS: PostgreSQL (12+)
-- Migration 008 (up): clearly-marked demo content to power the
-- public APIs during development. NEVER shipped to production
-- (intended to be deleted by 008 down or replaced by real CMS data).
-- ============================================================

-- Demo college + department + faculty
INSERT INTO colleges (branch_id, name_ar, name_en, dean_name, status)
SELECT b.id, 'كلية تجريبية', 'Demo College', 'د. عميد تجريبي', 'active'
FROM institute_branches b WHERE b.slug = 'sanaa'
ON CONFLICT DO NOTHING;

INSERT INTO departments (college_id, name_ar, name_en)
SELECT id, 'قسم تجريبي', 'Demo Department' FROM colleges WHERE name_en = 'Demo College'
ON CONFLICT DO NOTHING;

INSERT INTO faculty_members (department_id, name_ar, name_en, title, status)
SELECT d.id, 'أ. د. أستاذ تجريبي', 'Prof. Demo Faculty', 'أستاذ', 'active'
FROM departments d WHERE d.name_en = 'Demo Department'
ON CONFLICT DO NOTHING;

-- Demo academic programs (published/open)
INSERT INTO academic_programs (college_id, name_ar, name_en, program_type, duration_months, credit_hours, total_fees, admission_open, status)
SELECT c.id, 'برنامج تجريبي لإدارة الأعمال', 'Demo BA Program', 'bachelor', 48, 130, 1200000, TRUE, 'active'
FROM colleges c WHERE c.name_en = 'Demo College'
ON CONFLICT DO NOTHING;

-- Demo news (published)
INSERT INTO news_categories (name_ar, name_en, slug) VALUES
    ('الدراسات العليا', 'Postgraduate', 'postgraduate')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news (category_id, content_type, title_ar, summary_ar, body_ar, is_featured, published_at, status)
SELECT c.id, 'news',
       'خبر تجريبي: افتتاح الفصل الجديد',
       'ملخص تجريبي للأخبار المنشورة للواجهة العامة.',
       'نص تفصيلي تجريبي يُستبدل بمحتوى حقيقي من إدارة المحتوى.',
       TRUE, now(), 'published'
FROM news_categories c WHERE c.slug = 'postgraduate'
ON CONFLICT DO NOTHING;

-- Demo gallery + downloads
INSERT INTO gallery_items (title, image, sort_order) VALUES
    ('صورة تجريبية 1', '/demo/gallery-1.jpg', 1),
    ('صورة تجريبية 2', '/demo/gallery-2.jpg', 2);

INSERT INTO download_files (title, category, file_path) VALUES
    ('ملف تجريبي: دليل القبول', 'admission', '/demo/admission-guide.pdf');

-- Demo training course (open)
INSERT INTO training_courses (title, description, fees, capacity, start_date, end_date, location, status)
SELECT 'دورة تدريبية تجريبية (مفتوحة)', 'دورة تجريبية مفتوحة للواجهة العامة.', 15000, 25,
       now()::date + 7, now()::date + 21, 'صنعاء', 'open'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE status = 'open');

-- Demo conference + trustee
INSERT INTO conferences (title, description, location, event_date, status) VALUES
    ('مؤتمر تجريبي علمي', 'مؤتمر تجريبي مفتوح للتسجيل.', 'صنعاء', now()::date + 45, 'open');

INSERT INTO trustees (name, position, sort_order) VALUES
    ('عضو تجريبي لمجلس الأمناء', 'رئيس المجلس', 1);