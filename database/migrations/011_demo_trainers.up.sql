-- ============================================================
-- NIAS Academy rebuild - 011: demo trainers + course linking
-- DEV ONLY: sample trainers for the training admin module.
-- ============================================================

INSERT INTO trainers (full_name, bio, status) VALUES
    ('م. أحمد الريمي (تجريبي)', 'مُدرّب تجريبي متخصص في الإدارة العامة.', 'active'),
    ('د. سارة الحداء (تجريبية)', 'مُدرّبة تجريبية متخصصة في إدارة المشاريع.', 'active');

UPDATE training_courses SET trainer = 'م. أحمد الريمي (تجريبي)'
WHERE status = 'open' AND trainer IS NULL;