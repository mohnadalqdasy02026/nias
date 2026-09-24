import { pool } from '../config/db.js';

export class CollegesRepository {
  async list() {
    const { rows } = await pool.query(
      `SELECT id, branch_id, name_ar, name_en, vision, mission, about,
              dean_name, image, dean_image, status, created_at, updated_at
         FROM colleges ORDER BY id`,
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, branch_id, name_ar, name_en, vision, mission, about,
              dean_name, image, dean_image, status
         FROM colleges WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async update(id, data) {
    const fields = [];
    const values = [id];
    const editable = [
      'branch_id', 'name_ar', 'name_en', 'vision', 'mission', 'about',
      'dean_name', 'image', 'dean_image', 'status',
    ];
    for (const key of editable) {
      if (data[key] !== undefined) {
        values.push(data[key] ?? null);
        fields.push(`${key} = $${values.length}`);
      }
    }
    if (fields.length === 0) return this.findById(id);
    const { rows } = await pool.query(
      `UPDATE colleges SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $1 RETURNING id, branch_id, name_ar, name_en, vision, mission, about,
                                  dean_name, image, dean_image, status`,
      values,
    );
    return rows[0] ?? null;
  }
}