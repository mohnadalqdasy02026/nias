import { pool } from '../config/db.js';

const BASE_SELECT = `
  SELECT n.id, n.category_id, n.content_type, n.title_ar, n.title_en,
         n.summary_ar, n.summary_en, n.body_ar, n.body_en,
         n.cover_image, n.is_featured, n.published_at, n.status, n.created_at, n.updated_at,
         n.branch_id, c.name_ar AS category_name, b.name_ar AS branch_name_ar
  FROM news n
  LEFT JOIN news_categories c ON c.id = n.category_id
  LEFT JOIN institute_branches b ON b.id = n.branch_id`;

export class NewsRepository {
  async list({ status, categoryId, branchId, page = 1, limit = 20 }) {
    const conditions = [];
    const args = [];
    if (status) {
      args.push(status);
      conditions.push(`n.status = $${args.length}`);
    }
    if (categoryId) {
      args.push(categoryId);
      conditions.push(`n.category_id = $${args.length}`);
    }
    if (branchId) {
      args.push(branchId);
      conditions.push(`n.branch_id = $${args.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `${BASE_SELECT} ${where} ORDER BY n.published_at DESC NULLS LAST, n.id DESC
         LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
        [...args, limit, (page - 1) * limit],
      ),
      pool.query(`SELECT count(*)::int AS total FROM news n ${where}`, args),
    ]);
    return { items: rows, total: countRows[0]?.total ?? 0, page, limit };
  }

  async get(id) {
    const { rows } = await pool.query(`${BASE_SELECT} WHERE n.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO news (category_id, content_type, title_ar, title_en, summary_ar,
                         summary_en, body_ar, body_en, cover_image, is_featured, status, branch_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [data.category_id, data.content_type ?? 'news', data.title_ar, data.title_en ?? null,
       data.summary_ar ?? null, data.summary_en ?? null, data.body_ar ?? null,
       data.body_en ?? null, data.cover_image ?? null, data.is_featured ?? false,
       data.status ?? 'draft', data.branch_id ?? null],
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
    if (data.category_id !== undefined) push('category_id', data.category_id);
    if (data.content_type !== undefined) push('content_type', data.content_type);
    if (data.title_ar !== undefined) push('title_ar', data.title_ar);
    if (data.title_en !== undefined) push('title_en', data.title_en ?? null);
    if (data.summary_ar !== undefined) push('summary_ar', data.summary_ar ?? null);
    if (data.summary_en !== undefined) push('summary_en', data.summary_en ?? null);
    if (data.body_ar !== undefined) push('body_ar', data.body_ar ?? null);
    if (data.body_en !== undefined) push('body_en', data.body_en ?? null);
    if (data.cover_image !== undefined) push('cover_image', data.cover_image ?? null);
    if (data.is_featured !== undefined) push('is_featured', data.is_featured);
    if (data.status !== undefined) push('status', data.status);
    if (data.branch_id !== undefined) push('branch_id', data.branch_id);
    if (data.status === 'published') push('published_at', new Date());
    if (sets.length === 0) return this.get(id);
    args.push(id);
    await pool.query(`UPDATE news SET ${sets.join(', ')} WHERE id = $${args.length}`, args);
    return this.get(id);
  }

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM news WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

export class NewsCategoryRepository {
  async list() {
    const { rows } = await pool.query(
      'SELECT id, name_ar, name_en, slug FROM news_categories ORDER BY name_ar',
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name_ar, name_en, slug FROM news_categories WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }

  async findBySlug(slug) {
    const { rows } = await pool.query(
      'SELECT id, name_ar, name_en, slug FROM news_categories WHERE slug = $1',
      [slug],
    );
    return rows[0] ?? null;
  }

  async create({ nameAr, nameEn, slug }) {
    const { rows } = await pool.query(
      `INSERT INTO news_categories (name_ar, name_en, slug) VALUES ($1,$2,$3)
       RETURNING id, name_ar, name_en, slug`,
      [nameAr, nameEn ?? null, slug],
    );
    return rows[0];
  }

  async update(id, { nameAr, nameEn, slug }) {
    const { rowCount } = await pool.query(
      `UPDATE news_categories SET name_ar = $1, name_en = $2, slug = $3 WHERE id = $4`,
      [nameAr, nameEn ?? null, slug, id],
    );
    if (rowCount === 0) return null;
    return this.findById(id);
  }

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM news_categories WHERE id = $1', [id]);
    return rowCount > 0;
  }
}