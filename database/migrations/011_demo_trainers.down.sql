-- 011 (down): remove demo trainers + unset trainer link
UPDATE training_courses SET trainer = NULL WHERE trainer = 'م. أحمد الريمي (تجريبي)';
DELETE FROM trainers WHERE full_name IN
    ('م. أحمد الريمي (تجريبي)', 'د. سارة الحداء (تجريبية)');