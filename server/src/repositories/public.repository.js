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

  async listColleges() {
    const { rows } = await pool.query(
      `SELECT id, branch_id, name_ar, name_en, vision, mission, about, dean_name, image, dean_image
       FROM colleges WHERE status = 'active' ORDER BY id`,
    );
    return rows;
  }

  async listDepartments(collegeId = null) {
    const params = [];
    let where = 'TRUE';
    if (collegeId) {
      params.push(collegeId);
      where = `college_id = $1`;
    }
    const { rows } = await pool.query(
      `SELECT id, college_id, name_ar, name_en FROM departments WHERE ${where} ORDER BY id`,
      params,
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
              cover_image, latitude, longitude,
              dean_name_ar, dean_name_en, dean_message_ar, dean_message_en
       FROM institute_branches WHERE status = 'active' ORDER BY is_headquarters DESC, id`,
    );
    return rows;
  }

  async getBranchBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT id, name_ar, name_en, slug, address, phone, is_headquarters,
              cover_image, latitude, longitude,
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

  async listTrainingCourses({ branchId = null } = {}) {
    const params = [];
    let where = "c.status = 'open'";
    if (branchId) {
      params.push(branchId);
      where += ` AND c.branch_id = $${params.length}`;
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