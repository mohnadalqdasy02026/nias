-- ============================================================
-- NIAS Academy rebuild - 010: demo static pages (DEV ONLY)
-- Adds published 'about'/'contact' pages so the admin CMS and
-- public pages have real entries. Uses on-conflict so it is safe
-- to re-run manually. Should NOT ship to production (CMS manages
-- real pages).
-- ============================================================

INSERT INTO site_pages (slug, title_ar, title_en, content_ar, content_en, status) VALUES
    ('about', 'عن المعهد', 'About', 'المعهد الوطني للعلوم الإدارية مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية. (محتوى تجريبي يُستبدل عبر نظام إدارة المحتوى)', 'Demo about page content.', 'published'),
    ('contact', 'تواصل معنا', 'Contact', 'تواصل مع المعهد عبر نموذج التواصل أو زيارة أقرب فرع. (محتوى تجريبي يُستبدل عبر نظام إدارة المحتوى)', 'Demo contact page content.', 'published'),
    ('terms', 'الشروط والأحكام', 'Terms', 'شروط استخدام الموقع وأحكام عامة. (محتوى تجريبي يُستبدل عبر نظام إدارة المحتوى)', 'Demo terms content.', 'draft')
ON CONFLICT (slug) DO UPDATE
    SET content_ar = EXCLUDED.content_ar, content_en = EXCLUDED.content_en,
        updated_at = now();