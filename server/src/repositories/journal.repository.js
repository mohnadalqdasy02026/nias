import { pool } from '../config/db.js';

const SELECT = `
  SELECT id, category_id, title, cover, file_path, issue_number, published_at, status, created_at, updated_at
    FROM journal_issues`;

export class JournalRepository {
  async list() {
    const { rows } = await pool.query(`${SELECT} ORDER BY published_at DESC NULLS LAST, id DESC`);
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(`${SELECT} WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO journal_issues (category_id, title, cover, file_path, issue_number, published_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.category_id ?? null,
        data.title,
        data.cover?.trim() ? data.cover : null,
        data.file_path?.trim() ? data.file_path : null,
        data.issue_number?.trim() ? data.issue_number : null,
        data.published_at?.trim() ? data.published_at : null,
        data.status ?? 'draft',
      ],
    );
    return this.findById(rows[0].id);
  }

  async update(id, data) {
    const fields = ['category_id', 'title', 'cover', 'file_path', 'issue_number', 'published_at', 'status'];
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
      `UPDATE journal_issues SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async remove(id) {
    const { rows } = await pool.query('DELETE FROM journal_issues WHERE id = $1 RETURNING id', [id]);
    return Boolean(rows[0]);
  }
}
