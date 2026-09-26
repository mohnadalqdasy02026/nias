import { pool } from '../config/db.js';

export class FacultyRepository {
  async list({ search, status, department_id, branch_id, title, page = 1, limit = 20 } = {}) {
    const conditions = ['f.deleted_at IS NULL'];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(f.name_ar ILIKE $${params.length} OR f.name_en ILIKE $${params.length} OR f.title ILIKE $${params.length} OR f.specialization ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`f.status = $${params.length}`);
    }
    if (department_id) {
      params.push(department_id);
      conditions.push(`f.department_id = $${params.length}`);
    }
    if (branch_id) {
      params.push(branch_id);
      conditions.push(`f.branch_id = $${params.length}`);
    }
    if (title) {
      params.push(title);
      conditions.push(`f.title = $${params.length}`);
    }

    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT f.id, f.user_id, f.department_id, f.branch_id,
              d.name_ar AS department_name_ar, b.name_ar AS branch_name_ar,
              f.name_ar, f.name_en, f.title, f.specialization,
              f.email, f.phone, f.photo, f.is_dept_head, f.status,
              f.created_at, f.updated_at
         FROM faculty_members f
         LEFT JOIN departments d ON d.id = f.department_id
         LEFT JOIN institute_branches b ON b.id = f.branch_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY f.is_dept_head DESC, f.id
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const total = await this.count({ search, status, department_id, branch_id, title });
    return { items: rows, total, page, limit };
  }

  async count({ search, status, department_id, branch_id, title } = {}) {
    const conditions = ['f.deleted_at IS NULL'];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(f.name_ar ILIKE $${params.length} OR f.name_en ILIKE $${params.length} OR f.title ILIKE $${params.length} OR f.specialization ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`f.status = $${params.length}`);
    }
    if (department_id) {
      params.push(department_id);
      conditions.push(`f.department_id = $${params.length}`);
    }
    if (branch_id) {
      params.push(branch_id);
      conditions.push(`f.branch_id = $${params.length}`);
    }
    if (title) {
      params.push(title);
      conditions.push(`f.title = $${params.length}`);
    }
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM faculty_members f
        WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows[0].count;
  }

  async departmentExists(id) {
    const { rows } = await pool.query('SELECT id FROM departments WHERE id = $1', [id]);
    return rows[0] ? true : false;
  }

  async branchExists(id) {
    const { rows } = await pool.query('SELECT id FROM institute_branches WHERE id = $1', [id]);
    return rows[0] ? true : false;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT f.id, f.user_id, f.department_id, f.branch_id,
              d.name_ar AS department_name_ar, b.name_ar AS branch_name_ar,
              f.name_ar, f.name_en, f.title, f.specialization,
              f.email, f.phone, f.photo, f.is_dept_head, f.status,
              f.created_at, f.updated_at
         FROM faculty_members f
         LEFT JOIN departments d ON d.id = f.department_id
         LEFT JOIN institute_branches b ON b.id = f.branch_id
        WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO faculty_members
         (user_id, department_id, branch_id, name_ar, name_en, title,
          specialization, email, phone, photo, is_dept_head, status)
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.department_id ?? null,
        data.branch_id ?? null,
        data.name_ar,
        data.name_en?.trim() ? data.name_en : null,
        data.title?.trim() ? data.title : null,
        data.specialization?.trim() ? data.specialization : null,
        data.email?.trim() ? data.email : null,
        data.phone?.trim() ? data.phone : null,
        data.photo || null,
        data.is_dept_head ?? false,
        data.status ?? 'active',
      ],
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = [
      'department_id',
      'branch_id',
      'name_ar',
      'name_en',
      'title',
      'specialization',
      'email',
      'phone',
      'photo',
      'is_dept_head',
      'status',
    ];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      if (f === 'photo' && !data[f]) {
        params.push(null);
      } else {
        params.push(data[f] ?? null);
      }
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) {
      const { rows } = await pool.query(
        'SELECT * FROM faculty_members WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      return rows[0] ?? null;
    }
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE faculty_members SET ${sets.join(', ')}
        WHERE id = $${params.length} AND deleted_at IS NULL
        RETURNING *`,
      params,
    );
    return rows[0] ?? null;
  }

  async softDelete(id) {
    const { rows } = await pool.query(
      `UPDATE faculty_members SET deleted_at = now()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listTitles({ branch_id } = {}) {
    const params = [];
    let where = 'deleted_at IS NULL AND title IS NOT NULL AND trim(title) <> \'\'';
    if (branch_id) {
      params.push(branch_id);
      where += ` AND branch_id = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT DISTINCT title
         FROM faculty_members
        WHERE ${where}
        ORDER BY title`,
      params,
    );
    return rows.map((r) => r.title.trim());
  }
}