-- ============================================================
-- NIAS Academy rebuild - 009: demo admin data (DEV ONLY)
-- Adds sample contact messages so the admin dashboard/contacts
-- module has data to display during development.
-- Serve: must NOT ship to production.
-- ============================================================

INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES
    ('أحمد سالم (تجريبي)', 'demo-contact-1@example.test', '770000001', 'استفسار عن القبول',
     'رسالة تجريبية: أود الاستفسار عن مواعيد فتح باب القبول للبرامج الأكاديمية، مع الشكر.', 'new'),
    ('فاطمة محمد (تجريبية)', 'demo-contact-2@example.test', '770000002', 'التحقق من شهادة تدريبية',
     'رسالة تجريبية: أود معرفة طريقة التحقق من شهادة دورة تدريبية صادرة عن المعهد.', 'read'),
    ('سالم علي (تجريبي)', 'demo-contact-3@example.test', NULL, 'اقتراح لدورة تدريبية',
     'رسالة تجريبية: نقترح إضافة دورات في إدارة المشاريع للموظفين العموميين.', 'replied');