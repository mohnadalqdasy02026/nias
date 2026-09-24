-- ============================================================
-- NIAS Academy - 022: site settings defaults + branch permissions
--  - Seeds general/home settings into existing site_settings table.
--  - Re-creates branches.read / branches.manage (pruned by 015)
--    plus site_settings.* permissions, granted to Administrator.
-- ============================================================

INSERT INTO permissions (code, description) VALUES
    ('branches.read', 'قراءة الفروع وتعديلها'),
    ('branches.manage', 'إدارة الفروع'),
    ('site_settings.read', 'قراءة إعدادات الموقع'),
    ('site_settings.update', 'تعديل إعدادات الموقع')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Administrator'
  AND p.code IN ('branches.read', 'branches.manage', 'site_settings.read', 'site_settings.update')
ON CONFLICT DO NOTHING;

INSERT INTO site_settings (setting_key, setting_value, setting_type, is_public) VALUES
('general', '{
  "site_name_ar": "المعهد الوطني للعلوم الإدارية",
  "site_name_en": "NIAS Academy",
  "logo": "/uploads/design/site/logo.jpg",
  "favicon": "/uploads/design/site/logo.ico",
  "primary_color": "#0e7c66"
}', 'json', TRUE),
('home', '{
  "hero_eyebrow": "الجمهورية اليمنية — المعهد الوطني للعلوم الإدارية",
  "hero_title": "بناء القدرات الإدارية وإعداد الكوادر المؤهلة لخدمة اليمن",
  "hero_subtitle": "المعهد الوطني للعلوم الإدارية مؤسسة وطنية معنية بالتنمية الإدارية، تقدم برامج أكاديمية ودورات تدريبية متطورة عبر فروعها في محافظات الجمهورية.",
  "features": [
    {"icon": "🎓", "title": "برامج أكاديمية معتمدة", "text": "بكالوريوس وماجستير ودبلوم متوسط وفق أعلى معايير الجودة الأكاديمية."},
    {"icon": "🛠️", "title": "تدريب عملي مكثف", "text": "دورات تدريبية متطورة تواكب متطلبات سوق العمل اليمني وتنمي مهارات الكوادر."},
    {"icon": "🏛️", "title": "فروع في كل المحافظات", "text": "شبكة واسعة من الفروع تُعنى بتقديم خدمات المعهد قربًا من المتدربين وطلابنا."},
    {"icon": "👨‍🏫", "title": "كادر أكاديمي متميز", "text": "نخبة من الأكاديميين والباحثين ذوي الخبرة في مجال العلوم الإدارية."}
  ],
  "cta_title": "انضم إلى صفوف كوادرنا المؤهلة",
  "cta_text": "سجّل الآن في أحد برامجنا الأكاديمية أو دوراتنا التدريبية وابدأ مسارك المهني."
}', 'json', TRUE)
ON CONFLICT (setting_key) DO NOTHING;