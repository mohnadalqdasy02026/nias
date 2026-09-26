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
}