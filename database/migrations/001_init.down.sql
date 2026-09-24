-- ============================================================
-- NIAS Academy rebuild - 001: initial schema
-- DBMS: PostgreSQL (12+)
-- Migration 001 (down): drops everything created by 001 up.
-- ============================================================

DROP TABLE IF EXISTS journal_editorial_board;
DROP TABLE IF EXISTS journal_articles;
DROP TABLE IF EXISTS journal_issues;
DROP TABLE IF EXISTS journal_categories;

DROP TABLE IF EXISTS trustees;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS conferences;
DROP TABLE IF EXISTS download_files;
DROP TABLE IF EXISTS gallery_items;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS news_categories;
DROP TABLE IF EXISTS site_pages;

DROP TABLE IF EXISTS training_enrollments;
DROP TABLE IF EXISTS training_courses;
DROP TABLE IF EXISTS training_users;

DROP TABLE IF EXISTS elearning_enrollments;
DROP TABLE IF EXISTS elearning_lessons;
DROP TABLE IF EXISTS elearning_courses;

DROP TABLE IF EXISTS student_documents;
DROP TABLE IF EXISTS student_results;
DROP TABLE IF EXISTS student_enrollments;
DROP TABLE IF EXISTS students;

DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS applicants;

DROP TABLE IF EXISTS program_plans;
DROP TABLE IF EXISTS academic_programs;
DROP TABLE IF EXISTS faculty_members;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS institute_branches;

DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

DROP FUNCTION IF EXISTS set_updated_at();

DROP TYPE IF EXISTS article_status;
DROP TYPE IF EXISTS conference_status;
DROP TYPE IF EXISTS message_status;
DROP TYPE IF EXISTS training_enrollment_status;
DROP TYPE IF EXISTS training_course_status;
DROP TYPE IF EXISTS elearning_enrollment_status;
DROP TYPE IF EXISTS result_status;
DROP TYPE IF EXISTS student_enrollment_status;
DROP TYPE IF EXISTS student_status;
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS news_type;
DROP TYPE IF EXISTS content_status;
DROP TYPE IF EXISTS program_type;
DROP TYPE IF EXISTS entity_status;
DROP TYPE IF EXISTS user_status;

DROP EXTENSION IF EXISTS pg_trgm;