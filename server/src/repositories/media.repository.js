import { pool } from '../config/db.js';

export class MediaRepository {
  async list({ search, type, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];
    let where = '';

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(file_name ILIKE $${params.length} OR alt_text ILIKE $${params.length})`);
    }
    if (type) {
      params.push(type);
      conditions.push(`file_type ILIKE $${params.length}`);
    }
    if (conditions.length > 0) where = `WHERE ${conditions.join(' AND ')}`;

    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT id, file_name, file_path, file_type, file_size, alt_text, uploaded_by,
              created_at, updated_at
         FROM media_library
         ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const total = await this.count({ search, type });
    return { items: rows, total, page, limit };
  }

  async count({ search, type } = {}) {
    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(file_name ILIKE $${params.length} OR alt_text ILIKE $${params.length})`);
    }
    if (type) {
      params.push(type);
      conditions.push(`file_type ILIKE $${params.length}`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM media_library ${where}`,
      params,
    );
    return rows[0].count;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM media_library WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO media_library (file_name, file_path, file_type, file_size, alt_text, uploaded_by, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, file_name, file_path, file_type, file_size, alt_text, uploaded_by, created_at, updated_at`,
      [data.file_name, data.file_path, data.file_type, data.file_size, data.alt_text, data.uploaded_by, data.data ?? null],
    );
    return rows[0];
  }

  async findDataByPath(filePath) {
    const { rows } = await pool.query(
      `SELECT file_type, data FROM media_library WHERE file_path = $1 AND data IS NOT NULL LIMIT 1`,
      [filePath],
    );
    return rows[0] ?? null;
  }

  async update(id, data) {
    const { rows } = await pool.query(
      `UPDATE media_library SET alt_text = COALESCE($2, alt_text), file_name = COALESCE($3, file_name)
        WHERE id = $1
        RETURNING *`,
      [id, data.alt_text ?? null, data.file_name ?? null],
    );
    return rows[0] ?? null;
  }

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM media_library WHERE id = $1 RETURNING *`,
      [id],
    );
    return rows[0] ?? null;
  }
}