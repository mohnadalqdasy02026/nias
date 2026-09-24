import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export class TrainingRepository {
  // ---------- Courses ----------
  async listCourses({ status, branchId, page = 1, limit = 20 }) {
    const conditions = [];
    const args = [];
    if (status) {
      args.push(status);
      conditions.push(`c.status = $${args.length}`);
    }
    if (branchId) {
      args.push(branchId);
      conditions.push(`c.branch_id = $${args.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT c.id, c.title, c.description, c.fees, c.start_date, c.end_date,
                c.location, c.capacity, c.trainer, c.status, c.image_url, c.created_at, c.updated_at, c.branch_id,
                b.name_ar AS branch_name_ar,
                (SELECT count(*)::int FROM training_enrollments e
                  WHERE e.course_id = c.id AND e.status <> 'cancelled') AS enrollments_count
         FROM training_courses c
         LEFT JOIN institute_branches b ON b.id = c.branch_id
         ${where}
         ORDER BY c.created_at DESC
         LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
        [...args, limit, (page - 1) * limit],
      ),
      pool.query(`SELECT count(*)::int AS total FROM training_courses c ${where}`, args),
    ]);
    return { items: rows, total: countRows[0]?.total ?? 0, page, limit };
  }

  async getCourse(id) {
    const { rows } = await pool.query(
      `SELECT c.*, b.name_ar AS branch_name_ar
       FROM training_courses c
       LEFT JOIN institute_branches b ON b.id = c.branch_id
       WHERE c.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async createCourse(data) {
    const { rows } = await pool.query(
      `INSERT INTO training_courses (title, description, fees, start_date, end_date, location, capacity, trainer, status, image_url, branch_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [data.title, data.description ?? null, data.fees ?? null, data.start_date ?? null,
       data.end_date ?? null, data.location ?? null, data.capacity ?? null,
       data.trainer ?? null, data.status ?? 'draft', data.image_url ?? null, data.branch_id ?? null],
    );
    return this.getCourse(rows[0].id);
  }

  async updateCourse(id, data) {
    const sets = [];
    const args = [];
    const push = (col, value) => {
      args.push(value);
      sets.push(`${col} = $${args.length}`);
    };
    const fields = ['title', 'description', 'fees', 'start_date', 'end_date', 'location', 'capacity', 'trainer', 'status', 'image_url', 'branch_id'];
    for (const f of fields) {
      if (data[f] !== undefined) push(f, data[f] ?? null);
    }
    if (sets.length === 0) return this.getCourse(id);
    args.push(id);
    await pool.query(`UPDATE training_courses SET ${sets.join(', ')} WHERE id = $${args.length}`, args);
    return this.getCourse(id);
  }

  async deleteCourse(id) {
    const { rowCount } = await pool.query('DELETE FROM training_courses WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // ---------- Trainees ----------
  async findTraineeByPhone(phone) {
    const { rows } = await pool.query(
      'SELECT * FROM training_users WHERE phone = $1 AND status = \'active\' LIMIT 1',
      [phone],
    );
    return rows[0] ?? null;
  }

  async getBranch(id) {
    const { rows } = await pool.query(
      'SELECT id FROM institute_branches WHERE id = $1 AND status = \'active\'',
      [id],
    );
    return rows[0] ?? null;
  }

  async createTrainee({ fullName, phone, branchId, signatureData }) {
    const { rows } = await pool.query(
      `INSERT INTO training_users (full_name, phone, branch_id, signature_image, status)
       VALUES ($1,$2,$3,$4,'active') RETURNING *`,
      [fullName, phone, branchId, signatureData ?? null],
    );
    return rows[0];
  }

  async listTrainees({ page = 1, limit = 20 }) {
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT t.id, t.full_name, t.phone, t.signature_image, t.status, t.created_at,
                b.name_ar AS branch_name,
                (SELECT count(*)::int FROM training_enrollments e WHERE e.trainee_id = t.id) AS enrollments_count
         FROM training_users t
         LEFT JOIN institute_branches b ON b.id = t.branch_id
         ORDER BY t.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, (page - 1) * limit],
      ),
      pool.query('SELECT count(*)::int AS total FROM training_users t'),
    ]);
    return { items: rows, total: countRows[0]?.total ?? 0, page, limit };
  }

  // ---------- Enrollments ----------
  async countEnrollments(courseId) {
    const { rows } = await pool.query(
      'SELECT count(*)::int AS count FROM training_enrollments WHERE course_id = $1',
      [courseId],
    );
    return rows[0].count;
  }

  async listEnrollments({ status, courseId, page = 1, limit = 20 }) {
    const conditions = [];
    const args = [];
    if (status) {
      args.push(status);
      conditions.push(`e.status = $${args.length}`);
    }
    if (courseId) {
      args.push(courseId);
      conditions.push(`e.course_id = $${args.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT e.id, e.trainee_id, e.course_id, e.status, e.enrolled_at, e.created_at,
                t.full_name, t.phone, b.name_ar AS branch_name,
                c.title AS course_title, c.fees, c.capacity, c.status AS course_status
         FROM training_enrollments e
         JOIN training_users t ON t.id = e.trainee_id
         JOIN training_courses c ON c.id = e.course_id
         LEFT JOIN institute_branches b ON b.id = t.branch_id
         ${where}
         ORDER BY e.enrolled_at DESC
         LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
        [...args, limit, (page - 1) * limit],
      ),
      pool.query(
        `SELECT count(*)::int AS total FROM training_enrollments e
         JOIN training_users t ON t.id = e.trainee_id
         JOIN training_courses c ON c.id = e.course_id
         ${where}`,
        args,
      ),
    ]);
    return { items: rows, total: countRows[0]?.total ?? 0, page, limit };
  }

  async getEnrollment(id) {
    const { rows } = await pool.query(
      `SELECT e.id, e.trainee_id, e.course_id, e.status, e.enrolled_at, e.created_at,
              t.full_name, t.phone, t.signature_image, b.name_ar AS branch_name,
              c.title AS course_title, c.status AS course_status, c.capacity, c.fees,
              (SELECT count(*)::int FROM training_enrollments o
                WHERE o.course_id = c.id AND o.status <> 'cancelled') AS enrollments_count
       FROM training_enrollments e
       JOIN training_users t ON t.id = e.trainee_id
       JOIN training_courses c ON c.id = e.course_id
       LEFT JOIN institute_branches b ON b.id = t.branch_id
       WHERE e.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findActiveEnrollment(traineeId, courseId) {
    const { rows } = await pool.query(
      `SELECT * FROM training_enrollments
       WHERE trainee_id = $1 AND course_id = $2 AND status <> 'cancelled' LIMIT 1`,
      [traineeId, courseId],
    );
    return rows[0] ?? null;
  }

  async createEnrollmentWithinCapacity(traineeId, courseId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const course = (
        await client.query(
          `SELECT status, capacity FROM training_courses WHERE id = $1 FOR UPDATE`,
          [courseId],
        )
      ).rows[0];
      if (!course) throw AppError.badRequest('Course does not exist');
      if (course.status !== 'open') throw AppError.badRequest('Registration for this course is closed');
      const { rows } = await client.query(
        `SELECT count(*)::int AS count FROM training_enrollments
          WHERE course_id = $1 AND status <> 'cancelled'`,
        [courseId],
      );
      if (course.capacity != null && rows[0].count >= course.capacity) {
        throw AppError.conflict('Course capacity reached');
      }

      let inserted;
      try {
        inserted = await client.query(
          `INSERT INTO training_enrollments (trainee_id, course_id, status)
           VALUES ($1, $2, 'pending') RETURNING *`,
          [traineeId, courseId],
        );
      } catch (e) {
        if (e.code === '23505') {
          throw AppError.conflict('You already have an active enrollment for this course');
        }
        throw e;
      }
      await client.query('COMMIT');
      return inserted.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async updateEnrollmentStatus(id, status) {
    const { rowCount } = await pool.query(
      `UPDATE training_enrollments SET status = $1 WHERE id = $2`,
      [status, id],
    );
    if (rowCount === 0) return null;
    return this.getEnrollment(id);
  }
}