import { pool } from '../config/db.js';

const SELECT = `
  SELECT id, title, category, file_path, downloads_count, created_at, updated_at
    FROM download_files`;

export class DownloadsRepository {
  async list() {
    const { rows } = await pool.query(`${SELECT} ORDER BY category NULLS LAST, id`);
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(`${SELECT} WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO download_files (title, category, file_path)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.title, data.category?.trim() ? data.category : null, data.file_path],
    );
    return this.findById(rows[0].id);
  }

  async update(id, data) {
    const fields = ['title', 'category', 'file_path'];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      params.push(data[f] === '' ? null : data[f]);
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) return this.findById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE download_files SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async remove(id) {
    const { rows } = await pool.query('DELETE FROM download_files WHERE id = $1 RETURNING id', [id]);
    return rows[0] ? true : false;
  }
}
