import { pool } from '../config/db.js';

export class ProgramRepository {
  async list({ search, status, program_type, page = 1, limit = 20 } = {}) {
    const conditions = ['deleted_at IS NULL'];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name_ar ILIKE $${params.length} OR p.name_en ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }
    if (program_type) {
      params.push(program_type);
      conditions.push(`p.program_type = $${params.length}`);
    }

    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT p.id, p.college_id, p.department_id, p.branch_id,
              c.name_ar AS college_name_ar, d.name_ar AS department_name_ar, b.name_ar AS branch_name_ar,
              p.name_ar, p.name_en, p.program_type,
              p.description, p.outcomes, p.admission_open, p.status, p.image_url, p.created_at, p.updated_at
         FROM academic_programs p
         LEFT JOIN colleges c ON c.id = p.college_id
         LEFT JOIN departments d ON d.id = p.department_id
         LEFT JOIN institute_branches b ON b.id = p.branch_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const total = await this.count({ search, status, program_type });
    return { items: rows, total, page, limit };
  }

  async count({ search, status, program_type } = {}) {
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name_ar ILIKE $${params.length} OR name_en ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (program_type) {
      params.push(program_type);
      conditions.push(`program_type = $${params.length}`);
    }
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM academic_programs
        WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows[0].count;
  }

  async collegeExists(id) {
    const { rows } = await pool.query('SELECT id FROM colleges WHERE id = $1', [id]);
    return rows[0] ? true : false;
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
      `SELECT p.id, p.college_id, p.department_id, p.branch_id,
              c.name_ar AS college_name_ar, d.name_ar AS department_name_ar, b.name_ar AS branch_name_ar,
              p.name_ar, p.name_en, p.program_type,
              p.description, p.outcomes, p.admission_open, p.status, p.image_url, p.created_at, p.updated_at
         FROM academic_programs p
         LEFT JOIN colleges c ON c.id = p.college_id
         LEFT JOIN departments d ON d.id = p.department_id
         LEFT JOIN institute_branches b ON b.id = p.branch_id
        WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO academic_programs
         (college_id, department_id, branch_id, name_ar, name_en, program_type,
          description, outcomes, image_url, admission_open, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.college_id ?? null,
        data.department_id ?? null,
        data.branch_id ?? null,
        data.name_ar,
        data.name_en ?? null,
        data.program_type,
        data.description ?? null,
        data.outcomes ?? null,
        data.image_url ?? null,
        data.admission_open ?? false,
        data.status ?? 'active',
      ],
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = [
      'college_id',
      'department_id',
      'branch_id',
      'name_ar',
      'name_en',
      'program_type',
      'description',
      'outcomes',
      'image_url',
      'admission_open',
      'status',
    ];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      params.push(data[f] ?? null);
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) {
      const { rows } = await pool.query(
        'SELECT * FROM academic_programs WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      return rows[0] ?? null;
    }
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE academic_programs SET ${sets.join(', ')}
        WHERE id = $${params.length} AND deleted_at IS NULL
        RETURNING *`,
      params,
    );
    return rows[0] ?? null;
  }

  async softDelete(id) {
    const { rows } = await pool.query(
      `UPDATE academic_programs SET deleted_at = now()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *`,
      [id],
    );
    return rows[0] ?? null;
  }
}