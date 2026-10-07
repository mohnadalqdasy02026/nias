import { pool } from '../config/db.js';

const SELECT_COLLEGE = `
  SELECT c.id, c.branch_id,
         b.name_ar AS branch_name_ar, b.name_en AS branch_name_en, b.slug AS branch_slug,
         c.name_ar, c.name_en, c.vision, c.mission, c.about,
         c.dean_name, c.dean_name_ar, c.dean_name_en,
         c.dean_message_ar, c.dean_message_en,
         c.image, c.dean_image, c.status, c.created_at, c.updated_at
    FROM colleges c
    LEFT JOIN institute_branches b ON b.id = c.branch_id`;

export class CollegesRepository {
  async list() {
    const { rows } = await pool.query(`${SELECT_COLLEGE} ORDER BY c.id`);
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_COLLEGE} WHERE c.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async branchExists(id) {
    const { rows } = await pool.query('SELECT id FROM institute_branches WHERE id = $1', [id]);
    return rows[0] ? true : false;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO colleges
         (branch_id, name_ar, name_en, vision, mission, about,
          dean_name, dean_name_ar, dean_name_en,
          dean_message_ar, dean_message_en,
          image, dean_image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        data.branch_id ?? null,
        data.name_ar,
        data.name_en?.trim() ? data.name_en : null,
        data.vision?.trim() ? data.vision : null,
        data.mission?.trim() ? data.mission : null,
        data.about?.trim() ? data.about : null,
        data.dean_name?.trim() ? data.dean_name : null,
        data.dean_name_ar?.trim() ? data.dean_name_ar : null,
        data.dean_name_en?.trim() ? data.dean_name_en : null,
        data.dean_message_ar?.trim() ? data.dean_message_ar : null,
        data.dean_message_en?.trim() ? data.dean_message_en : null,
        data.image?.trim() ? data.image : null,
        data.dean_image?.trim() ? data.dean_image : null,
        data.status ?? 'active',
      ],
    );
    return this.findById(rows[0].id);
  }

  async update(id, data) {
    const fields = [
      'branch_id', 'name_ar', 'name_en', 'vision', 'mission', 'about',
      'dean_name', 'dean_name_ar', 'dean_name_en',
      'dean_message_ar', 'dean_message_en',
      'image', 'dean_image', 'status',
    ];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      params.push(data[f] ?? null);
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) return this.findById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE colleges SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async remove(id) {
    const { rows } = await pool.query('DELETE FROM colleges WHERE id = $1 RETURNING id', [id]);
    return rows[0] ? true : false;
  }

  async listDepartments(collegeId = null) {
    const params = [];
    let where = 'TRUE';
    if (collegeId) {
      params.push(collegeId);
      where = 'd.college_id = $1';
    }
    const { rows } = await pool.query(
      `SELECT d.id, d.college_id, d.name_ar, d.name_en, d.description,
              d.head_name_ar, d.head_title, d.head_photo, d.image,
              c.name_ar AS college_name_ar,
              (SELECT count(*)::int FROM academic_programs p
                WHERE p.department_id = d.id AND p.deleted_at IS NULL) AS programs_count,
              (SELECT count(*)::int FROM faculty_members f
                WHERE f.department_id = d.id AND f.deleted_at IS NULL) AS faculty_count
         FROM departments d
         LEFT JOIN colleges c ON c.id = d.college_id
        WHERE ${where} ORDER BY d.id`,
      params,
    );
    return rows;
  }

  async findDepartmentById(id) {
    const { rows } = await pool.query(
      `SELECT d.id, d.college_id, d.name_ar, d.name_en, d.description,
              d.head_name_ar, d.head_title, d.head_photo, d.image, d.created_at, d.updated_at
         FROM departments d WHERE d.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async createDepartment(data) {
    const { rows } = await pool.query(
      `INSERT INTO departments
         (college_id, name_ar, name_en, description, head_name_ar, head_title, head_photo, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.college_id,
        data.name_ar,
        data.name_en?.trim() ? data.name_en : null,
        data.description?.trim() ? data.description : null,
        data.head_name_ar?.trim() ? data.head_name_ar : null,
        data.head_title?.trim() ? data.head_title : null,
        data.head_photo?.trim() ? data.head_photo : null,
        data.image?.trim() ? data.image : null,
      ],
    );
    return this.findDepartmentById(rows[0].id);
  }

  async updateDepartment(id, data) {
    const fields = [
      'college_id',
      'name_ar',
      'name_en',
      'description',
      'head_name_ar',
      'head_title',
      'head_photo',
      'image',
    ];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      params.push(data[f] ?? null);
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) return this.findDepartmentById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE departments SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findDepartmentById(rows[0].id) : null;
  }

  async departmentUsage(id) {
    const { rows } = await pool.query(
      `SELECT
         (SELECT count(*)::int FROM academic_programs p WHERE p.department_id = $1 AND p.deleted_at IS NULL) AS programs_count,
         (SELECT count(*)::int FROM faculty_members f WHERE f.department_id = $1) AS faculty_count`,
      [id],
    );
    return rows[0];
  }

  async removeDepartment(id) {
    const { rows } = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    return rows[0] ? true : false;
  }
}