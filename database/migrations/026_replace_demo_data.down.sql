-- ============================================================
-- NIAS Academy - 026 (down)
-- Re-seeds the demo rows that this migration removed, so a
-- rollback restores the previous dev/dev-seeded state.
-- ============================================================

DELETE FROM gallery_items WHERE sort_order IN (1,2,3,4)
   AND image LIKE '/uploads/design/site/%';
DELETE FROM training_courses WHERE title IN
   ('دورة الأمن السيبراني المتقدمة', 'تطوير تطبيقات الويب', 'إدارة المشاريع PMP');
DELETE FROM academic_programs WHERE name_ar IN
   ('بكالوريوس إدارة أعمال', 'بكالوريوس المحاسبة والمراجعة',
    'بكالوريوس الاقتصاد والعلوم المالية والمصرفية', 'بكالوريوس النظم وتقنية المعلومات',
    'بكالوريوس القانون والإدارة المحلية', 'ماجستير أكاديمي إدارة عامة',
    'ماجستير إدارة عامة وموارد بشرية', 'دبلوم متوسط محاسبة', 'دبلوم متوسط إدارة أعمال',
    'دبلوم متوسط إدارة مكاتب', 'دبلوم متوسط برمجة حاسوب',
    'دبلوم متوسط جرافكس وملتيميديا', 'دبلوم متوسط إدارة مستشفيات وإدارة صحية');
DELETE FROM news WHERE title_ar IN
   ('المعهد ينفذ ورشة تدريبية ليوم واحد حول الأمن والسلامة',
    'يعلن مركز التدريب في المعهد الوطني عن بدء التسجيل في الدورات القصيرة',
    'بدء التسجيل في الدورات القصيرة',
    'اختتام برنامجين تدريبيين للمؤسسة العامة للاتصالات',
    'فعالية للقطاع النسائي بوزارة الخدمة المدنية بذكرى المولد النبوي الشريف',
    'المعهد يختتم برنامج الإكسل المتقدم للهيئة العامة للزكاة');

-- Restore demo seed rows (as originally created by 002/008)
INSERT INTO colleges (branch_id, name_ar, name_en, dean_name, status)
SELECT id, 'كلية تجريبية', 'Demo College', 'د. عميد تجريبي', 'active'
FROM institute_branches WHERE slug = 'sanaa'
ON CONFLICT DO NOTHING;
INSERT INTO departments (college_id, name_ar, name_en)
SELECT id, 'قسم تجريبي', 'Demo Department' FROM colleges WHERE name_en = 'Demo College'
ON CONFLICT DO NOTHING;
INSERT INTO academic_programs (college_id, name_ar, name_en, program_type, admission_open, status)
SELECT c.id, 'برنامج تجريبي لإدارة الأعمال', 'Demo BA Program', 'bachelor', TRUE, 'active'
FROM colleges c WHERE c.name_en = 'Demo College'
ON CONFLICT DO NOTHING;