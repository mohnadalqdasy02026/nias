import { pool } from '../config/db.js';

export class AdminRepository {
  async getDashboardStats() {
    const queries = {
      branches: `SELECT count(*)::int AS count FROM institute_branches WHERE status = 'active'`,
      programs: `SELECT count(*)::int AS count FROM academic_programs WHERE status = 'active'`,
      newsPublished: `SELECT count(*)::int AS count FROM news WHERE status = 'published'`,
      newsDrafts: `SELECT count(*)::int AS count FROM news WHERE status = 'draft'`,
      pagesPublished: `SELECT count(*)::int AS count FROM site_pages WHERE status = 'published'`,
      trainingCourses: `SELECT count(*)::int AS count FROM training_courses WHERE status = 'open'`,
      trainingEnrollments: `SELECT count(*)::int AS count FROM training_enrollments`,
      contactNew: `SELECT count(*)::int AS count FROM contact_messages WHERE status = 'new'`,
      contactTotal: `SELECT count(*)::int AS count FROM contact_messages`,
      usersActive: `SELECT count(*)::int AS count FROM users WHERE status = 'active'`,
    };

    const entries = await Promise.all(
      Object.entries(queries).map(async ([key, sql]) => {
        const { rows } = await pool.query(sql);
        return [key, rows[0].count];
      }),
    );

    return Object.fromEntries(entries);
  }

  async listContactMessages({ status, limit, offset }) {
    const args = [];
    let where = '';
    if (status) {
      args.push(status);
      where = `WHERE status = $${args.length}`;
    }
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT id, name, email, phone, subject, message, status, created_at, updated_at
         FROM contact_messages
         ${where}
         ORDER BY created_at DESC
         LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
        [...args, limit, offset],
      ),
      pool.query(`SELECT count(*)::int AS total FROM contact_messages ${where}`, args),
    ]);
    return { items: rows, total: countRows[0]?.total ?? 0, limit, offset };
  }

  async getContactMessage(id) {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, subject, message, status, created_at, updated_at
       FROM contact_messages WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async updateContactMessageStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE contact_messages SET status = $1, updated_at = now()
       WHERE id = $2 RETURNING id, name, email, subject, message, status, created_at, updated_at`,
      [status, id],
    );
    return rows[0] ?? null;
  }

  async deleteContactMessage(id) {
    const { rowCount } = await pool.query('DELETE FROM contact_messages WHERE id = $1', [id]);
    return rowCount > 0;
  }
}