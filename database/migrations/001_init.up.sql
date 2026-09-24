-- ============================================================
-- NIAS Academy rebuild - 001: initial schema
-- DBMS: PostgreSQL (12+)
-- Migration 001 (up): creates all types, tables, indexes, constraints.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Enumerated types
-- ------------------------------------------------------------
CREATE TYPE user_status AS ENUM ('active', 'banned');
CREATE TYPE entity_status AS ENUM ('active', 'inactive');
CREATE TYPE program_type AS ENUM ('bachelor', 'diploma', 'master_executive', 'master_academic');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE news_type AS ENUM ('news', 'event', 'activity', 'course');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE student_status AS ENUM ('active', 'on_hold', 'graduated');
CREATE TYPE student_enrollment_status AS ENUM ('enrolled', 'completed', 'withdrawn');
CREATE TYPE result_status AS ENUM ('passed', 'failed');
CREATE TYPE elearning_enrollment_status AS ENUM ('enrolled', 'completed');
CREATE TYPE training_course_status AS ENUM ('draft', 'open', 'closed', 'completed');
CREATE TYPE training_enrollment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE message_status AS ENUM ('new', 'read', 'replied');
CREATE TYPE conference_status AS ENUM ('upcoming', 'open', 'closed');
CREATE TYPE article_status AS ENUM ('draft', 'in_review', 'published', 'rejected');

-- ------------------------------------------------------------
-- 2) updated_at auto-maintenance
-- ------------------------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 3) Tables (dependency order)
-- ------------------------------------------------------------

