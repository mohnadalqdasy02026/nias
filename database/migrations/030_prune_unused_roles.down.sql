-- ============================================================
-- NIAS Academy - 030 down: restore pruned unused roles (with legacy permissions, if any remain)
-- ============================================================

INSERT INTO roles (name, description) VALUES
    ('Guest',   'زائر الموقع: تصفح المحتوى العام'),
    ('Student', 'طالب مسجل في البوابة الأكاديمية'),
    ('Trainee', 'متدرب في الدورات التدريبية'),
    ('Faculty', 'عضو هيئة التدريس'),
    ('Employee', 'موظف إداري داخلي'),
    ('Training Officer', 'مسؤول التدريب'),
    ('مدير التدريب', 'قسم التدريب')
ON CONFLICT (name) DO NOTHING;