import { pool } from '../config/db.js';

const BASE_SELECT = `SELECT id, slug, title_ar, title_en, content_ar, content_en,
                            primary_image, status, created_at, updated_at FROM site_pages`;

export class PageRepository {
  async list() {
    const { rows } = await pool.query(`${BASE_SELECT} ORDER BY slug`);
    return rows;
  }

  async get(id) {
    const { rows } = await pool.query(`${BASE_SELECT} WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async findBySlug(slug) {
    const { rows } = await pool.query(`${BASE_SELECT} WHERE slug = $1`, [slug]);
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO site_pages (slug, title_ar, title_en, content_ar, content_en, primary_image, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [data.slug, data.title_ar, data.title_en ?? null, data.content_ar ?? null,
       data.content_en ?? null, data.primary_image ?? null, data.status ?? 'draft'],
    );
    return this.get(rows[0].id);
  }

  async update(id, data) {
    const sets = [];
    const args = [];
    const push = (col, value) => {
      args.push(value);
      sets.push(`${col} = $${args.length}`);
    };
    if (data.slug !== undefined) push('slug', data.slug);
    if (data.title_ar !== undefined) push('title_ar', data.title_ar);
    if (data.title_en !== undefined) push('title_en', data.title_en ?? null);
    if (data.content_ar !== undefined) push('content_ar', data.content_ar ?? null);
    if (data.content_en !== undefined) push('content_en', data.content_en ?? null);
    if (data.primary_image !== undefined) push('primary_image', data.primary_image ?? null);
    if (data.status !== undefined) push('status', data.status);
    if (sets.length === 0) return this.get(id);
    args.push(id);
    await pool.query(`UPDATE site_pages SET ${sets.join(', ')} WHERE id = $${args.length}`, args);
    return this.get(id);
  }

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM site_pages WHERE id = $1', [id]);
    return rowCount > 0;
  }
}