-- 3.1 RBAC ----------------------------------------------------
CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name_ar  VARCHAR(255) NOT NULL,
    full_name_en  VARCHAR(255),
    email         VARCHAR(190) UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500),
    status        user_status  NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE permissions (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 3.2 Institute structure --------------------------------------
CREATE TABLE institute_branches (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_ar         VARCHAR(255) NOT NULL UNIQUE,
    name_en         VARCHAR(255),
    slug            VARCHAR(190) NOT NULL UNIQUE,
    address         VARCHAR(500),
    phone           VARCHAR(20),
    is_headquarters BOOLEAN      NOT NULL DEFAULT FALSE,
    status          entity_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_institute_branches_updated_at BEFORE UPDATE ON institute_branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE colleges (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id  BIGINT REFERENCES institute_branches(id) ON DELETE SET NULL,
    name_ar    VARCHAR(255) NOT NULL,
    name_en    VARCHAR(255),
    vision     TEXT,
    mission    TEXT,
    about      TEXT,
    dean_name  VARCHAR(255),
    image      VARCHAR(500),
    status     entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_colleges_branch_id ON colleges (branch_id);

CREATE TABLE departments (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    college_id BIGINT REFERENCES colleges(id) ON DELETE CASCADE,
    name_ar    VARCHAR(255) NOT NULL,
    name_en    VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (college_id, name_ar)
);
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_departments_college_id ON departments (college_id);

CREATE TABLE faculty_members (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
    department_id  BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    name_ar        VARCHAR(255) NOT NULL,
    name_en        VARCHAR(255),
    title          VARCHAR(190),
    specialization VARCHAR(255),
    email          VARCHAR(190),
    phone          VARCHAR(20),
    photo          VARCHAR(500),
    is_dept_head   BOOLEAN NOT NULL DEFAULT FALSE,
    status         entity_status NOT NULL DEFAULT 'active',
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);
CREATE TRIGGER trg_faculty_members_updated_at BEFORE UPDATE ON faculty_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_faculty_members_department_id ON faculty_members (department_id);
CREATE INDEX idx_faculty_members_user_id ON faculty_members (user_id);

-- 3.3 Academic programs ----------------------------------------
CREATE TABLE academic_programs (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    college_id     BIGINT REFERENCES colleges(id) ON DELETE SET NULL,
    department_id  BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    name_ar        VARCHAR(255) NOT NULL,
    name_en        VARCHAR(255),
    program_type   program_type NOT NULL,
    duration_months INTEGER     NOT NULL,
    credit_hours   INTEGER,
    total_fees     NUMERIC(12, 2) CHECK (total_fees >= 0),
    description    TEXT,
    outcomes       TEXT,
    admission_open BOOLEAN NOT NULL DEFAULT FALSE,
    status         entity_status NOT NULL DEFAULT 'active',
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);
CREATE TRIGGER trg_academic_programs_updated_at BEFORE UPDATE ON academic_programs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_academic_programs_college_id ON academic_programs (college_id);
CREATE INDEX idx_academic_programs_department_id ON academic_programs (department_id);

CREATE TABLE program_plans (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES academic_programs(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    file_path  VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_program_plans_updated_at BEFORE UPDATE ON program_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_program_plans_program_id ON program_plans (program_id);

-- 3.4 Admission ------------------------------------------------
CREATE TABLE applicants (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    full_name   VARCHAR(255) NOT NULL,
    national_id VARCHAR(30)  NOT NULL UNIQUE,
    phone       VARCHAR(20)  NOT NULL,
    email       VARCHAR(190),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_applicants_updated_at BEFORE UPDATE ON applicants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE applications (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    applicant_id BIGINT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    program_id   BIGINT NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    status       application_status NOT NULL DEFAULT 'draft',
    notes        TEXT,
    applied_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_applications_applicant_id ON applications (applicant_id);
CREATE INDEX idx_applications_program_id ON applications (program_id);
CREATE INDEX idx_applications_status ON applications (status);

CREATE TABLE application_documents (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    doc_type       VARCHAR(50) NOT NULL,
    file_path      VARCHAR(500) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_application_documents_updated_at BEFORE UPDATE ON application_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_application_documents_application_id ON application_documents (application_id);

-- 3.5 Students, results, e-learning ----------------------------
CREATE TABLE students (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    academic_number VARCHAR(50) NOT NULL UNIQUE,
    branch_id       BIGINT REFERENCES institute_branches(id) ON DELETE SET NULL,
    college_id      BIGINT REFERENCES colleges(id) ON DELETE SET NULL,
    full_name       VARCHAR(255) NOT NULL,
    level           INTEGER CHECK (level >= 0),
    status          student_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_students_user_id ON students (user_id);
CREATE INDEX idx_students_branch_id ON students (branch_id);
CREATE INDEX idx_students_college_id ON students (college_id);
CREATE INDEX idx_students_status ON students (status);

CREATE TABLE student_enrollments (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id   BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    program_id   BIGINT NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    academic_year VARCHAR(20) NOT NULL,
    level        INTEGER NOT NULL CHECK (level >= 0),
    status       student_enrollment_status NOT NULL DEFAULT 'enrolled',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, program_id, academic_year, level)
);
CREATE TRIGGER trg_student_enrollments_updated_at BEFORE UPDATE ON student_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_student_enrollments_program_id ON student_enrollments (program_id);

CREATE TABLE student_results (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester   VARCHAR(20) NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    attempt    SMALLINT NOT NULL DEFAULT 1 CHECK (attempt >= 1),
    grade      NUMERIC(5, 2) CHECK (grade >= 0 AND grade <= 100),
    status     result_status NOT NULL DEFAULT 'passed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, semester, subject, attempt)
);
CREATE TRIGGER trg_student_results_updated_at BEFORE UPDATE ON student_results FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_student_results_student_semester ON student_results (student_id, semester);

CREATE TABLE student_documents (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    doc_type   VARCHAR(50) NOT NULL,
    file_path  VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_student_documents_updated_at BEFORE UPDATE ON student_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_student_documents_student_id ON student_documents (student_id);

CREATE TABLE elearning_courses (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title_ar    VARCHAR(255) NOT NULL,
    title_en    VARCHAR(255),
    description TEXT,
    thumbnail   VARCHAR(500),
    status      content_status NOT NULL DEFAULT 'draft',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_elearning_courses_updated_at BEFORE UPDATE ON elearning_courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE elearning_lessons (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id  BIGINT NOT NULL REFERENCES elearning_courses(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT,
    media_url  VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, sort_order)
);
CREATE TRIGGER trg_elearning_lessons_updated_at BEFORE UPDATE ON elearning_lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_elearning_lessons_course_id ON elearning_lessons (course_id);

CREATE TABLE elearning_enrollments (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id  BIGINT NOT NULL REFERENCES elearning_courses(id) ON DELETE CASCADE,
    progress   SMALLINT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status     elearning_enrollment_status NOT NULL DEFAULT 'enrolled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, course_id)
);
CREATE TRIGGER trg_elearning_enrollments_updated_at BEFORE UPDATE ON elearning_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_elearning_enrollments_course_id ON elearning_enrollments (course_id);

-- 3.6 Training ------------------------------------------------
CREATE TABLE training_users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    branch_id       BIGINT REFERENCES institute_branches(id) ON DELETE SET NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    signature_image VARCHAR(500),
    status          user_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_users_updated_at BEFORE UPDATE ON training_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_training_users_user_id ON training_users (user_id);
CREATE INDEX idx_training_users_branch_id ON training_users (branch_id);
CREATE INDEX idx_training_users_phone ON training_users (phone);

CREATE TABLE training_courses (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    fees        NUMERIC(12, 2) CHECK (fees >= 0),
    start_date  DATE,
    end_date    DATE,
    location    VARCHAR(190),
    capacity    INTEGER CHECK (capacity > 0),
    trainer     VARCHAR(190),
    status      training_course_status NOT NULL DEFAULT 'draft',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_courses_updated_at BEFORE UPDATE ON training_courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE training_enrollments (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trainee_id  BIGINT NOT NULL REFERENCES training_users(id) ON DELETE CASCADE,
    course_id   BIGINT NOT NULL REFERENCES training_courses(id) ON DELETE RESTRICT,
    status      training_enrollment_status NOT NULL DEFAULT 'pending',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_enrollments_updated_at BEFORE UPDATE ON training_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX uq_training_enrollments_active_trainee_course
    ON training_enrollments (trainee_id, course_id)
    WHERE status <> 'cancelled';
CREATE INDEX idx_training_enrollments_course_id ON training_enrollments (course_id);
CREATE INDEX idx_training_enrollments_status ON training_enrollments (status);

-- 3.7 Content (CMS) -------------------------------------------
CREATE TABLE site_pages (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          VARCHAR(190) NOT NULL UNIQUE,
    title_ar      VARCHAR(255) NOT NULL,
    title_en      VARCHAR(255),
    content_ar    TEXT,
    content_en    TEXT,
    primary_image VARCHAR(500),
    status        content_status NOT NULL DEFAULT 'draft',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);
CREATE TRIGGER trg_site_pages_updated_at BEFORE UPDATE ON site_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE news_categories (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_ar    VARCHAR(150) NOT NULL,
    name_en    VARCHAR(150),
    slug       VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_news_categories_updated_at BEFORE UPDATE ON news_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE news (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id  BIGINT REFERENCES news_categories(id) ON DELETE SET NULL,
    content_type news_type NOT NULL DEFAULT 'news',
    title_ar     VARCHAR(255) NOT NULL,
    title_en     VARCHAR(255),
    summary_ar   VARCHAR(500),
    summary_en   VARCHAR(500),
    body_ar      TEXT,
    body_en      TEXT,
    cover_image  VARCHAR(500),
    is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    status       content_status NOT NULL DEFAULT 'draft',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ
);
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_news_published_at ON news (published_at DESC);
CREATE INDEX idx_news_status_type ON news (status, content_type);
CREATE INDEX idx_news_featured ON news (is_featured) WHERE is_featured = TRUE;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_news_title_search ON news USING GIN (title_ar gin_trgm_ops, title_en gin_trgm_ops);

CREATE TABLE gallery_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    image      VARCHAR(500) NOT NULL,
    link       VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE download_files (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(100),
    file_path       VARCHAR(500) NOT NULL,
    downloads_count INTEGER NOT NULL DEFAULT 0 CHECK (downloads_count >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_download_files_updated_at BEFORE UPDATE ON download_files FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_download_files_category ON download_files (category);

CREATE TABLE conferences (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    location    VARCHAR(190),
    event_date  DATE,
    status      conference_status NOT NULL DEFAULT 'upcoming',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_conferences_updated_at BEFORE UPDATE ON conferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE contact_messages (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(190) NOT NULL,
    email      VARCHAR(190) NOT NULL,
    phone      VARCHAR(20),
    subject    VARCHAR(255),
    message    TEXT NOT NULL,
    status     message_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_contact_messages_status ON contact_messages (status);

CREATE TABLE trustees (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    position   VARCHAR(255),
    image      VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_trustees_updated_at BEFORE UPDATE ON trustees FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.8 Journal --------------------------------------------------
CREATE TABLE journal_categories (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_ar    VARCHAR(190) NOT NULL,
    name_en    VARCHAR(190),
    slug       VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_journal_categories_updated_at BEFORE UPDATE ON journal_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE journal_issues (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id  BIGINT REFERENCES journal_categories(id) ON DELETE SET NULL,
    title        VARCHAR(255) NOT NULL,
    cover        VARCHAR(500),
    file_path    VARCHAR(500),
    issue_number VARCHAR(50),
    published_at DATE,
    status       content_status NOT NULL DEFAULT 'draft',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_journal_issues_updated_at BEFORE UPDATE ON journal_issues FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_journal_issues_category_id ON journal_issues (category_id);

CREATE TABLE journal_articles (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id   BIGINT NOT NULL REFERENCES journal_issues(id) ON DELETE CASCADE,
    author_id  BIGINT REFERENCES faculty_members(id) ON DELETE SET NULL,
    title_ar   VARCHAR(255) NOT NULL,
    title_en   VARCHAR(255),
    abstract   TEXT,
    file_path  VARCHAR(500),
    status     article_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER trg_journal_articles_updated_at BEFORE UPDATE ON journal_articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_journal_articles_issue_id ON journal_articles (issue_id);
CREATE INDEX idx_journal_articles_status ON journal_articles (status);

CREATE TABLE journal_editorial_board (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    title      VARCHAR(190),
    photo      VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_journal_editorial_board_updated_at BEFORE UPDATE ON journal_editorial_board FOR EACH ROW EXECUTE FUNCTION set_updated_at();