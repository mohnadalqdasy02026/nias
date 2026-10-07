import { pool } from '../config/db.js';

export class PublicRepository {
  async listNewsByPage({ page = 1, limit = 9, categoryId = null, branchId = null }) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = "status = 'published' AND content_type IN ('news', 'event', 'activity', 'course')";
    if (categoryId) {
      params.push(categoryId);
      where += ` AND category_id = $${params.length}`;
    }
    if (branchId) {
      params.push(branchId);
      where += ` AND branch_id = $${params.length}`;
    }
    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT n.id, n.category_id, n.content_type, n.title_ar, n.title_en, n.summary_ar, n.summary_en,
              n.cover_image, n.is_featured, n.published_at, n.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug
       FROM news n
       LEFT JOIN institute_branches b ON b.id = n.branch_id
       WHERE n.${where}
       ORDER BY n.is_featured DESC, n.published_at DESC NULLS LAST, n.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return rows;
  }

  async getNewsById(id) {
    const { rows } = await pool.query(
      `SELECT n.id, n.category_id, n.content_type, n.title_ar, n.title_en, n.summary_ar, n.summary_en,
              n.body_ar, n.body_en, n.cover_image, n.is_featured, n.published_at, n.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug
       FROM news n
       LEFT JOIN institute_branches b ON b.id = n.branch_id
       WHERE n.id = $1 AND n.status = 'published' AND n.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listCategories() {
    const { rows } = await pool.query(
      'SELECT id, name_ar, name_en, slug FROM news_categories ORDER BY id',
    );
    return rows;
  }

  async listPrograms({ onlyOpen = false } = {}) {
    const where = [`p.status = 'active'`];
    if (onlyOpen) where.push(`p.admission_open = TRUE`);
    const { rows } = await pool.query(
      `SELECT p.id, p.college_id, p.department_id, p.branch_id,
              c.name_ar AS college_name_ar, d.name_ar AS department_name_ar, b.name_ar AS branch_name_ar,
              p.name_ar, p.name_en, p.program_type,
              p.description, p.admission_open, p.image_url
       FROM academic_programs p
       LEFT JOIN colleges c ON c.id = p.college_id
       LEFT JOIN departments d ON d.id = p.department_id
       LEFT JOIN institute_branches b ON b.id = p.branch_id
       WHERE p.deleted_at IS NULL AND ${where.join(' AND ')}
       ORDER BY p.id`,
    );
    return rows;
  }

  async getProgramById(id) {
    const { rows } = await pool.query(
      `SELECT p.id, p.college_id, p.department_id, p.branch_id,
              c.name_ar AS college_name_ar, d.name_ar AS department_name_ar,
              b.name_ar AS branch_name_ar, b.is_headquarters AS branch_is_hq, b.slug AS branch_slug,
p.name_ar, p.name_en, p.program_type,
               p.description, p.outcomes, p.admission_open, p.image_url, c.dean_name
       FROM academic_programs p
       LEFT JOIN colleges c ON c.id = p.college_id
       LEFT JOIN departments d ON d.id = p.department_id
       LEFT JOIN institute_branches b ON b.id = p.branch_id
       WHERE p.id = $1 AND p.status = 'active' AND p.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listColleges(branchId = null) {
    const params = [];
    let where = "c.status = 'active'";
    if (branchId) {
      params.push(branchId);
      where += ` AND c.branch_id = $1`;
    }
    const { rows } = await pool.query(
      `SELECT c.id, c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug,
              c.name_ar, c.name_en, c.vision, c.mission, c.about,
              c.dean_name, c.dean_name_ar, c.dean_name_en,
              c.dean_message_ar, c.dean_message_en,
              c.image, c.dean_image
         FROM colleges c
         LEFT JOIN institute_branches b ON b.id = c.branch_id
        WHERE ${where} ORDER BY c.id`,
      params,
    );
    return rows;
  }

  async getCollegeById(id) {
    const { rows } = await pool.query(
      `SELECT c.id, c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug,
              c.name_ar, c.name_en, c.vision, c.mission, c.about,
              c.dean_name, c.dean_name_ar, c.dean_name_en,
              c.dean_message_ar, c.dean_message_en,
              c.image, c.dean_image
         FROM colleges c
         LEFT JOIN institute_branches b ON b.id = c.branch_id
        WHERE c.id = $1 AND c.status = 'active'`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listDepartments(collegeId = null) {
    const params = [];
    let where = 'TRUE';
    if (collegeId) {
      params.push(collegeId);
      where = `d.college_id = $1`;
    }
    const { rows } = await pool.query(
      `SELECT d.id, d.college_id, d.name_ar, d.name_en, d.description,
              d.head_name_ar, d.head_title, d.head_photo, d.image,
              c.name_ar AS college_name_ar, c.name_en AS college_name_en,
              c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug,
              (SELECT count(*)::int FROM academic_programs p
                WHERE p.department_id = d.id AND p.status = 'active' AND p.deleted_at IS NULL) AS programs_count,
              (SELECT count(*)::int FROM faculty_members f
                WHERE f.department_id = d.id AND f.status = 'active' AND f.deleted_at IS NULL) AS faculty_count
         FROM departments d
         LEFT JOIN colleges c ON c.id = d.college_id
         LEFT JOIN institute_branches b ON b.id = c.branch_id
        WHERE ${where} ORDER BY d.id`,
      params,
    );
    return rows;
  }

  async getDepartmentById(id) {
    const { rows } = await pool.query(
      `SELECT d.id, d.college_id, d.name_ar, d.name_en, d.description,
              d.head_name_ar, d.head_title, d.head_photo, d.image,
              c.name_ar AS college_name_ar, c.name_en AS college_name_en,
              c.about AS college_about, c.vision AS college_vision, c.mission AS college_mission,
              c.dean_name, c.dean_name_ar, c.dean_name_en, c.image AS college_image,
              c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug
         FROM departments d
         LEFT JOIN colleges c ON c.id = d.college_id
         LEFT JOIN institute_branches b ON b.id = c.branch_id
        WHERE d.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listDepartmentPrograms(departmentId) {
    const { rows } = await pool.query(
      `SELECT p.id, p.department_id, p.branch_id, p.program_type,
              p.name_ar, p.name_en, p.description, p.admission_open, p.image_url
         FROM academic_programs p
        WHERE p.department_id = $1 AND p.status = 'active' AND p.deleted_at IS NULL
        ORDER BY p.id`,
      [departmentId],
    );
    return rows;
  }

  async listDepartmentFaculty(departmentId) {
    const { rows } = await pool.query(
      `SELECT id, branch_id, department_id, name_ar, name_en, title, specialization, email, phone, photo,
              is_dept_head
         FROM faculty_members
        WHERE department_id = $1 AND status = 'active' AND deleted_at IS NULL
        ORDER BY is_dept_head DESC, id`,
      [departmentId],
    );
    return rows;
  }

  async listCoursesByProgram(programId) {
    const { rows } = await pool.query(
      `SELECT id, program_id, level_no, semester_no, course_code, name_ar, name_en, credit_hours, is_optional
         FROM program_courses
        WHERE program_id = $1
        ORDER BY level_no, semester_no, course_code`,
      [programId],
    );
    return rows;
  }

  async listFaculty(branchId = null) {
    const params = [];
    let where = 'status = \'active\' AND deleted_at IS NULL';
    if (branchId) {
      params.push(branchId);
      where += ' AND branch_id = $1';
    }
    const { rows } = await pool.query(
      `SELECT id, branch_id, department_id, name_ar, name_en, title, specialization, email, phone, photo
       FROM faculty_members WHERE ${where} ORDER BY id`,
      params,
    );
    return rows;
  }

  async listBranches() {
    const { rows } = await pool.query(
      `SELECT id, name_ar, name_en, slug, address, phone, is_headquarters,
              dean_image, latitude, longitude,
              dean_name_ar, dean_name_en, dean_message_ar, dean_message_en
       FROM institute_branches WHERE status = 'active' ORDER BY is_headquarters DESC, id`,
    );
    return rows;
  }

  async getBranchBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT id, name_ar, name_en, slug, address, phone, is_headquarters,
              dean_image, latitude, longitude,
              dean_name_ar, dean_name_en, dean_message_ar, dean_message_en
       FROM institute_branches WHERE status = 'active' AND slug = $1`,
      [slug],
    );
    return rows[0] ?? null;
  }

  async listGallery() {
    const { rows } = await pool.query(
      'SELECT id, title, image, link, sort_order FROM gallery_items ORDER BY sort_order, id',
    );
    return rows;
  }

  async listDownloads() {
    const { rows } = await pool.query(
      'SELECT id, title, category, file_path, downloads_count FROM download_files ORDER BY id',
    );
    return rows;
  }

  async listConferences() {
    const { rows } = await pool.query(
      `SELECT id, title, description, location, event_date, status
       FROM conferences WHERE status IN ('open', 'upcoming') ORDER BY event_date`,
    );
    return rows;
  }

  async listTrustees() {
    const { rows } = await pool.query(
      'SELECT id, name, position, image, sort_order FROM trustees ORDER BY sort_order, id',
    );
    return rows;
  }

  async listJournalIssues() {
    const { rows } = await pool.query(
      "SELECT id, title, cover, file_path, issue_number, published_at FROM journal_issues WHERE status = 'published' ORDER BY published_at DESC",
    );
    return rows;
  }

  async listJournalArticles(issueId = null) {
    const params = [];
    let where = `a.status = 'published'`;
    if (issueId) {
      params.push(issueId);
      where += ` AND a.issue_id = $1`;
    }
    const { rows } = await pool.query(
      `SELECT a.id, a.issue_id, a.title_ar, a.author_id, fm.name_ar AS author_name_ar
       FROM journal_articles a
       LEFT JOIN faculty_members fm ON fm.id = a.author_id
       WHERE ${where} ORDER BY a.id`,
      params,
    );
    return rows;
  }

  async listTrainingCourses({ branchId = null, category = null } = {}) {
    const params = [];
    let where = "c.status = 'open'";
    if (branchId) {
      params.push(branchId);
      where += ` AND c.branch_id = $${params.length}`;
    }
    if (category) {
      params.push(category);
      where += ` AND COALESCE(c.category, 'course') = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT c.id, c.title, c.description, c.fees, c.start_date, c.end_date, c.location,
              c.capacity, c.trainer, c.category, c.image_url, c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug
       FROM training_courses c
       LEFT JOIN institute_branches b ON b.id = c.branch_id
       WHERE ${where} ORDER BY c.start_date NULLS LAST, c.id`,
      params,
    );
    return rows;
  }

  async getTrainingCourse(id) {
    const { rows } = await pool.query(
      `SELECT c.id, c.title, c.description, c.fees, c.start_date, c.end_date, c.location,
              c.capacity, c.trainer, c.category, c.image_url, c.status, c.branch_id,
              b.name_ar AS branch_name_ar, b.slug AS branch_slug
       FROM training_courses c
       LEFT JOIN institute_branches b ON b.id = c.branch_id
       WHERE c.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listPages() {
    const { rows } = await pool.query(
      `SELECT id, slug, title_ar, title_en, content_ar, content_en, primary_image
       FROM site_pages WHERE status = 'published' AND deleted_at IS NULL ORDER BY id`,
    );
    return rows;
  }

  async getPageBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT id, slug, title_ar, title_en, content_ar, content_en, primary_image
       FROM site_pages WHERE slug = $1 AND status = 'published'`,
      [slug],
    );
    return rows[0] ?? null;
  }
}