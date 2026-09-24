import { pool } from '../config/db.js';

export class BranchesRepository {
  async list() {
    const { rows } = await pool.query(
      `SELECT id, slug, name_ar, name_en, address, phone, is_headquarters,
              dean_name_ar, dean_name_en, dean_message_ar, dean_message_en, created_at, updated_at
         FROM institute_branches
        ORDER BY is_headquarters DESC, id`,
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, slug, name_ar, name_en, address, phone, is_headquarters,
              dean_name_ar, dean_name_en, dean_message_ar, dean_message_en
         FROM institute_branches WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async update(id, data) {
    const fields = [];
    const values = [id];
    const editable = ['name_ar', 'name_en', 'address', 'phone', 'dean_name_ar', 'dean_name_en', 'dean_message_ar', 'dean_message_en'];
    for (const key of editable) {
      if (data[key] !== undefined) {
        values.push(data[key] ?? null);
        fields.push(`${key} = $${values.length}`);
      }
    }
    if (fields.length === 0) return this.findById(id);
    const { rows } = await pool.query(
      `UPDATE institute_branches SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $1 RETURNING id, slug, name_ar, name_en, address, phone, is_headquarters,
                                  dean_name_ar, dean_name_en, dean_message_ar, dean_message_en`,
      values,
    );
    return rows[0] ?? null;
  }
}