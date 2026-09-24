-- ============================================================
-- NIAS Academy rebuild - 008: demo public content (down)
-- ============================================================

DELETE FROM conference_submissions WHERE conference_id IN (SELECT id FROM conferences WHERE title LIKE '%تجريبي%');
DELETE FROM training_enrollments WHERE course_id IN (SELECT id FROM training_courses WHERE title LIKE '%تجريبي%');
DELETE FROM conferences WHERE title LIKE '%تجريبي%';
DELETE FROM trustees WHERE name LIKE '%تجريبي%';
DELETE FROM training_courses WHERE description LIKE '%تجريبي%' AND status = 'open';
DELETE FROM download_files WHERE title LIKE '%تجريبي%';
DELETE FROM gallery_items WHERE title LIKE '%تجريبي%';
DELETE FROM news WHERE title_ar LIKE '%تجريبي%';
DELETE FROM news_categories WHERE slug = 'postgraduate';
DELETE FROM academic_programs WHERE name_ar LIKE '%تجريبي%';
DELETE FROM faculty_members WHERE name_ar LIKE '%تجريبي%';
DELETE FROM departments WHERE name_en = 'Demo Department';
DELETE FROM colleges WHERE name_en = 'Demo College';